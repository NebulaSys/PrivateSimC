const express = require('express')
const app = express()
app.use(express.json())
const port = process.env.PORT || 8080;

app.post('/', (req, res) => {
    const a = {};
    if (req.body.hasOwnProperty('type') && req.body.type === 1) {
        res.send(JSON.stringify({
            'type': 1
        }))
    } else {
        res.send("OPPS something went wrong..")
    }
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

