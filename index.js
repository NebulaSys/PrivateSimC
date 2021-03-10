const express = require('express')
const { execFile, exec } = require('child_process');
const verify = require('./verify')
const app = express()
const port = process.env.PORT || 8080;

exec('bash -c ./simc', (error, stdout, stderr) => {
    if (error) {
        console.error(`error: ${error.message}`);
        return;
    }

    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout:\n${stdout}`);

})

exec('ls', (error, stdout, stderr) => {
    if (error) {
        console.error(`error: ${error.message}`);
        return;
    }

    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout:\n${stdout}`);

})
app.use(express.json())

app.use(function (req, res, next) {
    console.log(JSON.stringify(req.headers));
    console.log(JSON.stringify(req.body));

    const verified = verify.Verify(req.get('X-Signature-Ed25519'), req.get('X-Signature-Timestamp'), JSON.stringify(req.body));
    if (!verified) {
        res.status(401).send('invalid request signature');
        return;
    }
    next();
});

app.get('/', (req, res) => {
    res.send("Hello World!!")
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