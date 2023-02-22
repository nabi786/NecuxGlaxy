const NFTModel = require("../models/nft");

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
      tokenAddress: req.body.tokenAddress.toLowerCase(),
    })
      .lean()
      .exec();
    if (exist) {
      return res.status(500).json({
        status: false,
        message: "This Token ID and token Address is already exists",
      });
    } else {
      await new NFTModel({
        name: req.body.name,
        tokenAddress: req.body.tokenAddress.toLowerCase(),
        tokenId: req.body.tokenId,
        image: req.file.filename,
        // price: req.body.price,
        owner: req.user.address,
        selectedCat: req.body.selectedCategory,
        tokenUri: req.body.tokenUri,
        externalLink: req.body.externalLink,
        description: req.body.description,
        chainId: req.body.chainId,
        status: "active",
        // withEther: req.body.withEther
        royality: req.body.royality,
      }).save();
    }
    return res
      .status(200)
      .json({ status: false, message: "Sucessfully created" });
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
    if (!req.body.id) {
      return res
        .status(500)
        .json({ status: false, message: "ID is necessary" });
    }
    let exist = await NFTModel.findOne({ _id: req.body.id }).lean().exec();
    if (!exist) {
      return res
        .status(500)
        .json({ status: false, message: "This id is not exists" });
    } else {
      if (req.file) {
        Object.assign(req.body, { image: req.file.filename });
      }
      await NFTModel.findOneAndUpdate({ _id: req.body.user }, req.body).exec();
    }
    return res
      .status(200)
      .json({ status: true, message: "Sucessfully updated" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
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
        .status(500)
        .json({ status: false, message: "This id is not exists" });
    } else {
      await NFTModel.findByIdAndDelete({ _id: req.body.id }).exec();
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
    var nftdata = await NFTModel.findOne(req.body.filter).lean().exec();
    return res
      .status(200)
      .json({ status: true, message: "Sucess", data: nftdata });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, msg: "something went wrong with", error: err });
  }
};

// =================================
//
//
// THIS FUNCTION USED TO FIND NFTS BY USER ADDRESS
//
//
// =================================
exports.myNFT = async (req, res) => {
  try {
    var nftdata = await NFTModel.find({
      owner: req.user.address.toLowerCase(),
    });
    return res
      .status(200)
      .json({ status: true, message: "Sucess", data: nftdata });
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
// THIS FUNCTION USED TO FIND ALL NFTS
//
//
// =================================

exports.allNFTs = async (req, res) => {
  try {
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
      let totalPage = Math.ceil(count / parseInt(req.body.size));

      filterData.reverse();

      return res.status(200).json({
        status: true,
        message: "All NFTs",
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
