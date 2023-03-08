const UserModels = require("../models/user");
const jwt = require("jsonwebtoken");

const cloudinary = require("../config/cloudinary");

// =================================
//
//
// THIS FUNCTION USED TO CREATE PROFILE
//
//
// =================================
exports.CreatePorfile = async (req, res) => {
  try {
    if (!req.files.avatar || !req.files.background) {
      return res.status(500).json({
        status: false,
        message: "Avatar and Background image is required",
      });
    }

    const { body } = req;
    let exist = await UserModels.findOne({
      address: body.address.toLowerCase(),
    })
      .lean()
      .exec();
    if (exist) {
      return res.status(500).json({
        status: false,
        message: "This wallet address is already exist",
      });
    } else {
      // uploading avatar and backgound on cloudinary
      var avatar = await cloudinary.v2.uploader.upload(
        req.files.avatar[0].path
      );
      var background = await cloudinary.v2.uploader.upload(
        req.files.background[0].path
      );

      await new UserModels({
        address: body.address.toLowerCase(),
        firstName: body.firstName,
        lastName: body.lastName,
        description: body.description,
        avatar: avatar.secure_url,
        background: background.secure_url,
        twitter: body.twitter,
        facebook: body.facebook,
        instagram: body.instagram,
      }).save();
      return res
        .status(200)
        .json({ status: true, message: "Sucessfully Registered" });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Some thing went wrong",
      error: error.message,
    });
  }
};

// =================================
//
//
// THIS FUNCTION USED TO UPDATE PROFILE
//
//
// =================================
exports.updateProfile = async (req, res) => {
  try {
    if (req.files.background && req.files.background.length > 0) {
      Object.assign(req.body, { background: req.files.background[0].filename });
    }
    if (req.files.avatar && req.files.avatar.length > 0) {
      Object.assign(req.body, { avatar: req.files.avatar[0].filename });
    }
    await UserModels.findOneAndUpdate({ _id: req.user._id }, req.body).exec();
    return res
      .status(200)
      .json({ status: true, message: "User Details Updated Successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// =================================
//
//
// THIS FUNCTINO USED LOGIN USER
//
//
// =================================
exports.login = async (req, res) => {
  try {
    let data = await UserModels.findOne({
      address: req.body.address.toLowerCase(),
    }).exec();
    if (!data) {
      return res
        .status(401)
        .json({ success: false, msg: "This Wallet address is not found" });
    } else {
      let tokenData = {
        _id: data._id,
        address: data.address,
        firstName: data.firstName,
        lastName: data.lastName,
      };
      //Prepare JWT token for authentication
      const jwtPayload = tokenData;
      const jwtData = {
        expiresIn: process.env.JWT_TIMEOUT_DURATION,
      };
      let token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, jwtData);
      let userData = {
        _id: data._id,
        address: data.address,
        firstName: data.firstName,
        lastName: data.lastName,
        description: data.description,
        avatar: data.avatar,
        background: data.background,
        twitter: data.twitter,
        facebook: data.facebook,
        instagram: data.instagram,
        token,
      };

      return res
        .status(200)
        .json({ status: true, message: "Login Successfully", data: userData });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
