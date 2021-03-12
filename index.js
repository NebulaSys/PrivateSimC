const express = require('express')
const { exec } = require('child_process');
const { Storage } = require('@google-cloud/storage');
const fetch = require('node-fetch');
const app = express()
const port = process.env.PORT || 8080;
const APP_ID = "817541091724886028";
const BASE_URL = "https://discord.com/api/v8"
app.use(express.json())

async function startSim(server, realm, char){

}

app.post('/simc/:server/:realm/:char', (req, res) => {
    if (req.params.hasOwnProperty('server') && req.params.hasOwnProperty('realm') && req.params.hasOwnProperty('char')) {
        console.log("req.body: ", req.body)
        if (!req.body || !req.body.interactionToken || !req.body.userId) {
            res.send("Request Body is Wrong...");
            return;
        }
        const interactionToken = req.body.interactionToken
        const userId = req.body.userId
        const server = req.params.server;
        const realm = req.params.realm;
        const char = req.params.char;
        const bucketName = 'simc.intertrick.com';
        const filename = `./${char}.html`;
        const timestamp = new Date().toISOString();
        destination = `${server}/${realm}/${char}.${timestamp}.html`

        console.log("server", server);
        console.log("realm", realm);
        console.log("char", char);

        // const sim = exec(`./simc armory=${server},${realm},${char} calculate_scale_factors=1 html=${char}.html`);
        const sim = exec(`./simc armory=${server},${realm},${char} html=${char}.html`);

        sim.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        sim.stderr.on('data', (data) => {
            console.log(`ERROR!!! ${data}`);
        });
        sim.on('close', async (code) => {
            const storage = new Storage();

            // const sim = exec(`./simc armory=${server},${realm},${char} html=${char}.html`);
            // const sim = exec(`./simc armory=us,illidan,punxious html=a.html`);
            await storage.bucket(bucketName).upload(filename, {
                // By setting the option `destination`, you can change the name of the
                // object you are uploading to a bucket.
                destination: destination,
                metadata: {
                    cacheControl: 'public, max-age=31536000',
                },
            });
            console.log(`${filename} uploaded to ${bucketName}.`);
            const message = {
                "type": 4,
                "tts": false,
                "content": `<@${userId}> Result page - http://${bucketName}/${destination}`,
                "allowed_mentions": { "users": [userId] }
            }
            const messRes = await fetch(`${BASE_URL}/webhooks/${APP_ID}/${interactionToken}`, {
                method: 'post',
                body: JSON.stringify(message),
                headers: { 'Content-Type': 'application/json' }
            });
            const messResult = await messRes.json();
            console.log("messResult: ", messResult);
            res.send(`http://${bucketName}/${destination}`);
            // res.redirect(`http://simc.intertrick.com/${destination}`);
        });
    } else {
        res.send("Something went wrong...")
        return;
    }
});

app.post('/simc', (req, res) => {
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

    const pubSubMessage = req.body.message;
    const message = pubSubMessage.data
        ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
        : 'World';

    console.log(`${message}`);
    res.status(200).send();
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${port}`)
});