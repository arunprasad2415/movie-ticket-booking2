import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "../styles/MoviesList.css";
import { TicketContext } from "../context/TicketContext";
import { useNavigate } from "react-router-dom";

const MoviesList = () => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  const { setTicketRecipt } = useContext(TicketContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/movies");
        setMovies(res.data);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies");
      }
    };
    fetchMovies();
  }, []);

  const handleBookTicket = (movie) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return navigate("/login");
    }
    setTicketRecipt(movie);
    navigate("/seat-selection", { state: { movie } });
  };

  return (
    <div className="movies-container">
      <h1 className="movies-title">Now Showing</h1>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {movies.length === 0 ? (
        <p style={{ textAlign: "center" }}>No movies available</p>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <div className="movie-card" key={movie._id}>
              <img
                src={movie.imageUrl || "https://via.placeholder.com/300x350?text=No+Image"}
                alt={movie.title}
                className="movie-img"
              />
              <div className="movie-details">
                <h2>{movie.title}</h2>
                <p>Rating: {movie.rating}</p>
                <p>Duration: {movie.duration}</p>
                <p>Theatre: {movie.theatreName}</p>
                <p>Available Seats: {movie.availableSeats}</p>
                <p>Genre: {movie.genre}</p>
                <p>
                  Showtime:{" "}
                  {new Date(movie.showtime).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <button
                  className="book-btn"
                  onClick={() => handleBookTicket(movie)}
                >
                  Book Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesList;
