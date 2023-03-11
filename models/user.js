var mongoose = require("mongoose");

var Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    address: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    description: { type: String },
    avatar: { type: Object },
    background: { type: Object },
    twitter: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    follower: { type: Array },
    following: { type: Array },
    auction: { type: Boolean },
    isVerified: { type: Boolean },
    isOnFeatured: { type: Boolean },
    Nfts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "nft",
      },
    ],
    Collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "collection",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
