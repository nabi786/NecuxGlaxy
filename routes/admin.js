const express = require("express");
const router = express.Router();
const adminControl = require("../controller/adminControl/adminControl");
// admin Register
router.post("/create", adminControl.adminRegister);

// login Admin

router.post("/login", adminControl.loginAdmin);

// exporting Moduel
module.exports = router;
