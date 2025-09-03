import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TicketContext } from "../context/TicketContext";
import "../styles/SeatSelection.css";

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setTicketRecipt } = useContext(TicketContext);

  const movie = location.state?.movie;
  const rows = 10;
  const cols = 5;
  const pricePerSeat = 100;

  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
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

  return (
    <div className="seat-selection-container">
      <h1>Select Your Seats for {movie?.title}</h1>
      <div className="seats-grid">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {[...Array(cols)].map((_, colIndex) => {
              const seatId = `${String.fromCharCode(65 + rowIndex)}-${colIndex + 1}`;
              const isSelected = selectedSeats.includes(seatId);
              return (
                <button
                  key={seatId}
                  className={`seat ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleSeat(seatId)}
                >
                  {seatId}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="summary">
        <p>Selected Seats: {selectedSeats.join(", ") || "None"}</p>
        <p>Total Price: ₹{selectedSeats.length * pricePerSeat}</p>
        <button
          className="confirm-btn"
          disabled={selectedSeats.length === 0}
          onClick={handleConfirm}
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
