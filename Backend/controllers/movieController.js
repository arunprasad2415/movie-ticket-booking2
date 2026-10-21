const Movie = require("../models/Movie");
const Booking = require("../models/Booking");
const Theatre = require("../models/Theatre");
const { isValidObjectId } = require("mongoose");

const sendError = (res, error, fallback) =>
  res.status(error.name === "ValidationError" || error.name === "CastError" ? 400 : 500)
    .json({ message: error.name === "ValidationError" ? Object.values(error.errors)[0].message : fallback });

const toList = (value) =>
  Array.isArray(value) ? value : typeof value === "string" ? value.split(",").map((s) => s.trim()).filter(Boolean) : undefined;

const pickFields = ({
  title, rating, duration, imageUrl, theatreName, availableSeats, showtime, genre,
  description, director, cast, language, certificate, releaseYear, trailerUrl,
}) => ({
  title, rating, duration, imageUrl, theatreName, availableSeats, showtime, genre,
  description, director, cast: toList(cast), language, certificate, releaseYear, trailerUrl,
});

const runtimeMinutes = (duration) => {
  const m = /(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/i.exec(duration || "");
  return Number(m?.[1] || 0) * 60 + Number(m?.[2] || 0) || 180;
};

const scheduleProblem = async ({ id, theatreName, showtime, duration }, { requireFuture }) => {
  const theatre = await Theatre.findOne({ name: theatreName });
  if (!theatre) return `Theatre "${theatreName || ""}" doesn't exist. Add it under Theatres first.`;

  const start = new Date(showtime);
  if (isNaN(start)) return "Pick a valid showtime";
  if (requireFuture && start < new Date()) return "Pick a showtime in the future";

  const end = start.getTime() + runtimeMinutes(duration) * 60000;
  const others = await Movie.find({ theatreName, _id: { $ne: id } }, "title showtime duration");
  const overlapping = others.filter((o) => {
    const s = new Date(o.showtime);
    return !isNaN(s) && s < end && s.getTime() + runtimeMinutes(o.duration) * 60000 > start.getTime();
  });
  const screens = theatre.totalScreens || 1;
  if (overlapping.length >= screens)
    return `All ${screens} screen${screens > 1 ? "s" : ""} at ${theatreName} are busy then (${overlapping.map((o) => o.title).join(", ")}). Pick another time or theatre.`;
  return null;
};

exports.addMovie = async (req, res) => {
  try {
    const problem = await scheduleProblem(req.body, { requireFuture: true });
    if (problem) return res.status(400).json({ message: problem });
    const movie = await Movie.create(pickFields(req.body));
    res.status(201).json(movie);
  } catch (error) {
    sendError(res, error, "Error adding movie");
  }
};

exports.updateMovie = async (req, res) => {
  try {
    if (req.body.availableSeats !== undefined) {
      const active = await Booking.find({ movie: req.params.id, status: "Booked" }, "seats");
      const booked = active.reduce((sum, b) => sum + b.seats.length, 0);
      if (Number(req.body.availableSeats) > 50 - booked)
        return res.status(400).json({ message: `Only ${50 - booked} seats are free (${booked} already booked), so available seats can be at most ${50 - booked}.` });
    }
    const current = isValidObjectId(req.params.id) && await Movie.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Movie not found" });

    const next = {
      id: current._id,
      theatreName: req.body.theatreName ?? current.theatreName,
      showtime: req.body.showtime ?? current.showtime,
      duration: req.body.duration ?? current.duration,
    };
    const timeChanged = next.showtime !== current.showtime;
    if (timeChanged || next.theatreName !== current.theatreName || next.duration !== current.duration) {
      const problem = await scheduleProblem(next, { requireFuture: timeChanged });
      if (problem) return res.status(400).json({ message: problem });
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, pickFields(req.body), { new: true, runValidators: true });

    if (timeChanged) await Booking.updateMany({ movie: movie._id }, { showtime: movie.showtime });
    res.json(movie);
  } catch (error) {
    sendError(res, error, "Error updating movie");
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching movies", error });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = isValidObjectId(req.params.id) && await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Error fetching movie", error });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const active = await Booking.countDocuments({ movie: req.params.id, status: "Booked" });
    if (active > 0)
      return res.status(409).json({ message: `This movie has ${active} active booking${active > 1 ? "s" : ""}. Cancel them in Bookings before deleting it.` });
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting movie", error });
  }
};
