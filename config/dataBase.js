// DB connection
var mongoose = require("mongoose");
var MONGODB_URL = process.env.MONGODB_URL;

console.log("this is dataBase URL", MONGODB_URL);
// var MONGODB_URL = `mongodb://localhost:27017/nexusgalaxy`;
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    //don't show the log when it is test
    if (process.env.NODE_ENV !== "test") {
      console.log("Connected to %s", MONGODB_URL);
      console.log("Server is running ... \n");
      console.log("Press CTRL + C to stop the process. \n");
    }
  })
  .catch((err) => {
    console.error("App starting error:", err.message);
    process.exit(1);
  });
