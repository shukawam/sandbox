const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(30000);

app.get('/hello', (req, res) => {
    console.log('Incoming request headers.');
    console.log(req.headers);
    res.send('Hello World!');
});