const express = require('express');
const db = require('./db.js');
const mongoose = require('mongoose');
const Broker = mongoose.model('Broker');
const Realtor = mongoose.model('Realtor');

const app = express();

const logger = (req, res, next) => {
    console.log(req.method)
    console.log(req.path)
    console.log(req.query)
    next();
}

const use = () => {
    app.use(express.static('public'));
    //app.set('view engine', 'hbs');
    app.use(express.urlencoded({extended: false}));
    app.use(logger)
}
use();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/signin.html');
});

app.get('/dashboard', (req, res)=>{
    res.sendFile(__dirname + '/public/dashboard.html');
});
app.get('/salespeople', (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});



app.listen(3000)
