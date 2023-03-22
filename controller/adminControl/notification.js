const noti_Modal = require("../../models/notification");
const adminModal = require("../../models/admin");
// ==========================
//
//
// THIS API USED TO UPDATE NOTIFICATION
//
//
// ===========================
const UpdateNotificationBar = async (req, res) => {
  try {
    var address = req.user;
    console.log("address", req.user);
    var admin = await adminModal.findOne({ walletAddress: address.address });

    if (admin != null) {
      let noti = await noti_Modal.findOne().lean().exec();
      if (noti == null) {
        var newNotification = new noti_Modal({
          text: req.body.text,
          color: req.body.color,
          textColor: req.body.textColor,
          show: req.body.show,
        });

        await newNotification.save();
        res
          .status(200)
          .json({ success: true, msg: "notification created succesfully" });
      } else {
        await noti_Modal.findOneAndUpdate({ _id: noti._id }, req.body);

        res
          .status(200)
          .json({ success: true, msg: "notification updated succesfully" });
      }
    } else {
      res
        .status(404)
        .json({ success: false, msg: "not authorized to update Notification" });
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: "something went wrong" });
  }
};

// ==========================
//
//
// THIS API USED TO GET NOTIFICATION
//
//
// ===========================
const getNotification = async (req, res) => {
  try {
    let noti = await noti_Modal.findOne().lean().exec();
    if (noti != null) {
      res.status(200).json({ success: true, noftification_Data: noti });
    } else {
      res.status(404).json({
        success: false,
        msg: "no data found, create notification first",
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: "something went wrong" });
  }
};

const noti_OBj = {
  UpdateNotificationBar,
  getNotification,
};

// exporting Module
module.exports = noti_OBj;
