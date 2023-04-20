var mongoose = require("mongoose");

var NFTSchema = new mongoose.Schema(
  {
    tokenAddress: { type: String, required: true },
    tokenId: { type: String, required: true },
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
    price: { type: Number },
    withEther: { type: Boolean },
    isOnSell: { type: Boolean, default: false },
    isOnAuction: { type: Boolean },
    auction: { type: Object },
    alsoBought: { type: Boolean },
    likes: { type: Number, default: 0 },
    likedAddress: { type: [Array] },
    royality: { type: String },
    fileType: { type: String, required: true },
    isMostFinest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("nft", NFTSchema);
