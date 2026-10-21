const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rating: Number,
  duration: String,
  imageUrl: String,
  genre: String,
  theatreName: String,

  availableSeats: { type: Number, default: 50, min: [0, 'Seats cannot be negative'], max: [50, 'A show has at most 50 seats'] },
  showtime: String,
  description: String,
  director: String,
  cast: [String],
  language: String,
  certificate: String,
  releaseYear: Number,
  trailerUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
