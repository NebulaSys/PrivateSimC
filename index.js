const express = require('express')
const app = express()
const port = process.env.PORT || 8080;

app.post('/', (req, res) => {
    console.log(req.body)
    res.send("Hello World!!")
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

