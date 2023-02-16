const express = require("express");
const auth = require("../middleware/auth");
const NFTController = require("../controller/nftController");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/nft");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/heif" ||
    file.mimetype == "image/heic"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter }).single(
  "image"
);

router.route("/create").post(upload, auth, NFTController.nftCreate);
router.route("/update").post(upload, auth, NFTController.nftUpdate);
router.route("/delete").post(auth, NFTController.nftdelete);
router.route("/price/low").post(NFTController.lowestPriceNFTs);
router.route("/price/high").post(NFTController.highestPriceNFTs);
router.route("/single").post(NFTController.singleNFTs);
router.route("/my").get(auth, NFTController.myNFT);
router.route("/my/like").get(auth, NFTController.myLikedNFT);
router.route("/all").post(NFTController.allNFTs);
router.route("/like/most").post(NFTController.mostLikedNfts);
router.route("/like/least").post(NFTController.leastLikedNfts);
router.route("/like").post(auth, NFTController.addLike);

module.exports = router;
