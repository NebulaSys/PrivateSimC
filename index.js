const express = require('express')
const { spawn, exec } = require('child_process');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const verify = require('./verify')
const app = express()
const port = process.env.PORT || 8080;
app.use(express.json())

app.post('/simc/:server/:realm/:char', (req, res) => {
    if (req.params.hasOwnProperty('server') && req.params.hasOwnProperty('realm') && req.params.hasOwnProperty('char')) {
        console.log("req.body: ", req.body)

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
            console.log(`ERROR!!! ${data}`)
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
                    // Enable long-lived HTTP caching headers
                    // Use only if the contents of the file will never change
                    // (If the contents will change, use cacheControl: 'no-cache')
                    cacheControl: 'public, max-age=31536000',
                },
            });
            console.log(`${filename} uploaded to ${bucketName}.`);
            res.send(`http://${bucketName}/${destination}`);
            // res.redirect(`http://simc.intertrick.com/${destination}`);
        });
    } else {
        res.send("Something went wrong...")
    }
});

app.post('/', (req, res) => {
    if (req.body.hasOwnProperty('type') && req.body.type === 1) {
        res.send({
            'type': 1
        });
    } else {
        res.send("OPPS something went wrong..");
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${port}`)
});