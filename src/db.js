// db.js
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true}, //will turn into a hash
  listings: [{address: String, listprice: String, clientName: String }], //will be added to
  reqID: String
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






mongoose.connect('mongodb://localhost/broker');
