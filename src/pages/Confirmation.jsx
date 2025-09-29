import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TicketContext } from "../context/TicketContext";
import "../styles/Confirmation.css";

const Confirmation = () => {
  const { ticketRecipt } = useContext(TicketContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!ticketRecipt || !ticketRecipt.movie) {
    return <h2 style={{ textAlign: "center" }}>No booking details found</h2>;
  }

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://backend2-3-hmvz.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: ticketRecipt.movie._id,
          movieTitle: ticketRecipt.movie.title,
          theatreName: ticketRecipt.movie.theatreName,
          showtime: ticketRecipt.movie.showtime,
          seats: ticketRecipt.seats,
          totalPrice: ticketRecipt.totalPrice,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to confirm booking");
      }

      const data = await res.json();
      ticketRecipt._id = data._id;

      navigate("/eticket");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="confirmation-container">
      <h1>Confirm Your Booking</h1>

      <h2>{ticketRecipt.movie.title}</h2>
      <p><strong>Theatre:</strong> {ticketRecipt.movie.theatreName}</p>
      <p><strong>Duration:</strong> {ticketRecipt.movie.duration}</p>
      <p><strong>Rating:</strong> {ticketRecipt.movie.rating}</p>
      <p>
        <strong>Showtime:</strong>{" "}
        {ticketRecipt.movie.showtime
          ? new Date(ticketRecipt.movie.showtime).toLocaleString()
          : "Not specified"}
      </p>

      <p><strong>Seats:</strong> {ticketRecipt.seats.join(", ")}</p>
      <p><strong>Total Price:</strong> ₹{ticketRecipt.totalPrice}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        className="final-confirm-btn"
        onClick={handleConfirmBooking}
        disabled={loading}
      >
        {loading ? "Booking..." : "Confirm & Generate E-Ticket"}
      </button>
    </div>
  );
};

export default Confirmation;
