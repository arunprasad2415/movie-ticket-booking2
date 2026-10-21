import React, { useEffect, useRef, useState } from "react";
import { LOW_SEATS, formatRating, formatShowtime, seatsOf } from "../utils/movies";
import "../styles/MoviesList.css";

export const SeatsNote = ({ movie }) => {
  const seats = seatsOf(movie);
  if (seats === 0) return <span className="seats-note sold">Sold out</span>;
  if (seats <= LOW_SEATS) return <span className="seats-note low">Only {seats} left</span>;
  return <span className="seats-note">{seats} seats left</span>;
};

export const Tile = ({ movie, image, onBook, onOpen, index }) => (
  <article
    className="tile"
    style={{ "--i": index }}
    onClick={() => onOpen(movie)}
    onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && onOpen(movie)}
    tabIndex={0}
    role="link"
    aria-label={`${movie.title} details`}
  >
    <div className="tile-media">
      <img src={image} alt="" loading="lazy" />
      <span className="tile-title">{movie.title}</span>
    </div>
    <div className="tile-info">
      <div className="tile-actions">
        <button
          className="tile-book"
          onClick={(e) => {
            e.stopPropagation();
            onBook(movie);
          }}
          disabled={seatsOf(movie) === 0}
          aria-label={`Book ${movie.title}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg>
          Book
        </button>
        {movie.rating && <span className="tile-rating">★ {formatRating(movie.rating)}</span>}
      </div>
      <div className="tile-meta">
        <SeatsNote movie={movie} />
        {movie.duration && <span>{movie.duration}</span>}
        {movie.genre && <span>{movie.genre}</span>}
      </div>
      <p className="tile-time">{formatShowtime(movie.showtime)}{movie.theatreName ? ` · ${movie.theatreName}` : ""}</p>
    </div>
  </article>
);

export const Row = ({ title, movies, imageFor, onBook, onOpen, index }) => {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const t = trackRef.current;
    if (!t) return;
    setCanLeft(t.scrollLeft > 4);
    setCanRight(t.scrollLeft + t.clientWidth < t.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [movies.length]);

  const scroll = (dir) => {
    const track = trackRef.current;
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="row" style={{ "--r": index }}>
      <h2 className="row-title">{title}</h2>
      <div className="row-viewport">
        {canLeft && (
          <button className="row-arrow left" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}>‹</button>
        )}
        <div className="row-track" ref={trackRef} onScroll={updateArrows}>
          {movies.map((movie, i) => (
            <Tile key={movie._id} movie={movie} image={imageFor(movie)} onBook={onBook} onOpen={onOpen} index={i} />
          ))}
        </div>
        {canRight && (
          <button className="row-arrow right" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}>›</button>
        )}
      </div>
    </section>
  );
};
