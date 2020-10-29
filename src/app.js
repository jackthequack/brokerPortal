const express = require('express');
const db = require('./db.js');

const app = express();

const logger = (req, res, next) => {
    console.log(req.method)
    console.log(req.path)
    console.log(req.query)
    next();
}

const use = () => {
    app.use(express.static('public'));
    app.set('view engine', 'hbs');
    app.use(express.urlencoded({extended: false}));    
    app.use(logger)
}
use();

app.get('/', (req, res) => {
    res.render('home')
})

app.listen(3000)