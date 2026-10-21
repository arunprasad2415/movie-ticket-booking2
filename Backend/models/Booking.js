const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
  showtime: String,
  seats: [String],
  totalPrice: Number,
  status: { type: String, enum: ['Booked','Cancelled'], default: 'Booked' },
  ticketId: String
}, { timestamps: true });

bookingSchema.index(
  { movie: 1, seats: 1 },
  { unique: true, partialFilterExpression: { status: 'Booked' }, name: 'one_active_booking_per_seat' }
);

module.exports = mongoose.model('Booking', bookingSchema);
