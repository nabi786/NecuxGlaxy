var express = require("express");
// V1
var authRouter = require("./auth");
var nftRouter = require("./nft");
var collectionRouter = require("./collection");

var app = express();

//Controllers Routes V1 
app.use("/auth/", authRouter);
app.use("/nft/", nftRouter);
app.use("/collection/", collectionRouter);
module.exports = app;