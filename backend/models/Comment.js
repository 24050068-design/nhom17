const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  },

  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);