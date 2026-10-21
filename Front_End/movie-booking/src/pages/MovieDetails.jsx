import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Row, SeatsNote } from "../components/MovieRow";
import useBookMovie from "../hooks/useBookMovie";
import { formatRating, makeImageFor, seatsOf, youtubeId } from "../utils/movies";
import "../styles/MovieDetails.css";

const PRICE_PER_SEAT = 100;

const initials = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookMovie = useBookMovie();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    axios
      .get("/api/movies")
      .then((res) => setMovies(res.data))
      .catch(() => setError("Failed to load this movie."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowTrailer(false);
  }, [id]);

  useEffect(() => {
    if (!showTrailer) return;
    const onKey = (e) => e.key === "Escape" && setShowTrailer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showTrailer]);

  const imageFor = useMemo(() => makeImageFor(movies), [movies]);
  const movie = movies.find((m) => m._id === id);

  const similar = useMemo(() => {
    if (!movie) return [];
    const others = movies.filter((m) => m._id !== movie._id && !(new Date(m.showtime) < new Date()));
    const byRating = (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0);
    const sameGenre = others.filter((m) => m.genre === movie.genre).sort(byRating);
    const rest = others.filter((m) => m.genre !== movie.genre).sort(byRating);
    return [...sameGenre, ...rest].slice(0, 10);
  }, [movies, movie]);

  if (loading) return <div className="details-loading"><span className="spinner" /></div>;

  if (error || !movie) {
    return (
      <div className="details-missing">
        <h1>{error || "Movie not found"}</h1>
        <Link to="/movies" className="hero-btn primary">Browse movies</Link>
      </div>
    );
  }

  const trailer = youtubeId(movie.trailerUrl);
  const show = new Date(movie.showtime);
  const validShow = !isNaN(show);
  const seats = seatsOf(movie);
  const soldOut = seats === 0;
  const ended = new Date(movie.showtime) < new Date();
  const closed = soldOut || ended;
  const closedLabel = ended ? "Show ended" : "Sold Out";

  const facts = [
    ["Director", movie.director],
    ["Genre", movie.genre],
    ["Runtime", movie.duration],
    ["Language", movie.language],
    ["Released", movie.releaseYear],
    ["Certificate", movie.certificate],
  ].filter(([, value]) => value);

  return (
    <div className="details" key={movie._id}>
      <section className="details-hero">
        <img className="details-backdrop" src={imageFor(movie)} alt="" />
        <div className="details-shade" />

        <div className="details-hero-content">
          <button className="details-back" onClick={() => navigate(-1)}>
            <span aria-hidden="true">←</span> Back
          </button>

          <h1 className="details-title">{movie.title}</h1>

          <div className="details-meta">
            {movie.rating && <span className="details-rating">★ {formatRating(movie.rating)}</span>}
            {movie.releaseYear && <span>{movie.releaseYear}</span>}
            {movie.certificate && <span className="details-cert">{movie.certificate}</span>}
            {movie.duration && <span>{movie.duration}</span>}
            {movie.language && <span>{movie.language}</span>}
            {movie.genre && <span className="details-genre">{movie.genre}</span>}
          </div>

          {movie.description && <p className="details-synopsis">{movie.description}</p>}

          <div className="details-actions">
            <button className="hero-btn primary" onClick={() => bookMovie(movie)} disabled={closed}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg>
              {closed ? closedLabel : "Book Tickets"}
            </button>
            {trailer && (
              <button className="hero-btn secondary" onClick={() => setShowTrailer(true)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg>
                Watch Trailer
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="details-body">
        <div className="details-main">
          {movie.cast?.length > 0 && (
            <section className="details-section">
              <h2>Cast</h2>
              <ul className="cast-list">
                {movie.cast.map((name, i) => (
                  <li key={name} style={{ "--i": i }}>
                    <span className="cast-avatar">{initials(name)}</span>
                    <span className="cast-name">{name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {facts.length > 0 && (
            <section className="details-section">
              <h2>About</h2>
              <dl className="facts">
                {facts.map(([label, value], i) => (
                  <div key={label} style={{ "--i": i }}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <aside className="showtime-card">
          <h2>Showtime</h2>
          <div className="showtime-when">
            <div className="date-chip">
              <span>{validShow ? show.toLocaleDateString(undefined, { month: "short" }) : "TBA"}</span>
              <strong>{validShow ? show.getDate() : "--"}</strong>
              <span>{validShow ? show.toLocaleDateString(undefined, { weekday: "short" }) : ""}</span>
            </div>
            <div>
              <p className="showtime-time">
                {validShow ? show.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "Time TBA"}
              </p>
              <p className="showtime-theatre">{movie.theatreName || "Theatre TBA"}</p>
            </div>
          </div>

          <div className="showtime-row">
            <span>Price</span>
            <strong>₹{PRICE_PER_SEAT} / seat</strong>
          </div>
          <div className="showtime-row">
            <span>Availability</span>
            <SeatsNote movie={movie} />
          </div>
          <div className="seat-bar">
            <span style={{ width: `${Math.min(100, (seats / 50) * 100)}%` }} className={seats <= 10 ? "low" : ""} />
          </div>

          <button className="showtime-book" onClick={() => bookMovie(movie)} disabled={closed}>
            {closed ? closedLabel : "Select Seats"}
          </button>
        </aside>
      </div>

      {similar.length > 0 && (
        <div className="details-similar">
          <Row
            title="More Like This"
            movies={similar}
            imageFor={imageFor}
            onBook={bookMovie}
            onOpen={(m) => navigate(`/movie/${m._id}`)}
            index={0}
          />
        </div>
      )}

      {showTrailer && (
        <div className="trailer-overlay" onClick={() => setShowTrailer(false)} role="dialog" aria-label={`${movie.title} trailer`}>
          <div className="trailer-frame" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close" onClick={() => setShowTrailer(false)} aria-label="Close trailer">✕</button>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer}?autoplay=1&rel=0`}
              title={`${movie.title} trailer`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
