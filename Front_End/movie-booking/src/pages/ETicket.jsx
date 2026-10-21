import React, { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { TicketContext } from "../context/ticket";
import "../styles/ETicket.css";

const CONFETTI_COLORS = ["#ffcf5a", "#ff3c3c", "#3ddc84", "#ffffff", "#ff8a3c"];

const ETicket = () => {
  const { ticketRecipt } = useContext(TicketContext);

  if (!ticketRecipt?.movie) {
    return <Navigate to="/movies" replace />;
  }

  const { movie, seats, totalPrice, ticketId } = ticketRecipt;
  const showtime = movie.showtime ? new Date(movie.showtime) : null;
  const validDate = showtime && !isNaN(showtime);

  return (
    <div className="page eticket-page">
      <div className="confetti" aria-hidden="true">
        {[...Array(36)].map((_, i) => (
          <i
            key={i}
            style={{
              "--x": `${(i * 37) % 100}%`,
              "--d": `${(i % 9) * 0.12}s`,
              "--r": `${(i * 47) % 360}deg`,
              "--c": CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            }}
          />
        ))}
      </div>

      <header className="page-header eticket-header">
        <div className="success-check" aria-hidden="true">
          <svg viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="24" />
            <path d="M14 27l8 8 16-17" />
          </svg>
        </div>
        <span className="eyebrow-label">You're all set</span>
        <h1 className="page-title">
          Enjoy the <span className="accent">Show!</span>
        </h1>
      </header>

      <div className="ticket">
        <div className="ticket-main">
          <div className="ticket-brand">
            <span>CineBook</span>
            <span className="admit">Admit {seats.length}</span>
          </div>
          <h2>{movie.title}</h2>
          <div className="ticket-grid">
            <div><small>Theatre</small><strong>{movie.theatreName || "—"}</strong></div>
            <div><small>Date</small><strong>{validDate ? showtime.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "TBA"}</strong></div>
            <div><small>Time</small><strong>{validDate ? showtime.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "TBA"}</strong></div>
            <div><small>Seats</small><strong>{seats.join(", ")}</strong></div>
          </div>
        </div>

        <div className="ticket-stub">
          <small>Total paid</small>
          <strong className="stub-price">₹{totalPrice}</strong>
          <div className="barcode" aria-hidden="true" />
          <code>{ticketId || "CINEBOOK"}</code>
        </div>
      </div>

      <div className="eticket-actions">
        <button className="btn btn-ghost" onClick={() => window.print()}>Print Ticket</button>
        {ticketRecipt._id && (
          <Link to={`/account/bookings/${ticketRecipt._id}`} className="btn btn-ghost">View in My Bookings</Link>
        )}
        <Link to="/movies" className="btn btn-primary">Book Another Show</Link>
      </div>
    </div>
  );
};

export default ETicket;
