const express = require("express");
const auth = require("../middleware/auth");
const NFTController = require("../controller/nftController");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
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

// create nfts
router.route("/create").post(auth, NFTController.nftCreate);
// updated nft
router.route("/update").post(auth, NFTController.nftUpdate);

//
router.route("/transfer_Nft").post(auth, NFTController.transfer_Nft);

// delete Nft
router.route("/delete").post(auth, NFTController.nftdelete);
// nfts that with low price
router.route("/price/low").post(NFTController.lowestPriceNFTs);
// nfts with high price
router.route("/price/high").post(NFTController.highestPriceNFTs);
// get single nft
router.route("/single").post(auth, NFTController.singleNFTs);
// get nft with walletAddress
router.route("/nftsByWltAddress").post(auth, NFTController.nftsByWltAddress);
// get nft that liked by single user
router.route("/my/like").get(auth, NFTController.myLikedNFT);
// get all nfts
router.route("/myNfts").post(auth, NFTController.myNfts);
// get most liked nfts
router.route("/like/most").post(NFTController.mostLikedNfts);
// get lest like nfts
router.route("/like/least").post(NFTController.leastLikedNfts);
// add like to nft
router.route("/like").post(auth, NFTController.addLike);

// create by NBI bAKSH

// get all oldest nfts
router.post("/oldest", NFTController.oldest);

// get nfts that are on Sell
router.post("/onSell", NFTController.onSell);

router.post("/cancelListing", auth, NFTController.cancelListing);

// find most Finest NFts
router.post("/mostFinestNfts", NFTController.mostFinestNfts);

module.exports = router;
