const mongoose = require('mongoose');

const HadithEmbeddingSchema = new mongoose.Schema({
  refId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  collection: {
    type: String,
    index: true,
  },
  book: {
    type: Number,
  },
  number: {
    type: String,
  },
  text: {
    type: String,
  },
  embedding: {
    type: [Number],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('HadithEmbedding', HadithEmbeddingSchema, 'hadith_embeddings');
