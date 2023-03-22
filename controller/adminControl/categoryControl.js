const adminModal = require("../../models/admin");

exports.createCategory = async (req, res) => {
  try {
    res
      .status(500)
      .json({ success: true, msg: "category created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "something went wrong" });
  }
};
