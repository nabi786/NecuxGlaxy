const express = require("express");
const auth = require("../middleware/auth");
const path = require("path");
const AuthController = require("../controller/authController");
const SearchController = require("../controller/searchController");
const { validateHeaderName } = require("http");
const imgUpload = require("../middleware/imgUploader");

// require("../");
// backend routers
const router = express.Router();

// =================================
//
//
// create profile
//
//
// ================================

router.post(
  "/profile/create",
  imgUpload.array("userImgs", 2),
  AuthController.CreatePorfile
);

// update profile
router.post(
  "/profile/update",
  imgUpload.array("userImgs", 2),
  auth,
  AuthController.updateProfile
);

// login user
router.route("/login").post(AuthController.login);

//  search data
router.route("/search").post(SearchController.search);

module.exports = router;
