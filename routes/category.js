const express = require("express");
const router = express.Router();
const adminControl = require("../controller/adminControl/categoryControl");
const auth = require("../middleware/auth");
// admin Register
router.post("/create", auth, adminControl.createCategory);

// login Admin

// exporting Moduel
module.exports = router;
