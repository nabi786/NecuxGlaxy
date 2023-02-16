const NFTModel = require("../models/nft");

exports.nftCreate = async (req, res) => {
  try {
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
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

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
