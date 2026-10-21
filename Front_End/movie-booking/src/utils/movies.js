const FALLBACK_STILLS = [
  "/images/backdrops/simpsons.jpg",
  "/images/backdrops/despicable4.jpg",
  "/images/backdrops/garfield.jpg",
  "/images/backdrops/godzillakong.jpg",
  "/images/backdrops/deadpool.jpg",
];

export const LOW_SEATS = 10;

export const formatShowtime = (showtime) => {
  const d = new Date(showtime);
  return isNaN(d) ? "Showtime TBA" : d.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
};

export const seatsOf = (movie) => Number(movie.availableSeats) || 0;

export const formatRating = (rating) => (isNaN(Number(rating)) ? rating : Number(rating).toFixed(1));

export const makeImageFor = (movies) => {
  const position = new Map(movies.map((m, i) => [m._id, i]));
  return (movie) => movie.imageUrl || FALLBACK_STILLS[(position.get(movie._id) || 0) % FALLBACK_STILLS.length];
};

export const youtubeId = (url = "") => url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
