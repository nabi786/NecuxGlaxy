const NFTModel = require("../models/nft");
const UserModel = require("../models/user");
const collectionModal = require("../models/collection");
const cloudinary = require("../config/cloudinary");

function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

// =================================
//
//
// THIS FUNCTINO USED TO CREATE NFT
//
//
// =================================
exports.nftCreate = async (req, res) => {
  try {
    // console.log("this i file", req.file);
    let exist = await NFTModel.findOne({
      tokenId: String(req.body.tokenId),
    })
      .lean()
      .exec();
    if (exist) {
      return res.status(500).json({
        status: false,
        message: "This Token ID and token Address is already exists",
      });
    } else {
      var user = await UserModel.findOne({ address: String(req.user.address) });

      var collection = await collectionModal.findOne({
        _id: req.body.CollectionID,
      });
      console.log("this is tokenAddress", req.body);
      // console.log("this is tokenAddress", req.bod);
      var newNFT = await new NFTModel({
        name: req.body.name,
        tokenAddress: req.body.tokenAddress,
        tokenId: req.body.tokenId,
        image: req.body.image,
        owner: user._id,
        collections: req.body.CollectionID,
        tokenUri: req.body.tokenUri,
        externalLink: req.body.externalLink,
        description: req.body.description,
        chainId: req.body.chainId,
        status: "active",
        royality: req.body.royality,
      });

      user.Nfts.push(newNFT._id);
      collection.Nfts.push(newNFT._id);

      // saving collection
      await collection.save();
      // saving user
      await user.save();
      // saving new nft
      await newNFT.save();
    }
    return res
      .status(200)
      .json({ status: true, message: "Sucessfully created" });
  } catch (error) {
    console.log("this is err", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// =================================
//
//
// THIS FUNCTINO USED TO UPDATE NFT
//
//
// =================================
exports.nftUpdate = async (req, res) => {
  try {
    var user = await UserModel.findOne({ address: req.user.address });
    console.log(user.Nfts);
    var findNft = user.Nfts.indexOf(req.body.id);

    if (findNft != -1) {
      var nft = await NFTModel.findOneAndUpdate(
        { _id: req.body.id },
        {
          price: req.body.price,
          withEther: true,
          isOnSell: true,
        }
      );

      res.status(200).json({ success: true, msg: "updated Successfully" });
    } else {
      res.status(404).json({ success: false, msg: "invalid OwnerShip" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};

// // // // // // // // // // //
//
//
// FUNCTION TO TRANSFER NFT
//
//
// // // // // // // // // // //

exports.transfer_Nft = async (req, res) => {
  try {
    var currentUser = await UserModel.findOne({ address: req.user.address });
    var newOwner = await UserModel.findOne({ address: req.body.newOwner });

    if (currentUser) {
      var findToken = await NFTModel.findOne({
        tokenId: req.body.tokenID,
        tokenAddress: req.body.tokenAddress,
      });

      var findIndex = currentUser.Nfts.indexOf(findToken._id);

      var collection = await collectionModal.findOne({
        _id: findToken.collections,
      });

      if (findIndex != -1) {
        console.log("this is");
        var nftsInCollection = collection.Nfts;
        var findIndex = nftsInCollection.indexOf(findToken._id);
        collection.Nfts.splice(findIndex, 1);
        console.log("this is the colelction", collection.Nfts);

        await NFTModel.findOneAndUpdate(
          {
            tokenId: req.body.tokenID,
            tokenAddress: req.body.tokenAddress,
          },
          {
            owner: newOwner._id,
            $unset: { collections: findToken.collections },
          }
        );

        newOwner.Nfts.push(findToken._id);
        currentUser.Nfts.splice(findIndex, 1);
        await newOwner.save();
        await currentUser.save();
        await collection.save();
        res
          .status(200)
          .json({ success: true, msg: "Nft Transfered Successfully" });
      } else {
        res.status(404).json({ success: false, msg: "invalid ownership" });
      }
    } else {
      res.status(404).json({ success: false, msg: "no user found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "something went wrong" });
  }
};

// =================================
//
//
// THIS FUNCTINO USED TO Delete NFT
//
//
// =================================
exports.nftdelete = async (req, res) => {
  try {
    if (!req.body.id) {
      return res
        .status(500)
        .json({ status: false, message: "ID is necessary" });
    }
    let exist = await NFTModel.findOne({ _id: req.body.id }).lean().exec();
    if (!exist) {
      return res
        .status(404)
        .json({ status: false, message: "This id is not exists" });
    } else {
      await NFTModel.findByIdAndDelete({ _id: req.body.id }).exec();

      var user = await UserModel.findOne({ address: req.user.address });

      var serNftIdsAry = user.Nfts;
      var indexOfNftID = user.Nfts.indexOf(req.body.id);

      serNftIdsAry.splice(indexOfNftID, 1);

      user.save();
      return res
        .status(200)
        .json({ status: true, message: "Sucessfully deleted" });
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
// NFt with LOWESt PRICE
//
//
// =================================
exports.lowestPriceNFTs = async (req, res) => {
  try {
    let chainId = parseInt(req.body.chainId);
    let count = await NFTModel.countDocuments({ chainId }).exec();
    if (count < 1) {
      return res.status(500).json({ status: false, message: "NFTs Not Found" });
    } else {
      let filterData = await NFTModel.find({ chainId })
        .sort({ price: 1 })
        .skip((parseInt(req.body.page) - 1) * parseInt(req.body.size))
        .limit(parseInt(req.body.size))
        .lean()
        .exec();
      let totalPage = Math.ceil(count / parseInt(req.body.size));
      return res.status(200).json({
        status: true,
        message: "All NFTs With Respect to LoW Price",
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
// NFTS WITH HEIGHT PRICE
//
//
// =================================

exports.highestPriceNFTs = async (req, res) => {
  try {
    let chainId = parseInt(req.body.chainId);
    let count = await NFTModel.countDocuments({ chainId }).exec();
    if (count < 1) {
      return res.status(500).json({ status: false, message: "NFTs Not Found" });
    } else {
      let filterData = await NFTModel.find({ chainId })
        .sort({ price: -1 })
        .skip((parseInt(req.body.page) - 1) * parseInt(req.body.size))
        .limit(parseInt(req.body.size))
        .lean()
        .exec();
      let totalPage = Math.ceil(count / parseInt(req.body.size));
      return res.status(200).json({
        status: true,
        message: "All NFTs With Respect to High Price",
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
// SINGLE NFT
//
//
// =================================
exports.singleNFTs = async (req, res) => {
  try {
    var user = await UserModel.findOne({ address: req.user.address });
    if (!user) {
      return res.status(404).json({ success: false, msg: "invalid Token" });
    } else {
      var nftdata = await NFTModel.findOne({
        address: req.body.address,
        tokenId: req.body.tokenId,
        tokenAddress: req.body.tokenAddress,
      })
        .populate({ path: "owner" })
        .populate({ path: "collections" });
      return res.status(200).json({ success: true, data: nftdata });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, msg: "something went wrong with" });
  }
};

// =================================
//
//
// THIS FUNCTION USED TO FIND NFTS BY USER ADDRESS
//
//
// =================================
exports.nftsByWltAddress = async (req, res) => {
  try {
    console.log(req.user);
    var user = await UserModel.findOne({ address: req.user.address }).populate({
      path: "Nfts",
    });
    if (!user) {
      return res.status(404).json({ success: false, msg: "user not found" });
    } else {
      var nfts = user.Nfts;
      var page_size = req.body.size;
      var page_number = req.body.page;
      var totalPages = Math.ceil(nfts.length / page_size);

      var result = await paginate(nfts, page_size, page_number);

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

// =================================
//
//
// THIS FUNCTION USED TO FIND LIKED NFTS BY USER ADDRESS
//
//
// =================================
exports.myLikedNFT = async (req, res) => {
  try {
    var nftdata = await NFTModel.find({
      likedAddress: req.user.address.toLowerCase(),
    });
    return res.status(200).json({
      status: true,
      message: "You have like " + nftdata.length + " NFT",
      data: nftdata,
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
// THIS FUNCTION USED TO FIND My NFTS
//
//
// =================================
exports.myNfts = async (req, res) => {
  try {
    var currentUser = await UserModel.findOne({
      address: req.user.address,
    }).populate({ path: "Nfts" });
    if (currentUser) {
      console.log(currentUser);
      var nfts = currentUser.Nfts;
      if (nfts.length >= 1) {
        var filteredNfts = [];
        nfts.forEach((item, index) => {
          if (
            item.chainId === req.body.chainId &&
            item.isOnSell === req.body.isOnSell &&
            item.tokenAddress === req.body.tokenAddress
          ) {
            filteredNfts.push(item);
          }
        });
        res.status(200).json({ success: true, data: filteredNfts });
      } else {
        res.status(404).json({ success: false, msg: "no data found" });
      }
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
// THIS FUNCTION USED TO FIND NFTS THAT ARE MOST LIKED
//
//
// =================================

exports.mostLikedNfts = async (req, res) => {
  try {
    let chainId = parseInt(req.body.chainId);
    let count = await NFTModel.countDocuments({ chainId }).exec();
    if (count < 1) {
      return res.status(500).json({ status: false, message: "NFTs Not Found" });
    } else {
      let filterData = await NFTModel.find({ chainId })
        .sort({ likes: 1 })
        .skip((parseInt(req.body.page) - 1) * parseInt(req.body.size))
        .limit(parseInt(req.body.size))
        .lean()
        .exec();
      let totalPage = Math.ceil(count / parseInt(req.body.size));
      return res.status(200).json({
        status: true,
        message: "All NFTs With Respect to Most Likes",
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
// THIS FUNCTION USED TO FIND NFTS WITH LEAST LIEKS
//
//
// =================================
exports.leastLikedNfts = async (req, res) => {
  try {
    let chainId = parseInt(req.body.chainId);
    let count = await NFTModel.countDocuments({ chainId }).exec();
    if (count < 1) {
      return res.status(500).json({ status: false, message: "NFTs Not Found" });
    } else {
      let filterData = await NFTModel.find({ chainId })
        .sort({ likes: -1 })
        .skip((parseInt(req.body.page) - 1) * parseInt(req.body.size))
        .limit(parseInt(req.body.size))
        .lean()
        .exec();
      let totalPage = Math.ceil(count / parseInt(req.body.size));
      return res.status(200).json({
        status: true,
        message: "All NFTs With Respect to Least Likes",
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
// THIS FUNCTION USED TO ADD LIKE ON NFT
//
//
// =================================

exports.addLike = async function (req, res) {
  try {
    const nft = await NFTModel.findOne({ _id: req.body.id }).exec();
    if (nft) {
      if (
        nft.likedAddress.length > 0 &&
        nft.likedAddress.filter((x) => x == req.user.address).length > 0
      ) {
        let likeCount = nft.likes - 1;
        await NFTModel.findOneAndUpdate(
          { _id: req.body.id },
          { likes: likeCount, $pull: { likedAddress: req.user.address } }
        ).exec();
        return res
          .status(200)
          .json({ status: true, message: "You disliked this NFT" });
      } else {
        let likeCount = nft.likes + 1;
        await NFTModel.findOneAndUpdate(
          { email: req.user.email, org: req.user.org },
          { likes: likeCount, $push: { likedAddress: req.user.address } }
        ).exec();
        return res
          .status(200)
          .json({ status: true, message: "You liked this NFT" });
      }
    } else {
      return res.status(500).json({ status: false, message: "NFT Not found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

//  get all NewEst Nfts

exports.oldest = async (req, res) => {
  try {
    // console.log("this route is working");
    if (!req.body.chainId || !req.body.size || !req.body.page) {
      return res
        .status(400)
        .json({ success: false, msg: "add correct body data" });
    }
    let chainId = parseInt(req.body.chainId);
    let count = await NFTModel.countDocuments({ chainId }).exec();
    if (count < 1) {
      return res.status(500).json({ status: false, message: "NFTs Not Found" });
    } else {
      let filterData = await NFTModel.find({ chainId })
        .skip((parseInt(req.body.page) - 1) * parseInt(req.body.size))
        .limit(parseInt(req.body.size))
        .lean()
        .exec();
      // console.log("this is filterData", filterData);
      let totalPage = Math.ceil(count / parseInt(req.body.size));
      return res.status(200).json({
        status: true,
        message: "All Newest Nfts",
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

// ==========================
//
//         On Sell Nfts
//
// =========================

exports.onSell = async (req, res) => {
  try {
    console.log(req.body);
    if (
      !req.body.chainId ||
      !req.body.size ||
      !req.body.page ||
      !req.body.onSell
    ) {
      return res
        .status(400)
        .json({ success: false, msg: "add correct body data" });
    }
    let chainId = parseInt(req.body.chainId);
    let count = await NFTModel.countDocuments({ chainId }).exec();
    if (count < 1) {
      return res.status(500).json({ status: false, message: "NFTs Not Found" });
    } else {
      let filterData = await NFTModel.find({
        chainId,
        isOnSell: req.body.onSell,
      })
        .skip((parseInt(req.body.page) - 1) * parseInt(req.body.size))
        .limit(parseInt(req.body.size))
        .lean()
        .exec();
      // console.log("this is filterData", filterData);
      let totalPage = Math.ceil(count / parseInt(req.body.size));

      filterData.reverse();
      return res.status(200).json({
        status: true,
        message: "All Newest Nfts that are on Sell",
        data: filterData,
        totalPage,
      });
    }
  } catch (err) {
    console.log("this is an erro", err);
    res.status(500).json({ msg: "server Error", success: false });
  }
};
