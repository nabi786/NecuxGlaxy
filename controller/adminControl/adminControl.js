const adminModal = require("../../models/admin");
const jwt = require("jsonwebtoken");

// =================================
//
//
// Admin Register
//
//
// =================================
exports.adminRegister = async (req, res) => {
  try {
    var newADMIN = new adminModal({
      walletAddress: req.body.walletAddress,
      name: req.body.name,
      email: req.body.email,
    });

    console.log(newADMIN);

    // await newADMIN.save();
    res
      .status(200)
      .json({ success: true, msg: "admin Registered Successfully" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "something went wrong" });
  }
};

// =================================
//
//
//        ADMIN LOGIN
//
//
// =================================
exports.loginAdmin = async (req, res) => {
  try {
    var data = await adminModal.findOne({ walletAddress: req.body.address });
    if (!data) {
      return res
        .status(401)
        .json({ success: false, msg: "This Wallet address is not found" });
    } else {
      let jsonData = {
        _id: data._id,
        address: data.walletAddress,
      };
      //Prepare JWT token for authentication
      const jwtPayload = jsonData;
      const jwtData = {
        expiresIn: process.env.JWT_TIMEOUT_DURATION,
      };
      let token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, jwtData);

      return res.status(200).json({
        status: true,
        message: "Login Successfully",
        data,
        token,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: "something went wrong" });
  }
};
