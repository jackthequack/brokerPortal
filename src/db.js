// db.js
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  name: {type: String},
  username: {type: String, required: true},
  listings: [{address: String, listprice: String, clientName: String }], //will be added to
  reqID: String,
  brokerage: {type: String}
});

UserSchema.plugin(passportLocalMongoose);

mongoose.model('Realtor', UserSchema);

// my schema goes here!

const BrokerSchema = new mongoose.Schema({
  name: {type: String},
  brokerage: {type: String},
  salespeople: [UserSchema], //note: this subdocument structure doesn't allow to save nested docs individually. Have to save the parent (broker);
  username: {type: String, required: true},
  reqID: String     //similar to homework we can use this to manage cookies
});

// alternative here is to make a new collection per brokerage

BrokerSchema.plugin(passportLocalMongoose);

mongoose.model('Broker', BrokerSchema, 'Broker');

//mongoose.model('Broker', BrokerSchema); //the broker collection

/*
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/portal';
}
//console.log(dbconf)
mongoose.connect(dbconf);
*/


mongoose.connect('mongodb://localhost/tester');
