const express = require("express");
const auth = require("../middleware/auth");
const CollectionController = require("../controller/collectionController");
const multer = require("multer");
const router = express.Router();

const imgUpload = require("../middleware/imgUploader");

router
  .route("/create")
  .post(
    imgUpload.array("userImgs", 2),
    auth,
    CollectionController.createCollection
  );
router
  .route("/update")
  .post(
    imgUpload.array("userImgs", 2),
    auth,
    CollectionController.updateCollection
  );
router.route("/delete").post(auth, CollectionController.deleteCollection);
router.route("/single").post(CollectionController.getSingleCollection);
router.route("/my").get(auth, CollectionController.myCollections);
router.route("/my/like").get(auth, CollectionController.myLikedCollections);
router
  .route("/remove/nft")
  .post(auth, CollectionController.removeNFTFromCollection);
router.route("/oldest").post(CollectionController.getALLCollectionWRTOldest);
router.route("/newest").post(CollectionController.getAllCollectionWRTNewest);
router.route("/like").post(auth, CollectionController.addLike);
router.route("/like/most").post(CollectionController.mostLikedCollection);
router.route("/like/least").post(CollectionController.leastLikedCollection);

module.exports = router;
