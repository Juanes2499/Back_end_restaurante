const mongoose = require('mongoose');
//const { model } = require('./dishes');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

// Como se usa passportLocalMongoose el schema para user es más simple. 
var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    //
    facebookId: String,
    admin: {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User)