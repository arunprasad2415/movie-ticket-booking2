const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const { isValidObjectId } = require('mongoose');
const { randomUUID: uuidv4 } = require('crypto');

const SEAT_PATTERN = /^[A-J]-[1-5]$/;
const MAX_SEATS_PER_BOOKING = 10;

exports.book = async (req, res, next) => {
  try {
    const { movieId, seats } = req.body;
    if (!movieId || !Array.isArray(seats) || seats.length === 0)
      return res.status(400).json({ message: 'Missing data' });
    if (!isValidObjectId(movieId)) return res.status(404).json({ message: 'Movie not found' });
    if (new Set(seats).size !== seats.length) return res.status(400).json({ message: 'The same seat was picked twice' });
    const invalid = seats.filter(s => typeof s !== 'string' || !SEAT_PATTERN.test(s));
    if (invalid.length) return res.status(400).json({ message: `Seat(s) don't exist: ${invalid.join(', ')}` });
    if (seats.length > MAX_SEATS_PER_BOOKING)
      return res.status(400).json({ message: `You can book at most ${MAX_SEATS_PER_BOOKING} seats at a time` });

    const show = await Movie.findById(movieId, 'showtime');
    if (!show) return res.status(404).json({ message: 'Movie not found' });
    if (new Date(show.showtime) < new Date())
      return res.status(400).json({ message: 'This show has already started, so it can no longer be booked' });

    const taken = await Booking.findOne({ movie: movieId, status: 'Booked', seats: { $in: seats } });
    if (taken) return res.status(400).json({ message: `Seat(s) already booked: ${taken.seats.filter(s => seats.includes(s)).join(', ')}` });

    let booking;
    try {
      booking = await Booking.create({
        user: req.user._id,
        movie: movieId,
        showtime: show.showtime,
        seats,
        totalPrice: seats.length * 100,
        ticketId: `TICKET-${uuidv4().slice(0, 8).toUpperCase()}`
      });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: 'Someone just booked one of those seats. Please pick different seats.' });
      throw err;
    }

    const movie = await Movie.findOneAndUpdate(
      { _id: movieId, availableSeats: { $gte: seats.length } },
      { $inc: { availableSeats: -seats.length } }
    );
    if (!movie) {
      await booking.deleteOne();
      return res.status(400).json({ message: 'Not enough seats left for this show' });
    }

    res.status(201).json(booking);
  } catch (err) { next(err); }
};

exports.getMy = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('movie');
    res.json(bookings);
  } catch (err) { next(err); }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).populate('user', 'name email role').populate('movie');
    res.json(bookings);
  } catch (err) { next(err); }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = isValidObjectId(req.params.id) && await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!booking.user.equals(req.user._id) && req.user.role === 'User')
      return res.status(403).json({ message: 'Access denied' });
    if (booking.status === 'Cancelled') return res.status(400).json({ message: 'Already cancelled' });
    if (new Date(booking.showtime) < new Date())
      return res.status(400).json({ message: "This show has already started, so it can't be cancelled" });

    await Movie.findByIdAndUpdate(booking.movie, { $inc: { availableSeats: booking.seats.length } });
    booking.status = 'Cancelled';
    await booking.save();
    res.json({ message: 'Cancelled' });
  } catch (err) { next(err); }
};

exports.getTakenSeats = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ movie: req.params.id, status: 'Booked' }, 'seats');
    res.json(bookings.flatMap(b => b.seats));
  } catch (err) { next(err); }
};
