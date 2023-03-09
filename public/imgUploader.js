const multer = require("multer");
const path = require("path");
const uuid = require("uuid");

// for file upload
var Storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, uuid.v4() + path.extname(file.originalname));
  },
});

var uploadcoll = multer({
  storage: Storage,
});

module.exports = uploadcoll;
