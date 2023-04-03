var CryptoJS = require("crypto-js");
const secretKey = process.env.API_Auth_Secret;
// var ciphertext = CryptoJS.AES.encrypt('closedSeaAPI', secretKey).toString();

// console.log(ciphertext)

const userAuth = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header("Access-Control-Allow-Headers", "Authorization");
  var authApiKey = req.header("api-key");
  if (authApiKey) {
    let bytes;
    bytes = CryptoJS.AES.decrypt(authApiKey, secretKey);
    let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(decryptedData)
    if (decryptedData == "closedSeaAPI" || decryptedData == '"closedSeaAPI"') {
      // console.log('need authorization')
      next();
    } else {
      res.status(400).json({ message: "You are not authorized person" });
    }
  } else {
    res.status(400).json({ message: "You are not authorized person" });
  }
};

module.exports = userAuth;
