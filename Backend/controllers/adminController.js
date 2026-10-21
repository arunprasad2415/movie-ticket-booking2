const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');

const ROLES = ['User', 'Manager', 'Admin'];

exports.createUser = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password, role = 'User' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (await User.exists({ email })) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, role, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { role } = req.body;
    const isSelf = req.user._id.equals(req.params.id);

    if (role && !ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });

    if (isSelf && role && role !== req.user.role) return res.status(400).json({ message: "You can't change your own role" });
    if (email && await User.exists({ email, _id: { $ne: req.params.id } }))
      return res.status(400).json({ message: 'That email is already used by another account' });

    const user = await User.findByIdAndUpdate(req.params.id, { name, email, role },
      { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.equals(req.params.id)) return res.status(400).json({ message: "You can't delete your own account" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const active = await Booking.find({ user: user._id, status: 'Booked' });
    for (const booking of active) {
      await Movie.findByIdAndUpdate(booking.movie, { $inc: { availableSeats: booking.seats.length } });
      booking.status = 'Cancelled';
      await booking.save();
    }

    await user.deleteOne();
    res.json({ message: `Deleted ${user.name}`, cancelledBookings: active.length });
  } catch (err) { next(err); }
};
