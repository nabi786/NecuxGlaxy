var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CollectionSchema = new Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String },
    background: { type: String },
    owner: { type: String, required: true },
    description: { type: String },
    externalUrl: { type: String },
    tokens: { type: Array },
    isVerified: { type: Boolean },
    category: { type: String },
    likes: { type: Number, default: 0 },
    likedAddress: { type: Array },
  },
  { timestamps: true }
);

module.exports = mongoose.model("collection", CollectionSchema);
