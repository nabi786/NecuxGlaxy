const express = require("express");
const auth = require("../middleware/auth");
const path = require("path");
const AuthController = require("../controller/authController");
const SearchController = require("../controller/searchController");
const multer = require("multer");
const { validateHeaderName } = require("http");

// require("../");

// backend routers
const router = express.Router();
console.log("this is path   ", path.join(__dirname, "../public/user/avatar/"));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "avatar") {
      cb(null, path.join(__dirname, "../public/user/avatar/"));
    } else if (file.fieldname === "background") {
      cb(null, path.join(__dirname, "../public/user/background/"));
    }
  },
  filename: (req, file, cb) => {
    if (file.fieldname === "avatar") {
      cb(null, Date.now() + file.originalname);
    } else if (file.fieldname === "background") {
      cb(null, Date.now() + file.originalname);
    }
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/heif" ||
    file.mimetype == "image/heic"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: fileFilter,
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "background", maxCount: 1 },
]);

// =================================
//
//
// create profile
//
//
// ================================
router.route("/profile/create").post(upload, AuthController.CreatePorfile);

// update profile
router
  .route("/profile/update")
  .post(upload, auth, AuthController.updateProfile);

// login user
router.route("/login").post(AuthController.login);

//  search data
router.route("/search").post(SearchController.search);

module.exports = router;
