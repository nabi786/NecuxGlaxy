var mongoose = require("mongoose");

var Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
     text:{type: String},
     color:{type: String},
     textColor:{type: String},
     show:{type: Boolean}
},{timestamps: true});

module.exports = mongoose.model('notification', notificationSchema);