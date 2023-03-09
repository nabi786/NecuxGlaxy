const multer = require("multer");
const path = require("path");
const uuid = require("uuid");

const imagPath = path.join(__dirname + "/upload/");

// for file upload
var Storage = multer.diskStorage({
  destination: imagPath,
  filename: (req, file, cb) => {
    cb(null, uuid.v4() + path.extname(file.originalname));
  },
});

var uploadcoll = multer({
  storage: Storage,
});

module.exports = uploadcoll;
