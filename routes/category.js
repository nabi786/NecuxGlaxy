const express = require("express");
const router = express.Router();
const adminControl = require("../controller/adminControl/categoryControl");
const auth = require("../middleware/auth");
// admin Register
router.post("/create", auth, adminControl.createCategory);

router.get("/getAllCategories", adminControl.getAllCategories);

// delete Category
router.post("/deleteCategory", auth, adminControl.deteCategory);

// update Category
router.post("/updateCategory", auth, adminControl.updateCategory);

// exporting Moduel
module.exports = router;
