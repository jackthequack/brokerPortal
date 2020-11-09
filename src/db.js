// db.js
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true}, //will turn into a hash
  listings: [{address: String, listprice: String, clientName: String }], //will be added to
  reqID: String,
  broker: {type: String, required: true}
});

mongoose.model('Realtor', UserSchema);

// my schema goes here!
const BrokerSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  brokerageName: {type: String, required: true},
  salespeople: [UserSchema], //note: this subdocument structure doesn't allow to save nested docs individually. Have to save the parent (broker);
  username: {type: String, required: true},
  password: {type: String, required: true}, //will turn into a hash
  reqID: String     //similar to homework we can use this to manage cookies
});

// alternative here is to make a new collection per brokerage

mongoose.model('Broker', BrokerSchema); //the broker collection

let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, '../config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/portal';
}
console.log(dbconf)
mongoose.connect(dbconf);



// mongoose.connect('mongodb://localhost/portal');
