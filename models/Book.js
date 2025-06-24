
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide book title'],
    trim: true,
  },
  author: {
    type: String,
    required: [true, 'Please provide book author'],
    trim: true,
  },
  genre: {
    type: String,
    enum: ['Fiction', 'Nonfiction', 'Fantasy', 'Sci-Fi', 'Biography', 'Other'],
    default: 'Other'
  },
  publishedDate: {
    type: Date,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String], // Array of strings
    default: []
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Ensures every book is tied to a user
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
