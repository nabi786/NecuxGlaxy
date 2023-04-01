const express = require("express");
const auth = require("../middleware/auth");
const CollectionController = require("../controller/collectionController");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   if (file.fieldname === "avatar") {
  //     cb(null, "./public/collection/avatar/");
  //   } else if (file.fieldname === "background") {
  //     cb(null, "./public/collection/background/");
  //   }
  // },
  filename: (req, file, cb) => {
    if (file.fieldname === "avatar") {
      cb(null, Date.now() + file.originalname);
    } else if (file.fieldname === "background") {
      cb(null, Date.now() + file.originalname);
    }
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

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: fileFilter,
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "background", maxCount: 1 },
]);

router
  .route("/create")
  .post(upload, auth, CollectionController.createCollection);
router
  .route("/update")
  .post(upload, auth, CollectionController.updateCollection);
router.route("/delete").post(auth, CollectionController.deleteCollection);
router.route("/single").post(CollectionController.getSingleCollection);
router
  .route("/CollectionByAddress")
  .post(CollectionController.CollectionByAddress);

// add Like to Collection
router.route("/like").post(auth, CollectionController.addLike);
// My Liked NFts
router
  .route("/my/likedCollections")
  .post(auth, CollectionController.myLikedCollections);

// router
//   .route("/remove/nft")
//   .post(auth, CollectionController.removeNFTFromCollection);

router.route("/oldest").post(CollectionController.getALLCollectionWRTOldest);
router.route("/newest").post(CollectionController.getAllCollectionWRTNewest);

// router.route("/like/most").post(CollectionController.mostLikedCollection);
// router.route("/like/least").post(CollectionController.leastLikedCollection);

router.post("/getAllCollections", CollectionController.getALL);

// get All collection by category ID
router.post(
  "/getAllCollectionByCategory",
  CollectionController.getAllCollectionByCategory
);

// get All Nfts by collectionID
router.post(
  "/getNftsByCollectionID",
  auth,
  CollectionController.getNftsByCollectionID_ChainID
);

module.exports = router;
