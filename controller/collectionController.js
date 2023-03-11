const CollectionModel = require("../models/collection");
const userModal = require("../models/user");
const cloudinary = require("../config/cloudinary");

// =================================
//
//
// THIS FUNCTION USED TO CREATE COLLECTION
//
//
// =================================
exports.createCollection = async (req, res) => {
  try {
    if (!req.files.avatar || !req.files.background) {
      return res.status(500).json({ msg: "avatar and background required" });
    }

    // console.log("this is collection");

    var collectionName = req.body.name;
    collectionName = collectionName.toLowerCase();
    var collections = await CollectionModel.findOne({
      name: req.body.name,
    });

    if (collections) {
      return res
        .status(200)
        .json({ status: false, msg: "collection already exist" });
    }

    // uploading avatar
    var avatar = await cloudinary.v2.uploader.upload(
      req.files.background[0].path,
      {
        folder: "nexusGalaxy/collections/avatar",
      }
    );

    var avatarObj = {
      url: avatar.secure_url,
      public_id: avatar.secure_url,
    };

    var background = await cloudinary.v2.uploader.upload(
      req.files.background[0].path,
      {
        folder: "nexusGalaxy/collections/background",
      }
    );

    var backgroundOBJ = {
      url: background.secure_url,
      public_id: background.secure_url,
    };

    var user = await userModal.findOne({ address: req.user.address });

    // creating collections
    var newCollection = await new CollectionModel({
      name: collectionName,
      owner: user._id,
      avatar: avatarObj,
      background: backgroundOBJ,
      description: req.body.description,
      externalUrl: req.body.externalUrl,
      category: req.body.category,
      // tokens: body.token,
    });

    console.log("this i user", user);
    await user.Collections.push(newCollection._id);

    console.log("Collections", user.Collections);

    // console.log("this is response", user);
    await newCollection.save();
    await user.save();

    // return data with status
    return res
      .status(200)
      .json({ status: true, message: "Successfully Collection added!" });
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
// THIS FUNCTINO USED TO UPDATE COLLECTION
//
//
// =================================
exports.updateCollection = async (req, res) => {
  try {
    var collections = await CollectionModel.findOne({ _id: req.body.id });
    console.log(collections);
    if (collections == null) {
      return res
        .status(404)
        .json({ success: true, msg: "no collection found" });
    } else {
      return res
        .status(200)
        .json({ success: true, msg: "collection udpated successfully" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Some thing went wrong", error: error.message });
  }
};

// =================================
//
//
// THIS FUNCTION USED TO DELETE COLLECTION
//
//
// =================================
exports.deleteCollection = async (req, res) => {
  try {
    if (!req.body.id) {
      return res
        .status(500)
        .json({ status: false, message: "ID is necessary" });
    }
    let exist = await CollectionModel.findOne({ _id: req.body.id })
      .lean()
      .exec();
    if (!exist) {
      return res
        .status(500)
        .json({ status: false, message: "This id is not exists" });
    } else {
      await CollectionModel.findByIdAndDelete({ _id: req.body.id }).exec();
    }
    return res
      .status(200)
      .json({ status: true, message: "Sucessfully deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// =================================
//
//
// THIS FUNCTION USED TO GET SINGLE COLLECTION
//
//
// =================================
exports.getSingleCollection = async (req, res) => {
  try {
    const collection = await CollectionModel.findOne(req.body.filter)
      .lean()
      .exec();
    return res.status(200).json({ status: true, data: collection });
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
// THIS FUNCTION USED TO REMOVE NFT FROM COLLECTION
//
//
// =================================

exports.removeNFTFromCollection = async (req, res) => {
  try {
    console.log(req.user.address);
    await CollectionModel.findOneAndUpdate(
      { owner: req.user.address, tokens: req.body.token },
      { $pull: { tokens: req.body.token } }
    ).exec();
    return res.status(200).json({
      status: true,
      message: "Successfully removed NFT from Collection!",
    });
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
// VARIFIED COLLECTION
//
//
// =================================
exports.verifiedCollection = async (req, res) => {
  try {
    await CollectionModel.findOneAndUpdate(
      { _id: req.body.id },
      { isVerified: req.body.isVerified }
    )
      .lean()
      .exec();
    return res
      .status(200)
      .json({ status: true, message: "Successfully Verified" });
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
// ALL COLLECTION WRTOOLDEST
//
//
// =================================
exports.getALLCollectionWRTOldest = async (req, res) => {
  try {
    let count = await CollectionModel.countDocuments().exec();
    if (count < 1) {
      return res
        .status(500)
        .json({ status: false, message: "Collection Not Found" });
    } else {
      let filterData = await CollectionModel.find()
        .sort({ createdAt: 1 })
        .skip((parseInt(req.body.page) - 1) * parseInt(req.body.size))
        .limit(parseInt(req.body.size))
        .lean()
        .exec();
      let totalPage = Math.ceil(count / parseInt(req.body.size));
      return res.status(200).json({
        status: true,
        message: "All Collections with respect to Oldest",
        data: filterData,
        totalPage,
      });
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
// GET ALL COLLECTIONWRt NEWEST
//
//
// =================================
exports.getAllCollectionWRTNewest = async (req, res) => {
  try {
    let count = await CollectionModel.countDocuments({}).exec();
    if (count < 1) {
      return res
        .status(500)
        .json({ status: false, message: "Collection Not Found" });
    } else {
      let filterData = await CollectionModel.find({})
        .sort({ createdAt: -1 })
        .skip((parseInt(req.body.page) - 1) * parseInt(req.body.size))
        .limit(parseInt(req.body.size))
        .lean()
        .exec();
      let totalPage = Math.ceil(count / parseInt(req.body.size));
      return res.status(200).json({
        status: true,
        message: "All Collections with respect to newest",
        data: filterData,
        totalPage,
      });
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
// THIS FUNCTION USED TO GET COLLECTION BY USER ADDRESS
//
//
// =================================
exports.myCollections = async (req, res) => {
  try {
    const collections = await CollectionModel.find({ owner: req.user.address })
      .lean()
      .exec();
    return res
      .status(200)
      .json({ status: true, message: "Success!", data: collections });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Some thing went wrong", error: error.message });
  }
};

// =================================
//
//
// THIS FUNCTION USED TO GET LIKED COLLECTION BY ADDRESS
//
//
// =================================
exports.myLikedCollections = async (req, res) => {
  try {
    var data = await CollectionModel.find({
      likedAddress: req.user.address.toLowerCase(),
    })
      .lean()
      .exec();
    return res.status(200).json({
      status: true,
      message: "You have like " + data.length + " Collections",
      data,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, msg: "something went wrong", error: err });
  }
};

// =================================
//
//
// THIS FUNCTION USED TO ADD LIKE ON COLLECTION
//
//
// =================================
exports.addLike = async function (req, res) {
  try {
    const collection = await CollectionModel.findOne({
      _id: req.body.id,
    }).exec();
    if (collection) {
      if (
        collection.likedAddress.length > 0 &&
        collection.likedAddress.filter((x) => x == req.user.address).length > 0
      ) {
        let likeCount = collection.likes - 1;
        await CollectionModel.findOneAndUpdate(
          { _id: req.body.id },
          { likes: likeCount, $pull: { likedAddress: req.user.address } }
        ).exec();
        return res
          .status(200)
          .json({ status: true, message: "You disliked this Collection" });
      } else {
        let likeCount = collection.likes + 1;
        await CollectionModel.findOneAndUpdate(
          { email: req.user.email, org: req.user.org },
          { likes: likeCount, $push: { likedAddress: req.user.address } }
        ).exec();
        return res
          .status(200)
          .json({ status: true, message: "You liked this Collection" });
      }
    } else {
      return res
        .status(500)
        .json({ status: false, message: "Collection Not found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// =================================
//
//
// THIS FUNCTION USED TO GET MOST LIKED COLLECTION
//
//
// =================================
exports.mostLikedCollection = async (req, res) => {
  try {
    let count = await CollectionModel.countDocuments({}).exec();
    if (count < 1) {
      return res
        .status(500)
        .json({ status: false, message: "Collection Not Found" });
    } else {
      let filterData = await CollectionModel.find({})
        .sort({ likes: 1 })
        .skip((parseInt(req.body.page) - 1) * parseInt(req.body.size))
        .limit(parseInt(req.body.size))
        .lean()
        .exec();
      let totalPage = Math.ceil(count / parseInt(req.body.size));
      return res.status(200).json({
        status: true,
        message: "All Collection With Respect to Most Likes",
        data: filterData,
        totalPage,
      });
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
// THIS FUNCTINO USED TO GET LEAST LIKED COLLECTIONS
//
//
// =================================
exports.leastLikedCollection = async (req, res) => {
  try {
    let count = await CollectionModel.countDocuments({}).exec();
    if (count < 1) {
      return res
        .status(500)
        .json({ status: false, message: "Collection Not Found" });
    } else {
      let filterData = await CollectionModel.find({})
        .sort({ likes: -1 })
        .skip((parseInt(req.body.page) - 1) * parseInt(req.body.size))
        .limit(parseInt(req.body.size))
        .lean()
        .exec();
      let totalPage = Math.ceil(count / parseInt(req.body.size));
      return res.status(200).json({
        status: true,
        message: "All Collection With Respect to Least Likes",
        data: filterData,
        totalPage,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Some thing went wrong",
      error: error.message,
    });
  }
};
