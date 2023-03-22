var mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    Collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "collection",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("category", categorySchema);
