const express = require('express');
const db = require('./db.js');
const mongoose = require('mongoose');
const Broker = mongoose.model('Broker');
const Realtor = mongoose.model('Realtor');
//const passportLocalMongoose = require('passport-local-mongoose');
//const connectEnsureLogin = require('connect-ensure-login');
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
/*
note: need to add the HTML and CSS to work with this
and maybe will need to switch some things around interms
of how we're storing the user and pass in db

const session = require('express-session');
const sessionOptions = {
    secret: 'secret',
    resave: false,
    saveUninitialized: false
};

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session(sessionOptions));

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

passport.use(Realtor.createStrategy());
passport.serializeUser(Realtor.serializeUser());
passport.deserializeUser(Realtor.deserializeUser());

passport.use(Broker.createStrategy());
passport.serializeUser(Broker.serializeUser());
passport.deserializeUser(Broker.deserializeUser());

app.post('/', (req, res, next)=>{
  passport.authenticate('local', (err, user, info)=>{
    if(err){return next(err);}
    if(!user){

      return res.redirect('/?info'+info);
    }
    req.logIn(user, function(err){
      if(err){
        return next(err);
      }
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});
*/

app.get('/', (req, res) => {
    res.render('signin');
});

app.get('/dashboard', /* connectEnsureLogin.ensureLoggedIn(),*/(req, res)=>{
    res.render('home');
});
app.get('/salespeople',/* connectEnsureLogin.ensureLoggedIn(),*/ (req, res) => {
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
app.get('/performance',/* connectEnsureLogin.ensureLoggedIn(),*/ (req,res) => {
    res.render('performance')
})
app.get('/listings',/* connectEnsureLogin.ensureLoggedIn(),*/ (req, res) => {
    res.render('listings')
})
app.get('/data',/* connectEnsureLogin.ensureLoggedIn(),*/ (req, res) => {
    res.render('data')
});
app.get('/messages',/* connectEnsureLogin.ensureLoggedIn(),*/ (req, res) => {
    res.render('messages')
});
app.post('/salespeople',/* connectEnsureLogin.ensureLoggedIn(),*/ (req, res) => {

        let newRealtor = new Realtor({name: req.body.name, username: req.body.username, password: req.body.password, broker: "John Doe"})
        newRealtor.save((err, myRealtor) => {
            if(err) {console.log(err)} else{console.log(myRealtor.name, " SUCCESSFULLY ADDED")}

        });

    res.redirect('/salespeople')

})

/*
app.get('/user',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.send({user: req.user})
);
*/

app.listen(process.env.PORT || 3000)
