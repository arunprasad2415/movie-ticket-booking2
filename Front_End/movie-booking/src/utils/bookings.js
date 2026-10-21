import { BACKDROPS } from "./stills";

export const bookingState = (booking) => {
  if (booking.status === "Cancelled") return "cancelled";
  const show = new Date(booking.showtime);
  return isNaN(show) || show >= new Date() ? "upcoming" : "past";
};

export const STATE_LABELS = { upcoming: "Upcoming", past: "Watched", cancelled: "Cancelled" };

export const bookingImage = (booking) =>
  booking.movie?.imageUrl || BACKDROPS[parseInt(booking._id.slice(-4), 16) % BACKDROPS.length];

export const bookingTitle = (booking) => booking.movie?.title || "Movie no longer listed";

const asDate = (value) => {
  const d = new Date(value);
  return isNaN(d) ? null : d;
};

export const showDate = (booking, opts = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) =>
  asDate(booking.showtime)?.toLocaleDateString(undefined, opts) || "Date TBA";

export const showTime = (booking) =>
  asDate(booking.showtime)?.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) || "Time TBA";

export const bookedOn = (booking) =>
  asDate(booking.createdAt)?.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) || "—";
