const express = require('express');
const db = require('./db.js');
const mongoose = require('mongoose');
const Broker = mongoose.model('Broker');
const Realtor = mongoose.model('Realtor');


const username = "Quack"
const app = express();
console.log(Broker)
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
    res.sendFile(__dirname + '/public/signin.html');
});

app.get('/dashboard', (req, res)=>{
    res.render('home');
});
app.get('/salespeople', (req, res) => {
    Broker.create({firstName: "John", lastName: "Doe", brokerageName: "Remax", username: "Quack", password: "abc"})
    Broker.find({}, (err, myBrokers) => { 
        console.log(myBrokers) //This is printing out nothing
        res.render('salespeople', {salesPeople: myBrokers.salespeople});
    })
    
});
app.get('/performance', (req,res) => {
    res.render('performance')
})
app.get('/listings', (req, res) => {
    res.render('listings')
})
app.get('/data', (req, res) => {
    res.render('data')
});
app.get('/messages', (req, res) => {
    res.render('messages')
});


app.listen(4000)
