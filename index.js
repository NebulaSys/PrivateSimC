const express = require('express')
const { spawn, exec } = require('child_process');
var path = require('path');

const verify = require('./verify')
const app = express()
const port = process.env.PORT || 8080;

// exec('bash -c ./simc', (error, stdout, stderr) => {
//     if (error) {
//         console.error(`error: ${error.message}`);
//         return;
//     }

//     if (stderr) {
//         console.error(`stderr: ${stderr}`);
//         return;
//     }

//     console.log(`stdout:\n${stdout}`);

// })

app.use(express.json())

// app.use(function (req, res, next) {
//     console.log(JSON.stringify(req.headers));
//     console.log(JSON.stringify(req.body));

//     const verified = verify.Verify(req.get('X-Signature-Ed25519'), req.get('X-Signature-Timestamp'), JSON.stringify(req.body));
//     if (!verified) {
//         res.status(401).send('invalid request signature');
//         return;
//     }
//     next();
// });

app.get('/simc/:server/:realm/:char', (req, res) => {
    if (req.params.hasOwnProperty('server') && req.params.hasOwnProperty('realm') && req.params.hasOwnProperty('char')) {
        const server = req.params.server;
        const realm = req.params.realm;
        const char = req.params.char;
        console.log("server", server);
        console.log("realm", realm);
        console.log("char", char);
        const sim = exec(`./simc armory=${server},${realm},${char} calculate_scale_factors=1 html=${char}.html`);
        // const sim = exec(`./simc armory=${server},${realm},${char} html=${char}.html`);
        // const sim = exec(`./simc armory=us,illidan,punxious html=a.html`);
        
        
        sim.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        sim.stderr.on('data', (data) => {
            console.log(`ERROR!!! ${data}`)
          });
        sim.on('close', (code) => {
            res.sendFile(path.join(__dirname + `/${char}.html`));
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