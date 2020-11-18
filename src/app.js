const express = require('express');
const multer = require('multer')
const path = require('path')
const fs = require('fs');
const csv = require('fast-csv')
const crypto = require('crypto');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const db = require('./db.js');



const User = mongoose.model('User');
const Broker = mongoose.model('Broker');
const Realtor = mongoose.model("Realtor");
app.set('view engine', 'hbs');


const storage = multer.diskStorage({ //Used for dynamic naming of images https://www.digitalocean.com/community/tutorials/nodejs-uploading-files-multer-express
    destination: './public',
    filename: function (req, file, callback) {
      crypto.pseudoRandomBytes(16, function(err, raw) {
        if (err) {return callback(err);}

        callback(null, raw.toString('hex') + path.extname(file.originalname));
      });
    }
  });
  const upload = multer({ storage: storage });


app.use(bodyParser.urlencoded({extended: true}));



app.use(bodyParser.json());

app.use(require("express-session")({
    secret: "Secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




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
    app.use(formCleaner)
}
use();

io.on('connection', function(socket){ 
     console.log('a user connected'); 
         io.emit('message', "Welcome to your messages.") 
         socket.broadcast.emit('message', "A user has joined the chat"); 
         socket.on('disconnect', () => { 
         io.emit('message', "A user has left the chat")     }) 
         socket.on('chatMessage', (msg) => { 
           io.emit('message', msg);     }) 
             }); 

app.get("/", function (req, res) {
    res.render("home");
});
app.get("/register", function (req, res) {
    res.render("register");
});

// Handling user signup
app.post("/register", function (req, res) {
  var username = req.body.username
  var password = req.body.password
  var brokerage = req.body.brokerage
  var accountType = req.body.accountType
  var name = req.body.name


  let Users = new User({username: username, account: accountType});
    User.register(Users,
            password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }

        passport.authenticate("local")(
            req, res, function () {
            if(accountType == "R"){
              let newRealtor = new Realtor({name: name, username: username,  brokerage: brokerage})
              newRealtor.save((err, myRealtor) => {
                  if(err) {console.log(err)} else{console.log(myRealtor.name, " SUCCESSFULLY ADDED")}
              });
            }
            else{
              let newBroker = new Broker({name: name, username: username, brokerage: brokerage})
              newBroker.save((err, newBroker) => {
                  if(err) {console.log(err)} else{console.log(newBroker.name, " SUCCESSFULLY ADDED")}
              });
            }
            res.render("listings");
        });
    });
});



/*
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
*/

app.get("/login", function (req, res) {
    res.render("signin");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/listings",
    failureRedirect: "/login"
}), function (req, res) {
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
}



/*
app.get('/',  connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    res.render('signin');
});



*/

//Note: you have access to req.user.username and we want to show ONLY that
// broker's salespeople
app.get('/salespeople', isLoggedIn, (req, res) => {
        console.log("QUERY: ", req.query)
        Broker.find({username: req.user.username}, (err, myBrokers) => {
            //let name = myBrokers[0].firstName + " " + myBrokers[0].lastName;
            let queryName = req.query.name;
            let queryListings = req.query.listings;
            let queryUsername = req.query.username;

              //  Realtor.findOne({}, (err, myRealtors) => {
                    if(myBrokers.salespeople == undefined){
                      res.render('salespeople');
                    }
                    else{
                        const filteredRealtors = myBrokers.salespeople.filter((a) => {

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
                            myBrokers.salespeople.push(filteredRealtors[j]);
                        }
                  //  })


                // console.log("BROKER: ", myBrokers[0])
                res.render('salesPeople', {salespeople: myBrokers.salespeople});
          }
        })



});
app.get('/performance', isLoggedIn, (req,res) => {
  let lists = [];

  Realtor.findOne({username: req.user.username}, (err, real)=>{
    let listings = real.listings;
    lists = real.listings;
    let cityListings = [];


    // get the average -- this works
    const averageAll = listings.reduce(function(total, curr){
      const add = parseInt(curr.listprice);
      if(Number.isNaN(add)===false && add>=0){
        return total += add;}
        else{ return total;}
      },0) / listings.length;

      console.log(averageAll);


    })//end of realtor.findONe
    console.log("hello there", lists);
    /*

    for(let i=0; i<listings.length; i++){
      if(cityListings[i] != undefined && cityListings[i]!= null){
        if(cityListings[i].city === curr.city){
          cityListings[i].num += 1;
          cityListings[i].price += parseInt(curr.listingprice);
          check = 1;
        }
    }
    else{
        cityListings.push({city: curr.city, num: 1, price: parseInt(curr.listingprice)});
      }
    }

*/


    res.render('performance')
}); // end of the get for performance

// this gets the form data, gets the realtor by username, and then adds the listing.
// i have a hardcoded username in there now. Will need to update that.
app.post('/listings', (req, res)=> {
  //get the form data and make a listing out of it
  let listing = {
    address: req.body.address,
    listprice: req.body.listprice,
    clientName: req.body.clientName,
    listDate: req.body.listDate,
    city: req.body.city,
    status: req.body.status
  }
  if(listing.address !== ""){ //make sure listing has an address at least

    Realtor.findOne({username: req.user.username}, (err, real)=>{
      let listings = real.listings;
      listings.push(listing);
      Realtor.updateOne({username: req.user.username}, {$set: {listings: listings}}, function(err, resp) {
          if(err){console.log(err)}
          else{console.log("Successful: ", resp.result)}
    });
    console.log(listings);
    });



    res.redirect("listings");
}
else{
  res.redirect("listings");
}
});

// display listings here
app.get('/listings', isLoggedIn, (req, res) => {
    let type = req.user.account;
    if(type=="R"){
      Realtor.findOne({username: req.user.username}, (err, myRealtor)=>{
        res.render('listings', {data: myRealtor.listings});
      });
    }else{
      Broker.findOne({username: req.user.username}, (err, myBroker)=>{
        res.render('listings', {data: myBroker.listings});
      })
    }
});
app.get('/data',isLoggedIn, (req, res) => {

    Realtor.findOne({username: req.user.username}, (err, myRealtor) => {
        res.render('data', {data: encodeURIComponent(JSON.stringify(myRealtor.data))});
    })

});
app.post('/data', upload.single('csvData'), (req, res) => {
    if(req.file.mimetype !== "text/csv"){
        res.send("Wrong file type");
        return;
      }
    let fileRows = [];
    csv.parseFile(req.file.path)
    .on("data", function (data) {
      fileRows.push(data); // push each row
    })
    .on("end", function () {
      console.log(fileRows) //contains array of arrays. Each inner array represents row of the csv file, with each element of it a column
      fs.unlinkSync(req.file.path);   // remove temp file
      //process "fileRows" and respond
      setRealtorData();
    })
    let setRealtorData = () => {
        let userData = []
        for(let i = 0; i < fileRows.length; i++){
        for(j = 0; j < fileRows[i].length; j++){
            fileRows[i][j] = parseFloat(fileRows[i][j])
        }

        userData.push({lat: fileRows[i][0], long: fileRows[i][1]})
        }
        console.log(userData);
        Realtor.updateOne({username: req.user.username}, {$set: {data: userData}}, function(err, resp) {
            if(err){console.log(err)}
            else{console.log("Successful: ", resp.result)}
    })
    res.redirect('/data')
    }

})
app.get('/messages',/* connectEnsureLogin.ensureLoggedIn(),*/ (req, res) => {
    res.render('messages')
});

app.get('/messages', isLoggedIn,  (req, res) => {
    res.render('messages')
});
app.post('/salespeople', (req, res) => {

        let newRealtor = new Realtor({name: req.body.name, username: req.body.username, broker: req.user.username})
            newRealtor.save((err, myRealtor) => {
            if(err) {console.log(err)} else{
              console.log(myRealtor.name, " SUCCESSFULLY ADDED")
              Broker.findOne({username: req.user.username}, (err, newB)=>{
                newB.salespeople.push(myRealtor);
              });
            }

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

server.listen(process.env.PORT || 3000, function(){     console.log('listening on *:3000');   });
