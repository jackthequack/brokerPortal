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
const Chart = require('chart.js');
const cma= require('./cmaAPI.js'); //cma API

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

/*
app.use(require("express-session")({
    secret: "Secret",
    resave: false,
    saveUninitialized: false
}));
*/

let session = require("express-session");

let sessionMiddleware = session({
  secret: "Secret",
  resave: false,
  saveUninitialized: false,
 // store: new (require("connect-mongo")(session))({
   // url: "mongodb://localhost/portal"})
})
app.use(sessionMiddleware);


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


function middleCare(req, res, next){
  if(req.user != undefined){
    req.session.nameofuser = req.user.username;
    res.locals.name = req.session.nameofuser;
  }


  next();
}
app.use(middleCare);

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

const botName = "Moderator"


const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
// io.use((socket, next) => {
//   if (socket.request.user) {
//     next();
//   } else {
//     next(new Error('unauthorized'))
//   }
// });
const moment = require('moment');
const formatMessage = (username, text) => {
    return {username,
        text,
        time: moment().format('h:mm a')}
}

io.on('connection', function(socket){
  // const username = socket.request.user.username
  // let username = socket.request.session.passport.user;
  console.log(socket.request.user)
  console.log('a user connected');
  socket.emit('message', formatMessage(botName, "Welcome to your messages."))
  socket.on('chatMessage', (msg) => {
      console.log(msg)
      socket.emit('message', formatMessage(socket.request.user.username, msg));
      socket.broadcast.emit('message', formatMessage(socket.request.user.username, msg))
  })
  const session = socket.request.session;
  console.log(`saving sid ${socket.id} in session ${session.id}`);
  session.socketId = socket.id;
  session.save();
})

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
              let newRealtor = new Realtor({name: name, username: username, password: password, brokerage: brokerage})
              newRealtor.save((err, myRealtor) => {
                  if(err) {console.log(err)} else{console.log(myRealtor.name, " SUCCESSFULLY ADDED")}
              });
            }
            else{
	      console.log("if working")
              let newBroker = new Broker({name: name, username: username, brokerage: brokerage})
              newBroker.save((err, newBroker) => {
		  console.log("newBroker working", newBroker)
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
        Broker.findOne({username: req.user.username}, (err, myBrokers) => {
            //let name = myBrokers[0].firstName + " " + myBrokers[0].lastName;
	    if(myBrokers==null){
		res.render('salesPeople');}
	    else{
	
            let queryName = req.query.name;
            let queryListings = req.query.listings;
            let queryUsername = req.query.username;

              //  Realtor.findOne({}, (err, myRealtors) => {
                    if(myBrokers.salespeople == undefined){
                      res.render('salesPeople');
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
                       // for(let j = 0; j < filteredRealtors.length; j++){
                         //   myBrokers.salespeople.push(filteredRealtors[j]);
                       // }
                  //  })


                // console.log("BROKER: ", myBrokers[0])
                res.render('salesPeople', {salespeople: filteredRealtors});
          }
	 }
        })



});
app.get('/performance', isLoggedIn, (req,res) => {
      console.log("hello");
      console.log(req.user.username + "");
      res.render('performance');
}); // end of the get for performance

//API to get data and send back to mychart.js
app.get('/api/data', (req, res) =>{
 if(req.user.account == "R"){
  Realtor.find({username: req.user.username}, (err, realtors, count)=>{
    res.json(realtors.map(function(ele){
      return{
        'listings': ele.listings
      };
    }));
    });
  }
  else{
    Broker.find({username: req.user.username}, (err, brokers, count)=>{
    res.json(brokers.map(function(ele){
      return{
	'listings': ele.listings
      };
    }));
    });
  }
});

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
    status: req.body.status,
    dom: 0
  }
  if(listing.address !== ""){ //make sure listing has an address at least
    if(req.user.account == "R"){
   	 Realtor.findOne({username: req.user.username}, (err, real)=>{
     	 let listings = real.listings;
     	 listings.push(listing);
     	 Realtor.updateOne({username: req.user.username}, {$set: {listings: listings}}, function(err, resp) {
         	 if(err){console.log(err)}
         	 else{console.log("Successful: ", resp.result)}
    });
    console.log(listings);
    });
    }
    else{
	Broker.findOne({username: req.user.username}, (err, real)=>{
      console.log(real)
	let listings = real.listings;
      listings.push(listing);
      Broker.updateOne({username: req.user.username}, {$set: {listings: listings}}, function(err, resp){
          if(err){console.log(err)}
          else{console.log("Successful: ", resp.result)}
   	 });
   	 console.log(listings);
   	 });
	}
 



    res.redirect("listings");
}
else{
  res.redirect("listings");
}
});

// display listings here
app.get('/listings', isLoggedIn, (req, res) => {
    console.log(req.user.username)
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

app.get('/data', isLoggedIn, (req, res) => {
	
    Realtor.findOne({username: req.user.username}, (err, myRealtor) => {
        if(myRealtor){
		res.render('data', {data: encodeURIComponent(JSON.stringify(myRealtor.data))});
	}
	else{
		Broker.findOne({username: req.user.username}, (err, myBroker) => {
			res.render('data', {data: encodeURIComponent(JSON.stringify(myBroker.data))})
		});
	}
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
	if(req.user.account == 'R'){
        Realtor.updateOne({username: req.user.username}, {$set: {data: userData}}, function(err, resp) {
            if(err){console.log(err)}
            else{console.log("Successful: ", resp.result)}
	 })
	}
	else{
	Broker.updateOne({username: req.user.username}, {$set: {data: userData}}, function(err, resp) {
            if(err){console.log(err)}
            else{console.log("Successful: ", resp.result)} 
         })
        }
    res.redirect('/data')
    }

})
app.get('/messages', isLoggedIn,  (req, res) => {
    //let name = {name: req.user.username};
    res.render('messages');
});


app.post('/salespeople',  (req, res) => {
	if(req.user.account == "R"){res.redirect('/salespeople')}
	else{
       	 let newRealtor = new Realtor({name: req.body.name, username: req.body.username, password: req.body.password, broker: req.user.username})
            newRealtor.save((err, myRealtor) => {
            if(err) {console.log(err)} else{
	      console.log(myRealtor)
	      console.log(req.user.username)
              console.log(myRealtor.name, " SUCCESSFULLY ADDED")
              Broker.findOne({username: req.user.username}, (err, newB)=>{
		console.log(newB)
                newB.salespeople.push(myRealtor);
		console.log(newB)
		Broker.updateOne({username: newB.username}, {salespeople: newB.salespeople}, function(err, result) {
		if(err){console.log(err)} else{console.log(result)}
		})
              });
            }

        });
	   res.redirect('/salespeople')

	}
    

})
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/cma", upload.single('csvData'), function(req, res){

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
    //console.log(fileRows) //contains array of arrays. Each inner array represents row of the csv file, with each element of it a column
    //stats = cma.getSummaryStatistics(fileRows);
    fs.unlinkSync(req.file.path);   // remove temp file
    setRealtorData(fileRows);
    //process "fileRows" and respond
  })
  let setRealtorData = (data) => {
      new Promise(function(resolve, reject){
          let stats = cma.getSummaryStatistics(data);
          resolve(stats);



      }).then(function(result){
        console.log(result);
        //console.log("stats are"+result);
	if(req.user.account == "R"){

	        Realtor.updateOne({username: req.user.username}, {$set: {stats: undefined}}, function(err, resp) {
        	    if(err){console.log(err)}
           	    else{console.log("Successful! ")}
         	 })
       		 Realtor.updateOne({username: req.user.username}, {$set: {stats: result}}, function(err, resp) {
             		 if(err){console.log(err)}
             		 else{console.log("Successful! ")}
           	 })
	}
	else{
		console.log("WORKING!!!")
		Broker.updateOne({username: req.user.username}, {$set: {stats: undefined}}, function(err, resp) {
                    
		    if(err){console.log(err)}
                    else{console.log("Successful! ")}
                 })
                 Broker.updateOne({username: req.user.username}, {$set: {stats: result}}, function(err, resp) {
                         if(err){console.log(err)}
                         else{console.log("Successful! ")}
                 })
		Broker.findOne({username: req.user.username},  function(err, myBroker) {
			if(err){console.log(err)}
			else{console.log(myBroker)}
		})
	}
      });


      //let result = Promise.resolve(fileRows);
      //console.log(stats);

      //console.log("stats are "+stats);

        res.redirect('/cma');
  }

  //console.log(fileRows);

})

//pickup here tomorrow! use the decode and json parse to get the data and make the charts

app.get("/cma", isLoggedIn, (req,res)=>{
  if(req.user.account == "R"){
	  Realtor.findOne({username: req.user.username}, (err, myRealtor) => {
    	  res.render('cma', {stats: encodeURIComponent(JSON.stringify(myRealtor.stats))});
 	   })
   }
  else{
	console.log("working")
	 Broker.findOne({username: req.user.username}, (err, myBroker) => {
         	console.log(myBroker)
		 res.render('cma', {stats: encodeURIComponent(JSON.stringify(myBroker.stats))});
           })
   }


})

/*
app.get('/user',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.send({user: req.user})
);
*/

server.listen(process.env.PORT || 3000, function(){     console.log('listening on *:3000');   });
