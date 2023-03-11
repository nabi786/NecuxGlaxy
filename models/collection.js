var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CollectionSchema = new Schema(
  {
    name: { type: String, required: true },
    avatar: { type: Object },
    background: { type: Object },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    description: { type: String },
    externalUrl: { type: String },
    tokens: { type: Array },
    isVerified: { type: Boolean },
    category: { type: String },
    likes: { type: Number, default: 0 },
    likedAddress: { type: Array },
    Nfts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "nft",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("collection", CollectionSchema);
