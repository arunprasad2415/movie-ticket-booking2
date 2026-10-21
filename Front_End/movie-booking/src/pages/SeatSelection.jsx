import React, { useState, useContext, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { TicketContext } from "../context/ticket";
import "../styles/SeatSelection.css";

const rows = 10;
const cols = 5;
const aisleAfter = 2;
const pricePerSeat = 100;
const MAX_SEATS = 10;

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setTicketRecipt } = useContext(TicketContext);

  const movie = location.state?.movie;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [takenSeats, setTakenSeats] = useState([]);

  useEffect(() => {
    if (!movie) return;
    axios
      .get(`/api/bookings/movie/${movie._id}/seats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setTakenSeats(res.data))
      .catch((err) => console.error("Error fetching booked seats:", err));
  }, [movie]);

  if (!movie) return <Navigate to="/movies" replace />;

  const toggleSeat = (seat) => {
    if (takenSeats.includes(seat)) return;
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else if (selectedSeats.length < MAX_SEATS) {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleConfirm = () => {
    const bookingDetails = {
      movie,
      seats: selectedSeats,
      totalPrice: selectedSeats.length * pricePerSeat,
    };
    setTicketRecipt(bookingDetails);
    navigate("/confirmation");
  };

  const total = selectedSeats.length * pricePerSeat;

  return (
    <div className="page seat-page">
      <header className="page-header seat-header">
        <span className="eyebrow-label">Choose your seats</span>
        <h1 className="page-title">{movie.title}</h1>
        <div className="seat-header-meta">
          {movie.theatreName && <span>{movie.theatreName}</span>}
          {movie.showtime && <span>{new Date(movie.showtime).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>}
          <span>₹{pricePerSeat} / seat</span>
        </div>
      </header>

      <div className="theatre">
        <div className="screen-wrap" aria-hidden="true">
          <div className="screen" />
          <span>Screen this way</span>
        </div>

        <div className="seats-grid">
          {[...Array(rows)].map((_, rowIndex) => {
            const rowLetter = String.fromCharCode(65 + rowIndex);
            return (
              <div key={rowIndex} className="seat-row" style={{ "--r": rowIndex }}>
                <span className="row-label">{rowLetter}</span>
                {[...Array(cols)].map((_, colIndex) => {
                  const seatId = `${rowLetter}-${colIndex + 1}`;
                  const isSelected = selectedSeats.includes(seatId);
                  const isTaken = takenSeats.includes(seatId);
                  return (
                    <React.Fragment key={seatId}>
                      {colIndex === aisleAfter && <span className="aisle" />}
                      <button
                        className={`seat ${isSelected ? "selected" : ""} ${isTaken ? "booked" : ""}`}
                        onClick={() => toggleSeat(seatId)}
                        disabled={isTaken}
                        aria-pressed={isSelected}
                        aria-label={`Seat ${seatId}${isTaken ? " (booked)" : ""}`}
                        title={seatId}
                      >
                        <span>{colIndex + 1}</span>
                      </button>
                    </React.Fragment>
                  );
                })}
                <span className="row-label">{rowLetter}</span>
              </div>
            );
          })}
        </div>

        <div className="legend">
          <span><i className="seat-dot" /> Available</span>
          <span><i className="seat-dot selected" /> Selected</span>
          <span><i className="seat-dot booked" /> Booked</span>
        </div>
      </div>

      <div className={`summary ${selectedSeats.length ? "has-seats" : ""}`}>
        <div className="summary-seats">
          {selectedSeats.length === 0 ? (
            <span className="summary-hint">Tap a seat to start (up to {MAX_SEATS} per booking)</span>
          ) : (
            selectedSeats.map((s) => (
              <span key={s} className="seat-chip">{s}</span>
            ))
          )}
        </div>
        <div className="summary-total">
          <small>{selectedSeats.length} seat{selectedSeats.length === 1 ? "" : "s"}</small>
          <strong key={total}>₹{total}</strong>
        </div>
        <button
          className="btn btn-primary confirm-btn"
          disabled={selectedSeats.length === 0}
          onClick={handleConfirm}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
