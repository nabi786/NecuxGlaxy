const CollectionModel = require('../models/collection');
const NFTModel = require('../models/nft')
const UserModels = require('../models/user');


exports.search = async (req, res) => {
    try {
      const { search } = req.body.search;
      
      if(search){
        const collection = await CollectionModel.find({ name: { $regex:'^' + search, $options: 'i'} }).lean().exec();
        const user = await UserModels.find({ $or:[{firstName: { $regex:'^' + search, $options: 'i'} },{lastName: { $regex:'^' + search, $options: 'i'} }]}).lean().exec();
        const nft = await NFTModel.find({ "metadata.name": { $regex:'^' + search, $options: 'i'} }).lean().exec();
        return res.status(200).json({status:true,message: "success",data: {collection,user,nft}});
      }
      else{
        return res.status(200).json({message: "success",data: {collections:"",users:"",nft:""}})
      }
    } catch (error) {
      res.status(500).json({success : false, msg : "something went wrong"  ,message: error.toString() });
    }
  }