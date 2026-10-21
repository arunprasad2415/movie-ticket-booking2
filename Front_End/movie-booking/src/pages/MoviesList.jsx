import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Row, SeatsNote, Tile } from "../components/MovieRow";
import useBookMovie from "../hooks/useBookMovie";
import { formatRating, formatShowtime, makeImageFor, seatsOf } from "../utils/movies";
import "../styles/MoviesList.css";

const HERO_COUNT = 5;
const HERO_MS = 8000;

const MoviesList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const navigate = useNavigate();
  const handleBookTicket = useBookMovie();
  const openMovie = (movie) => navigate(`/movie/${movie._id}`);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get("/api/movies");

        setMovies(res.data.filter((m) => !(new Date(m.showtime) < new Date())));
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const featured = useMemo(
    () => [...movies].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)).slice(0, HERO_COUNT),
    [movies]
  );

  useEffect(() => {
    if (featured.length < 2) return;
    const timer = setTimeout(() => setHeroIndex((i) => (i + 1) % featured.length), HERO_MS);
    return () => clearTimeout(timer);
  }, [heroIndex, featured.length]);

  const imageFor = useMemo(() => makeImageFor(movies), [movies]);

  const rows = useMemo(() => {
    const byGenre = new Map();
    movies.forEach((m) => {
      const g = m.genre || "More Movies";
      byGenre.set(g, [...(byGenre.get(g) || []), m]);
    });
    const result = [{ title: "All Shows", movies }];
    if (byGenre.size > 1) byGenre.forEach((list, g) => result.push({ title: g, movies: list }));
    return result;
  }, [movies]);

  const query = search.trim().toLowerCase();
  const results = query ? movies.filter((m) => m.title?.toLowerCase().includes(query)) : [];

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  const hero = featured[heroIndex];

  return (
    <div className="browse">
      <div className={`browse-search ${searchOpen || search ? "open" : ""}`}>
        <button className="search-toggle" onClick={openSearch} aria-label="Search movies">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
        </button>
        <input
          ref={searchRef}
          type="search"
          placeholder="Titles"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={() => setSearchOpen(false)}
          aria-label="Search movies"
        />
      </div>

      {loading ? (
        <>
          <div className="hero hero-skeleton" />
          <div className="rows">
            <section className="row">
              <div className="sk-title" />
              <div className="row-track">
                {[...Array(5)].map((_, i) => <div className="tile sk-tile" key={i} />)}
              </div>
            </section>
          </div>
        </>
      ) : error ? (
        <p className="browse-error">{error}</p>
      ) : movies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-reel" aria-hidden="true" />
          <h2>No movies yet</h2>
          <p>The projector is warming up. Check back soon!</p>
        </div>
      ) : query ? (
        <section className="search-results">
          <h2 className="row-title">
            {results.length ? `Results for "${search.trim()}"` : `No matches for "${search.trim()}"`}
          </h2>
          <div className="results-grid">
            {results.map((movie, i) => (
              <Tile key={movie._id} movie={movie} image={imageFor(movie)} onBook={handleBookTicket} onOpen={openMovie} index={i} />
            ))}
          </div>
        </section>
      ) : (
        <>
          <section className="hero">
            {featured.map((movie, i) => (
              <img
                key={movie._id}
                src={imageFor(movie)}
                alt=""
                className={`hero-backdrop ${i === heroIndex ? "active" : ""}`}
              />
            ))}
            <div className="hero-shade" />

            <div className="hero-content" key={hero._id}>
              <span className="hero-label">
                <span className="hero-dot" /> Now Showing
              </span>
              <h1 className="hero-title">{hero.title}</h1>
              <div className="hero-meta">
                {hero.rating && <span className="hero-rating">★ {formatRating(hero.rating)}</span>}
                {hero.duration && <span>{hero.duration}</span>}
                {hero.genre && <span className="hero-genre">{hero.genre}</span>}
                {hero.theatreName && <span>{hero.theatreName}</span>}
              </div>
              <p className="hero-time">{formatShowtime(hero.showtime)}</p>
              <div className="hero-actions">
                <button
                  className="hero-btn primary"
                  onClick={() => handleBookTicket(hero)}
                  disabled={seatsOf(hero) === 0}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg>
                  {seatsOf(hero) === 0 ? "Sold Out" : "Book Tickets"}
                </button>
                <button className="hero-btn secondary" onClick={() => openMovie(hero)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 16v-4M12 8h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  More Info
                </button>
                <span className="hero-seats"><SeatsNote movie={hero} /></span>
              </div>
            </div>

            {featured.length > 1 && (
              <div className="hero-dots">
                {featured.map((movie, i) => (
                  <button
                    key={movie._id}
                    className={i === heroIndex ? "active" : ""}
                    onClick={() => setHeroIndex(i)}
                    aria-label={`Show ${movie.title}`}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="rows">
            {rows.map((row, i) => (
              <Row
                key={row.title}
                title={row.title}
                movies={row.movies}
                imageFor={imageFor}
                onBook={handleBookTicket}
                onOpen={openMovie}
                index={i}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MoviesList;
