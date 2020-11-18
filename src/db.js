// db.js
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  name: {type: String},
  account: String
});

UserSchema.plugin(passportLocalMongoose);

mongoose.model('User', UserSchema);


const RealtorSchema = new mongoose.Schema({
  name: {type: String},
  username: {type: String, required: true},
  listings: [{address: String, listprice: String, clientName: String, listDate: String, status: String, dom: Number}], //will be added to
  data: [{lat: Number, long: Number}],
  reqID: String,
  brokerage: {type: String}
});



mongoose.model('Realtor', RealtorSchema);
// my schema goes here!

const BrokerSchema = new mongoose.Schema({
  name: {type: String},
  brokerage: {type: String},
  salespeople: [UserSchema], //note: this subdocument structure doesn't allow to save nested docs individually. Have to save the parent (broker);
  username: {type: String, required: true},
  data: [{lat: Number, long: Number}],
  reqID: String     //similar to homework we can use this to manage cookies
});

// alternative here is to make a new collection per brokerage


mongoose.model('Broker', BrokerSchema);

//mongoose.model('Broker', BrokerSchema); //the broker collection


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


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);


//mongoose.connect('mongodb://localhost/finaltest');
