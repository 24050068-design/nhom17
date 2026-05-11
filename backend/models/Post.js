const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },

  views: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },

  thumbnail: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);