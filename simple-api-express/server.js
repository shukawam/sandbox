const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(30000);

// Simply shows HTTP Request Headers and Query Parameters.
app.get('/header-query-logging/:name', (req, res) => {
    const now = Date.now();
    console.log(`${now}: Request Headers`);
    console.log(req.headers);
    if ('required-header' in req.headers) {
        console.log('ok');
    }
    console.log(`${now}: Request Path`);
    console.log(req.params);
    res.send(`Hello ${req.params.name}`);
});

// Requires specific HTTP Request Header(required-header).
app.get('/require-header', (req, res) => {
    console.log('required-header' in req.headers);
    if ('required-header' in req.headers === false) {
        console.log('Missing required-header in HTTP Request Headers.');
        res.send('Missing required-header in HTTP Request Headers.');
    } else {
        res.send(`Include specific HTTP Request Header!`);
    }
});

// Delete "Server" Header.
app.get('/delete-server-header', (req, res) => {
    res.send('Hello');
});