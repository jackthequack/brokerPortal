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

const formCleaner = (req, res, next) => {
    for(const i in req.query){
        if(req.query[i] == ""){
            delete req.query[i]
        }
    }
    next();
}

const use = () => {
    app.use(express.static('public'));
    app.set('view engine', 'hbs');
    app.use(express.urlencoded({extended: false}));
    app.use(logger)
    app.use(formCleaner)
}
use();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/signin.html');
});

app.get('/dashboard', (req, res)=>{
    res.render('home');
});
app.get('/salespeople', (req, res) => {
        console.log("QUERY: ", req.query)
        Broker.find({}, (err, myBrokers) => {
            let name = myBrokers[0].firstName + " " + myBrokers[0].lastName;
            let queryName = req.query.name;
            let queryListings = req.query.listings;
            let queryUsername = req.query.username;
                Realtor.find({}, (err, myRealtors) => {
                   
                    const filteredRealtors = myRealtors.filter((a) => {
                        
                        if(a["name"] === queryName || a["listings"] === queryListings || a["username"] === queryUsername){
                            return true;
                        }
                        else if(Object.keys(req.query).length === 0){
                            return true;
                        }
                        else{false;}
                    })
                    console.log("FILTERED REALTORS: ", filteredRealtors)
                    for(let j = 0; j < filteredRealtors.length; j++){
                        myBrokers[0].salespeople.push(filteredRealtors[j]);
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
app.post('/salespeople', (req, res) => {

        let newRealtor = new Realtor({name: req.body.name, username: req.body.username, password: req.body.password, broker: "John Doe"})
        newRealtor.save((err, myRealtor) => {
            if(err) {console.log(err)} else{console.log(myRealtor.name, " SUCCESSFULLY ADDED")}
            
        });
    
    res.redirect('/salespeople')

})

app.listen(process.env.PORT || 3000)
