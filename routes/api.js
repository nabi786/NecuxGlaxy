var express = require("express");
var app = express();

// V1
var authRouter = require("./auth");
var nftRouter = require("./nft");
var collectionRouter = require("./collection");
var notification = require("./notification");
var adminRouter = require("./admin");

var categoryRouter = require("./category");

//Controllers Routes V1
app.use("/auth/", authRouter);
app.use("/nft/", nftRouter);
app.use("/collection/", collectionRouter);

app.use("/notification/", notification);

app.use("/admin/", adminRouter);

app.use("/category", categoryRouter);

module.exports = app;
