const UserModels = require("../models/user");
const collectionModal = require("../models/collection");
const jwt = require("jsonwebtoken");

const cloudinary = require("../config/cloudinary");

// =================================
//
//
// THIS FUNCTION USED TO CREATE PROFILE
//
//
// =================================
const CreatePorfile = async (req, res) => {
  try {
    // console.log(req.files);
    // console.log("this is req files  ", req.files[0]);

    // uploading images on backend

    const { body } = req;
    let exist = await UserModels.findOne({
      address: body.address.toLowerCase(),
    })
      .lean()
      .exec();
    if (exist) {
      // console.log("isUser Already Exist", exist);
      await login(req, res);
      // return res.status(500).json({
      //   status: false,
      //   message: "This wallet address is already exist",
      // });
    } else {
      // uploading avatar and backgound on cloudinary

      var avatarObj = "";
      var backgroundOBJ = "";

      if (!req.files.avatar || !req.files.background) {
        avatarObj = {
          url: "https://res.cloudinary.com/learn2code/image/upload/v1678530306/nexusGalaxy/users/avatar/avatarMen_lrka7p.png",
          public_id: "",
        };
        backgroundOBJ = {
          url: "https://res.cloudinary.com/learn2code/image/upload/v1678530325/nexusGalaxy/users/background/bg_utpugb.jpg",
          public_id: "",
        };
      } else {
        // this is avatar upload setting
        var avatar = await cloudinary.v2.uploader.upload(
          req.files.avatar[0].path,
          {
            folder: "nexusGalaxy/users/avatar",
          }
        );

        var background = await cloudinary.v2.uploader.upload(
          req.files.background[0].path,
          {
            folder: "nexusGalaxy/users/background",
          }
        );

        avatarObj = {
          url: avatar.secure_url,
          public_id: avatar.secure_url,
        };

        // console.log(background);

        backgroundOBJ = {
          url: background.secure_url,
          public_id: background.secure_url,
        };
      }

      // creating new User
      var newuser = await new UserModels({
        address: body.address.toLowerCase(),
        firstName: body.firstName,
        lastName: body.lastName,
        description: body.description,
        avatar: avatarObj,
        background: backgroundOBJ,
        twitter: body.twitter,
        facebook: body.facebook,
        instagram: body.instagram,
      });

      // console.log(newuser);
      await newuser.save();

      // return res
      //   .status(200)
      //   .json({ status: true, message: "Sucessfully Registered" });

      await login(req, res);
    }
  } catch (error) {
    console.log("this si file", error);
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
const updateProfile = async (req, res) => {
  try {
    if (!req.files.avatar || !req.files.background) {
      return res.status(404).json({
        status: false,
        message: "Avatar and Background image is required",
      });
    } else {
      var user = await UserModels.findOne({ _id: req.user._id });
      // console.log("this is user ID", user);
      if (user != null) {
        // deleeting images from cloudinary
        if (user.avatar.public_id != "" && user.background.public_id != "") {
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);
          await cloudinary.v2.uploader.destroy(user.background.public_id);
        }

        // uploading images on cloudinary
        var avatar = await cloudinary.v2.uploader.upload(
          req.files.avatar[0].path,
          {
            folder: "nexusGalaxy/users/avatar",
          }
        );

        var background = await cloudinary.v2.uploader.upload(
          req.files.background[0].path,
          {
            folder: "nexusGalaxy/users/background",
          }
        );

        var avatarObj = {
          url: avatar.secure_url,
          public_id: avatar.public_id,
        };

        var backgroundOBJ = {
          url: background.secure_url,
          public_id: background.public_id,
        };

        Object.assign(req.body, { background: backgroundOBJ });
        Object.assign(req.body, { avatar: avatarObj });

        console.log(req.body);

        await UserModels.findOneAndUpdate(
          { _id: req.user._id },
          req.body
        ).exec();
        return res
          .status(200)
          .json({ status: true, message: "User Details Updated Successfully" });
      }
    }
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
const login = async (req, res) => {
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

// module.export {userOBj}

// get current User

const getLoggedInUser = async (req, res) => {
  try {
    var data = await UserModels.findOne({ _id: req.user._id }).populate({
      path: "Collections",
    });
    // console.log("this is respnse", data);
    if (!data) {
      res.status(401).json({ success: false, msg: "not authorized User" });
    } else {
      res
        .status(200)
        .json({ status: true, message: "Login Successfully", data: data });
    }
  } catch (err) {
    console.log("err", err);
    return res
      .status(500)
      .json({ status: false, message: "something went wrong in server" });
  }
};

// add LIkes to NFTs OR Collections

const addLikes = async (req, res) => {
  try {
    var speficID = req.params.likeTo;

    var currentUser = await UserModels.findOne({ address: req.user.address });

    if (currentUser != null) {
      var findCollection = await collectionModal.findOne({ _id: speficID });

      findCollection.likedAddress.push(currentUser._id);
      findCollection.likes += Number(findCollection.likes) + 1;

      findCollection.save();
      res
        .status(200)
        .json({ status: true, message: "Like Added Successsfully" });
    } else {
      res.status(404).json({ status: false, message: "user not found" });
    }
  } catch (err) {
    console.log("err", err);
    res
      .status(500)
      .json({ status: false, message: "something went wrong in server" });
    return res
      .status(500)
      .json({ status: false, message: "something went wrong in server" });
  }
};

const userOBj = {
  CreatePorfile,
  updateProfile,
  login,
  getLoggedInUser,
  addLikes,
};

module.exports = userOBj;
