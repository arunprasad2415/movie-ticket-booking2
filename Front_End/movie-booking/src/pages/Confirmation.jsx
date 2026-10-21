import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { TicketContext } from "../context/ticket";
import "../styles/Confirmation.css";

const Confirmation = () => {
  const { ticketRecipt, setTicketRecipt } = useContext(TicketContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!ticketRecipt || !ticketRecipt.movie) {
    return <Navigate to="/movies" replace />;
  }

  const { movie, seats, totalPrice } = ticketRecipt;

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          movieId: movie._id,
          movieTitle: movie.title,
          theatreName: movie.theatreName,
          showtime: movie.showtime,
          seats,
          totalPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to confirm booking");
      }

      setTicketRecipt({ ...ticketRecipt, _id: data._id, ticketId: data.ticketId });
      navigate("/eticket");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page confirm-page">
      <header className="page-header">
        <span className="eyebrow-label">Step 2 of 2</span>
        <h1 className="page-title">
          Confirm <span className="accent">Booking</span>
        </h1>
      </header>

      <div className="confirm-layout">
        <section className="confirm-movie glass">
          <div
            className="confirm-poster"
            style={movie.imageUrl ? { backgroundImage: `url(${movie.imageUrl})` } : undefined}
          >
            {!movie.imageUrl && <span>{movie.title}</span>}
          </div>
          <div className="confirm-info stagger">
            <h2 style={{ "--i": 0 }}>{movie.title}</h2>
            <dl style={{ "--i": 1 }}>
              <div><dt>Theatre</dt><dd>{movie.theatreName || "—"}</dd></div>
              <div><dt>Showtime</dt><dd>{movie.showtime ? new Date(movie.showtime).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Not specified"}</dd></div>
              <div><dt>Duration</dt><dd>{movie.duration || "—"}</dd></div>
              <div><dt>Rating</dt><dd>{movie.rating ? `★ ${movie.rating}` : "—"}</dd></div>
            </dl>
            <div className="confirm-seats" style={{ "--i": 2 }}>
              {seats.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </section>

        <aside className="receipt">
          <h3>Order Summary</h3>
          <div className="receipt-row">
            <span>Tickets × {seats.length}</span>
            <span>₹{totalPrice}</span>
          </div>
          <div className="receipt-row">
            <span>Convenience fee</span>
            <span className="free">FREE</span>
          </div>
          <div className="receipt-divider" />
          <div className="receipt-row total">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>

          {error && <p className="alert" key={error}>{error}</p>}

          <button
            className="btn btn-primary"
            onClick={handleConfirmBooking}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Booking...</> : "Confirm & Get E-Ticket"}
          </button>
          <button className="btn btn-ghost" onClick={() => navigate(-1)} disabled={loading}>
            ← Change seats
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Confirmation;
