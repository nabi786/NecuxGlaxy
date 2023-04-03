const CollectionModel = require("../models/collection");
const userModal = require("../models/user");
const cloudinary = require("../config/cloudinary");
const categoryModal = require("../models/category");

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
    var avatar = await cloudinary.v2.uploader.upload(req.files.avatar[0].path, {
      folder: "nexusGalaxy/collections/avatar",
    });

    var avatarObj = {
      url: avatar.secure_url,
      public_id: avatar.public_id,
    };

    var background = await cloudinary.v2.uploader.upload(
      req.files.background[0].path,
      {
        folder: "nexusGalaxy/collections/background",
      }
    );

    var backgroundOBJ = {
      url: background.secure_url,
      public_id: background.public_id,
    };

    var user = await userModal.findOne({ address: req.user.address });
    // console.log(user)
    var category = await categoryModal.findOne({ _id: req.body.categoryID });
    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: "invalid categoryID" });
    }

    // creating collections
    var newCollection = await new CollectionModel({
      name: collectionName,
      owner: user._id,
      avatar: avatarObj,
      background: backgroundOBJ,
      description: req.body.description,
      externalUrl: req.body.externalUrl,
      category: category._id,
    });
    console.log(newCollection);
    user.Collections.push(newCollection._id);
    category.Collections.push(newCollection._id);
    // console.log("this is response", user);
    await newCollection.save();
    await user.save();
    await category.save();

    // return data with status
    return res
      .status(200)
      .json({ status: true, message: "Successfully Collection added!" });
  } catch (error) {
    console.log(error);
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
    if (!req.files.avatar || !req.files.background) {
      return res.status(404).json({
        status: false,
        message: "Avatar and Background image is required",
      });
    }

    var currentUser = await userModal.findOne({ address: req.user.address });
    var collections = await CollectionModel.findOne({
      _id: req.body.id,
    }).populate({ path: "owner" });

    if (collections == null) {
      return res
        .status(404)
        .json({ success: true, msg: "no collection found" });
    } else {
      if (currentUser.address === collections.owner.address) {
        // destroying the images on cloudinary
        await cloudinary.v2.uploader.destroy(collections.avatar.public_id);
        await cloudinary.v2.uploader.destroy(collections.background.public_id);

        // uploading Avatar
        var avatar = await cloudinary.v2.uploader.upload(
          req.files.avatar[0].path,
          {
            folder: "nexusGalaxy/collections/avatar",
          }
        );

        // uploading Background
        var background = await cloudinary.v2.uploader.upload(
          req.files.background[0].path,
          {
            folder: "nexusGalaxy/collections/background",
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

        // upading the collection
        await CollectionModel.findOneAndUpdate(
          { _id: req.body.id },
          req.body
        ).exec();

        return res
          .status(200)
          .json({ success: true, msg: "collection udpated successfully" });
      } else {
        return res.status(404).json({
          success: true,
          msg: "invalid authorization for this collection",
        });
      }
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
        .status(404)
        .json({ status: false, message: "collection not found" });
    } else {
      var collection = await CollectionModel.findOne({ _id: req.body.id });

      await cloudinary.v2.uploader.destroy(collection.avatar.public_id);
      await cloudinary.v2.uploader.destroy(collection.background.public_id);

      var currentUser = await userModal.findOne({ address: req.user.address });
      var category = await categoryModal.findOne({ _id: collection.category });

      var collectionAry = currentUser.Collections;

      var findIndex = collectionAry.indexOf(req.body.id);
      if (findIndex == -1) {
        return res.status(404).json({
          status: false,
          message: "collectiona already Deleted",
        });
      } else {
        console.log("collectionAry findIndex", findIndex);
        collectionAry.splice(findIndex, 1);
        currentUser.Collections = collectionAry;
        var catIndex = category.Collections.indexOf(collection._id);

        category.Collections.splice(catIndex, 1);

        await currentUser.save();
        await category.save();
        await CollectionModel.findByIdAndDelete({ _id: req.body.id }).exec();

        return res
          .status(200)
          .json({ status: true, message: "Collection Sucessfully deleted" });
      }
    }
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
    const collection = await CollectionModel.findOne({ _id: req.body.id })
      .populate({ path: "owner" })
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
        .populate({ path: "owner" })
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
exports.CollectionByAddress = async (req, res) => {
  try {
    if (!req.body.size || !req.body.page) {
      return res
        .status(404)
        .json({ status: false, message: "invalid page or size", data: [] });
    }
    var adr = req.body.address.toLowerCase();
    const user = await userModal
      .findOne({
        address: adr,
      })
      .populate({ path: "Collections", populate: { path: "owner" } });

    var itemPerPage = req.body.size;
    var pageNum = req.body.page;

    // console.log(user);
    if (user != null) {
      // get all collecction by *
      if (req.body.size == "*" && req.body.page == "*") {
        return res
          .status(200)
          .json({ status: true, message: "Success!", data: user.Collections });
      }

      var collections = user.Collections;

      var totalPages = Math.ceil(collections.length / itemPerPage);
      // function to get pagination
      function paginate(array, page_size, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice(
          (page_number - 1) * page_size,
          page_number * page_size
        );
      }

      var collectionsList = await paginate(collections, itemPerPage, pageNum);

      return res.status(200).json({
        status: true,
        message: "Success!",
        totalPages,
        data: collectionsList,
      });
    } else {
      return res.status(404).json({
        status: false,
        message: "no user found with this address",
        data: [],
      });
    }
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
    var User = await userModal
      .findOne({ address: req.user.address })
      .populate({ path: "MylikedCollection" });

    if (User) {
      var LikedCollections = User.MylikedCollection;

      var page_size = req.body.size;
      var page_number = req.body.page_number;

      var totalPage = Math.ceil(LikedCollections.length / page_size);
      // making Pagination
      function paginate(array, page_size, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice(
          (page_number - 1) * page_size,
          page_number * page_size
        );
      }

      var collections = await paginate(
        LikedCollections,
        page_size,
        page_number
      );

      res.status(200).json({
        totalPage,
        data: collections,
      });
    } else {
      res.status(404).json({ msg: "user not found" });
    }
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
    var CurrentUser = await userModal.findOne({ address: req.user.address });

    var findCollection = await CollectionModel.findOne({ _id: req.body.id });
    console.log("this is colelction", findCollection);
    if (findCollection) {
      var likes = findCollection.Likes;
      var findIndex = likes.indexOf(CurrentUser._id);

      if (findIndex == -1) {
        likes.push(CurrentUser._id);
        CurrentUser.MylikedCollection.push(findCollection._id);

        await findCollection.save();
        await CurrentUser.save();
        res.status(200).json({ success: true, msg: "Like Added Successfully" });
      } else {
        likes.splice(findIndex, 1);
        findCollection.Likes = likes;
        var findIndexOfCollectionInUser = CurrentUser.MylikedCollection.indexOf(
          CurrentUser._id
        );

        CurrentUser.MylikedCollection.splice(findIndexOfCollectionInUser, 1);

        await findCollection.save();

        await CurrentUser.save();
        res
          .status(200)
          .json({ success: true, msg: "Like removed Successfully" });
      }
    } else {
      res.status(404).json({ success: false, msg: "no collection found" });
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

//

exports.getALL = async (req, res) => {
  try {
    if (!req.body.size || !req.body.page) {
      res.status(404).json({ success: false, msg: "invalid size or pages" });
    }
    var collectionsData = await CollectionModel.find().populate({
      path: "owner",
    });
    console.log(collectionsData.length);
    if (collectionsData.length > 0) {
      var itemPerPage = req.body.size;
      var pageNum = req.body.page;

      // how many Pages
      var totalPage = Math.ceil(collectionsData.length / itemPerPage);

      // make Pagination
      function paginate(array, page_size, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice(
          (page_number - 1) * page_size,
          page_number * page_size
        );
      }

      var collectionsList = await paginate(
        collectionsData,
        itemPerPage,
        pageNum
      );

      res.status(200).json({
        status: true,
        totalPage,
        data: collectionsList,
      });
    } else {
      res.status(404).json({ success: false, msg: "no data found" });
    }
  } catch (err) {
    console.log("this is any error", err);
    res.status(500).json({ success: false, msg: "something went wrong" });
  }
};

// get collection by Category
exports.getAllCollectionByCategory = async (req, res) => {
  try {
    var category = await categoryModal
      .findOne({ _id: req.body.catID })
      .populate({ path: "Collections" });
    if (category) {
      var collections = category.Collections;

      var page_size = req.body.size;
      // function to get pagination
      var page_number = req.body.page;
      var totalPages = Math.ceil(collections.length / page_size);

      function paginate(array, page_size, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice(
          (page_number - 1) * page_size,
          page_number * page_size
        );
      }

      var data = await paginate(collections, page_size, page_number);
      return res.status(200).json({ success: true, totalPages, data: data });
    } else {
      return res.status(404).json({ success: false, msg: "no data found" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, msg: "something went wrong" });
  }
};

// // // // // // / // // // / /
//
//
//  Get Nfts by Collection ID
//
//
// // // // // // / // // // / /

exports.getNftsByCollectionID_ChainID = async (req, res) => {
  try {
    var loggedInUser = await userModal.findOne({ address: req.user.address });
    var collection = await CollectionModel.findOne({
      _id: req.body.id,
    })
      .populate({
        path: "Nfts",
      })
      .populate({ path: "owner" });

    if (!collection) {
      return res
        .status(404)
        .json({ success: false, msg: "collection not found" });
    } else {
      var nfts = collection.Nfts;
      var page_size = req.body.size;
      var page_number = req.body.page;

      var filtered = [];

      nfts.forEach((item, index) => {
        if (item.chainId === req.body.chainId) {
          filtered.push(item);
        }
      });
      

      var totalPages = Math.ceil(filtered.length / page_size);
      var result = await paginate(filtered, page_size, page_number);

      return res
        .status(200)
        .json({ success: true, totalPages: totalPages, data: result });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, msg: "something went wrong", error: err });
  }
};

// pagintaions
function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}
