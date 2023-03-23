const adminModal = require("../../models/admin");
const categoryModal = require("../../models/category");

exports.createCategory = async (req, res) => {
  try {
    var admin = await adminModal.findOne({ walletAddress: req.user.address });

    if (admin) {
      var name = req.body.name;

      var findeCat = await categoryModal.findOne({ name: name.toLowerCase() });

      if (findeCat) {
        res.status(200).json({ success: false, msg: "category already exist" });
      } else {
        var newCategory = new categoryModal({
          name: name.toLowerCase(),
        });

        await newCategory.save();

        res
          .status(200)
          .json({ success: true, msg: "category created Successfully" });
      }
    } else {
      res
        .status(404)
        .json({ success: false, msg: "not authorized to create Category" });
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: "something went wrong" });
  }
};

// get all categories
exports.getAllCategories = async (req, res) => {
  try {
    var categories = await categoryModal.find({});

    if (categories) {
      res.status(200).json({ success: false, data: categories });
    } else {
      res.status(404).json({ success: false, msg: "no data found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: "something went wrong" });
  }
};
