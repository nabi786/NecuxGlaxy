var mongoose = require("mongoose");

var NFTSchema = new mongoose.Schema(
  {
    tokenAddress: { type: String, required: true },
    tokenId: { type: String, required: true },
    price: { type: Number },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    collections: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "collection",
    },
    image: { type: Object },
    name: { type: String },
    description: { type: String },
    externalLink: { type: String },
    tokenUri: { type: String },
    status: { type: String },
    featured: { type: Boolean, default: false },
    chainId: { type: Number },
    isOnSell: { type: Boolean, default: false },
    isOnAuction: { type: Boolean },
    auction: { type: Object },
    withEther: { type: Boolean },
    alsoBought: { type: Boolean },
    likes: { type: Number, default: 0 },
    likedAddress: { type: [Array] },
    royality: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("nft", NFTSchema);
