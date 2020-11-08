const express = require('express');
const db = require('./db.js');
const mongoose = require('mongoose');
const Broker = mongoose.model('Broker');
const Realtor = mongoose.model('Realtor');


const username = "Quack"
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
    res.sendFile(__dirname + '/public/signin.html');
});

app.get('/dashboard', (req, res)=>{
    res.render('home');
});
app.get('/salespeople', (req, res) => {
        Broker.find({}, (err, myBrokers) => {
            let name = myBrokers[0].firstName + " " + myBrokers[0].lastName;
            console.log(name)
            Realtor.find({}, (err, myRealtors) => {
                console.log(myRealtors[0]);
                for(let i = 0; i < myRealtors.length; i++){
                    myBrokers[0].salespeople.push(myRealtors[i]);
                }
            })
            // console.log("BROKER: ", myBrokers[0])
            res.render('salesPeople', {salespeople: myBrokers[0].salespeople});
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
