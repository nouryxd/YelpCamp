const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection refused:'));
db.once('open', () => {
    console.log('Connected to database');
});

const app = express();

// So that we can use ejs
app.set('view engine', 'ejs');

// So that the basepath is always the file with
// app.js in it, regardless of where we call it
app.set('views', path.join(__dirname, 'views'))


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
   const campgrounds = await Campground.find({}) 
   res.render('campgrounds/index', { campgrounds })
})

app.listen(8080, () => {
    console.log('Listening on port 8080')
})