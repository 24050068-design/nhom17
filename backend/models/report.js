const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  reason: String
});

module.exports = mongoose.model("Report", reportSchema);