var mongoose = require("mongoose");

var Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
     address: {type: String},
     firstName: {type: String},
     lastName: {type: String},
     description: {type: String},
     avatar: {type: String},
     background: {type: String},
     twitter: {type: String},
     facebook: {type: String},
     instagram: {type: String},
     follower:{type: Array},
     following:{type: Array},
     auction:{type: Boolean},
     isVerified:{type:Boolean},
     isOnFeatured:{type:Boolean}
   },{timestamps: true});

module.exports = mongoose.model('user', userSchema);
