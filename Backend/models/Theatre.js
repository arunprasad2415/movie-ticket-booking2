const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  totalScreens: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Theatre', theatreSchema);
