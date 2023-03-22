var mongoose = require("mongoose");

const adminRegiterSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("admin", adminRegiterSchema);
