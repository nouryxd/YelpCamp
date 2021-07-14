const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path')

// So that we can use ejs
app.set('view engine', 'ejs');

// So that the basepath is always the file with
// app.js in it, regardless of where we call it
app.set('views', path.join(__dirname, 'views'))


app.get('/', (req, res) => {
    res.render('home')
})

app.listen(8080, () => {
    console.log('Listening on port 8080')
})