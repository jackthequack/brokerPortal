const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
const db = require('./db.js');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const Realtor = mongoose.model('Realtor');
const Broker = mongoose.model('Broker');
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({extended: true}));
const session = require('express-session');
const sessionOptions = {
    secret: 'secret',
    resave: false,
    saveUninitialized: false
};

app.use(bodyParser.json());
app.use(session(sessionOptions));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Realtor.authenticate()));
passport.serializeUser(Realtor.serializeUser());
passport.deserializeUser(Realtor.deserializeUser());

passport.use(new LocalStrategy(Broker.authenticate()));
passport.serializeUser(Broker.serializeUser());
passport.deserializeUser(Broker.deserializeUser());


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

    app.use(logger)
    //app.use(formCleaner)
}
use();

app.get("/", function (req, res) {
    res.render("home");
});
app.get("/register", function (req, res) {
    res.render("register");
});
app.post("/register", function (req, res) {
    var username = req.body.username
    var password = req.body.password
    var brokerage = req.body.brokerage
    var accountType = req.body.accountType
    var name = req.body.name

    if(accountType == 'R'){
      Realtor.register(new Realtor({ username: username, brokerage: brokerage, name: name}),
              password, function (err, user) {
          if (err) {
              console.log(err);
              return res.render("register");
          }

          passport.authenticate("local")(
              req, res, function () {
              res.render("listings");
          });
      });
  }


    else{
      Broker.register(new Broker({ username: username, brokerage: brokerage, name: name}),
              password, function (err, user) {
          if (err) {
              console.log(err);
              return res.render("register");
          }

          passport.authenticate("local")(
              req, res, function () {
              res.render("listings");
          });
      });
    }


});

app.get("/login", function (req, res) {
    res.render("signin");
});

app.post("/login", passport.authenticate("local", {successRedirect: '/listings', failureRedirect: '/login'}));


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
}



/*
app.get('/',  connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    res.render('signin');
});

app.get('/dashboard', connectEnsureLogin.ensureLoggedIn(),(req, res)=>{
    res.render('home');
});

*/
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
app.get('/performance',  (req,res) => {
    res.render('performance')
})
app.get('/listings',  (req, res) => {
    res.render('listings')
})
app.get('/data', (req, res) => {
    res.render('data');
});
app.get('/messages',  (req, res) => {
    res.render('messages')
});
app.post('/salespeople', (req, res) => {

        let newRealtor = new Realtor({name: req.body.name, username: req.body.username, password: req.body.password, broker: "John Doe"})
        newRealtor.save((err, myRealtor) => {
            if(err) {console.log(err)} else{console.log(myRealtor.name, " SUCCESSFULLY ADDED")}

        });

    res.redirect('/salespeople')

})
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

/*
app.get('/user',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.send({user: req.user})
);
*/

app.listen(process.env.PORT || 3000)
