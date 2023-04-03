require("dotenv").config();
require("./config/dataBase");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");
var cors = require("cors");

var app = express();

//don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//To allow cross-origin requests
app.use(cors());

//Route Prefixes  here
app.use("/", indexRouter);
app.use("/api/", apiRouter);

// throw 404 if URL not found
app.all("*", function (req, res) {
  return res.status(404).json({ status: false, message: "Page not found" });
});

app.listen(process.env.PORT || "3001", () => {
  console.log("App is Running on Port 3001");
});
