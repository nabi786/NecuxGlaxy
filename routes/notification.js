const express = require("express");
const router = express.Router();
const noti_OBj = require("../controller/notification");
const auth = require("../middleware/auth");

// post method update  notification
router.post("/update-notification-bar", auth, noti_OBj.UpdateNotificationBar);

// get Notifications
router.get("/getNotificationBar", noti_OBj.getNotification);

// exporting Moduel
module.exports = router;
