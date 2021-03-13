const express = require('express')
const { exec } = require('child_process');
const { Storage } = require('@google-cloud/storage');
const fetch = require('node-fetch');
const { resolve } = require('path');
const app = express()
const port = process.env.PORT || 8080;
const APP_ID = "817541091724886028";
const BASE_URL = "https://discord.com/api/v8"
const BUCKET_NAME = "simc.intertrick.com"
const HANDLED = [];
app.use(express.json())

async function startSim(server, realm, char, destination, args) {
    console.log("server", server);
    console.log("realm", realm);
    console.log("char", char);
    const filename = `./${char}.html`;
    return new Promise((resolve, reject) => {
        const sim = exec(`./simc armory=${server},${realm},${char} ${args.scale ? 'calculate_scale_factors=1 ' : ''}html=${char}.html`);

        sim.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        sim.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        sim.on("error", err => {
            console.log(`err: ${err}`)
            reject(false);
        });

        sim.on('close', async (code) => {
            const storage = new Storage();
            await storage.bucket(BUCKET_NAME).upload(filename, {
                // By setting the option `destination`, you can change the name of the
                // object you are uploading to a bucket.
                destination: destination,
                metadata: {
                    cacheControl: 'public, max-age=31536000',
                },
            });
            console.log(`${filename} uploaded to ${BUCKET_NAME}.`);
            resolve(true);
        });
    })
}

app.post('/simc', async (req, res) => {
    if (!req.body) {
        const msg = 'no Pub/Sub message received';
        console.error(`error: ${msg}`);
        res.status(200).send(`Bad Request: ${msg}`);
        return;
    }

    if (!req.body.message) {
        const msg = 'invalid Pub/Sub message format';
        console.error(`error: ${msg}`);
        res.status(200).send(`Bad Request: ${msg}`);
        return;
    }

    if(HANDLED.includes(req.body.message.messageId)){
        const msg = 'Message has been handled';
        console.log(`${msg}`);
        res.status(200).send(`Repeated Request: ${msg}`);
        return;
    }
    HANDLED.push(req.body.message.messageId);

    const pubSubMessage = req.body.message;
    const profileMessage = pubSubMessage.data
        ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
        : 'World';

    const profile = JSON.parse(profileMessage);
    if (!profile.interactionToken || !profile.userId || !profile.server || !profile.realm || !profile.char) {
        res.send("Missing param...")
        return;
    }
    const interactionToken = profile.interactionToken
    const userId = profile.userId
    const server = profile.server;
    const realm = profile.realm;
    const char = profile.char;
    const timestamp = new Date().toISOString();
    const destination = `${server}/${realm}/${char}.${timestamp}.html`
    const simArgs = profile.args || {};
    await startSim(server, realm, char, destination, simArgs);

    const message = {
        "type": 4,
        "tts": false,
        "content": `<@${userId}> Result page - http://${BUCKET_NAME}/${destination}`,
        "allowed_mentions": { "users": [userId] }
    }
    const messRes = await fetch(`${BASE_URL}/webhooks/${APP_ID}/${interactionToken}`, {
        method: 'post',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' }
    });
    const messResult = await messRes.json();
    // console.log("messResult: ", messResult);
    res.send(`http://${BUCKET_NAME}/${destination}`);
    res.status(200).send();
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${port}`)
});