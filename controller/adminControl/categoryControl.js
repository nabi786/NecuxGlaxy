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
      res.status(200).json({ success: true, data: categories });
    } else {
      res.status(404).json({ success: false, msg: "no data found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: "something went wrong" });
  }
};

// delete Category
exports.deteCategory = async (req, res) => {
  try {
    var admin = await adminModal.findOne({ walletAddress: req.user.address });
    if (admin) {
      var category = await categoryModal.findOne({ _id: req.body.id });

      if (category) {
        await categoryModal.findOneAndDelete({ _id: req.body.id });
        res
          .status(200)
          .json({ success: true, msg: "category deleted Successfully" });
      } else {
        res
          .status(404)
          .json({ success: false, msg: "category already deleted" });
      }
    } else {
      res.status(404).json({ success: false, msg: "not authorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: "something went wrong" });
  }
};

// update category

exports.updateCategory = async (req, res) => {
  try {
    var admin = await adminModal.findOne({ walletAddress: req.user.address });
    if (admin) {
      var category = await categoryModal.findOne({ _id: req.body.id });

      if (category) {
        await categoryModal.findOneAndUpdate({ _id: req.body.id }, req.body);
        res
          .status(200)
          .json({ success: true, msg: "category updated Successfully" });
      } else {
        res.status(404).json({ success: false, msg: "no category found" });
      }
    } else {
      res.status(404).json({ success: false, msg: "not authorized" });
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: "something went wrong" });
  }
};
