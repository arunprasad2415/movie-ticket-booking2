import React, { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import Icon from "../../components/Icon";
import api from "../../utils/api";
import {
  STATE_LABELS, bookedOn, bookingImage, bookingState, bookingTitle, showDate, showTime,
} from "../../utils/bookings";

const BookingDetails = () => {
  const { id } = useParams();
  const { bookings, reload } = useOutletContext();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const booking = bookings.find((b) => b._id === id);

  if (!booking) {
    return (
      <section className="account-panel">
        <div className="account-empty">
          <span className="empty-icon"><Icon name="ticket" size={28} /></span>
          <h3>Booking not found</h3>
          <p>It may have been removed, or it belongs to another account.</p>
          <Link to="/account/bookings" className="btn btn-primary">Back to My Bookings</Link>
        </div>
      </section>
    );
  }

  const state = bookingState(booking);
  const movie = booking.movie;
  const pricePerSeat = booking.seats.length ? Math.round(booking.totalPrice / booking.seats.length) : 0;

  const cancelBooking = async () => {
    setCancelling(true);
    setError("");
    try {
      await api.put(`/bookings/cancel/${booking._id}`);
      await reload();
      setConfirming(false);
      setNotice("Booking cancelled. Your seats have been released.");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't cancel this booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <section className="account-panel booking-detail">
      <Link to="/account/bookings" className="back-link">
        <Icon name="arrowLeft" size={16} /> All bookings
      </Link>

      {notice && <div className="account-message success"><Icon name="check" /> {notice}</div>}

      <article className={`bd-ticket ${state}`}>
        <div className="bd-media">
          <img src={bookingImage(booking)} alt="" />
          <div className="bd-media-content">
            <span className={`status-badge ${state}`}>{STATE_LABELS[state]}</span>
            <h2>{bookingTitle(booking)}</h2>
            <p>
              {[movie?.certificate, movie?.duration, movie?.genre, movie?.language].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        <div className="bd-body">
          <dl className="bd-facts">
            <div><dt><Icon name="calendar" size={15} /> Date</dt><dd>{showDate(booking)}</dd></div>
            <div><dt><Icon name="clock" size={15} /> Time</dt><dd>{showTime(booking)}</dd></div>
            <div><dt><Icon name="mapPin" size={15} /> Theatre</dt><dd>{movie?.theatreName || "—"}</dd></div>
            <div><dt><Icon name="ticket" size={15} /> Booked on</dt><dd>{bookedOn(booking)}</dd></div>
          </dl>

          <div className="bd-seats">
            <span className="bd-label">Seats ({booking.seats.length})</span>
            <div className="seat-chips large">
              {booking.seats.map((s) => <span key={s}>{s}</span>)}
            </div>
          </div>
        </div>

        <div className="bd-stub">
          <div className="bd-barcode" aria-hidden="true" />
          <code>{booking.ticketId}</code>
          <small>{state === "upcoming" ? "Show this code at the entrance" : "Ticket reference"}</small>
        </div>
      </article>

      <div className="bd-bottom">
        <div className="bd-payment">
          <h3>Payment summary</h3>
          <div className="pay-row"><span>Tickets ({booking.seats.length} × ₹{pricePerSeat})</span><span>₹{booking.totalPrice}</span></div>
          <div className="pay-row"><span>Convenience fee</span><span className="free">Free</span></div>
          <div className="pay-row total"><span>{state === "cancelled" ? "Refunded" : "Total paid"}</span><span>₹{booking.totalPrice}</span></div>
        </div>

        <div className="bd-actions">
          <button className="btn btn-ghost" onClick={() => window.print()}>
            <Icon name="printer" size={16} /> Print ticket
          </button>
          {movie && (
            <Link to={`/movie/${movie._id}`} className="btn btn-ghost">
              <Icon name="film" size={16} /> View movie
            </Link>
          )}
          {state === "upcoming" && !confirming && (
            <button className="btn btn-danger" onClick={() => setConfirming(true)}>
              Cancel booking
            </button>
          )}
        </div>
      </div>

      {confirming && (
        <div className="cancel-confirm" role="alertdialog" aria-label="Confirm cancellation">
          <div>
            <h3>Cancel this booking?</h3>
            <p>
              Seats {booking.seats.join(", ")} for {bookingTitle(booking)} will be released and ₹{booking.totalPrice} refunded.
              This can't be undone.
            </p>
            {error && <div className="account-message error"><Icon name="alert" /> {error}</div>}
          </div>
          <div className="cancel-actions">
            <button className="btn btn-ghost" onClick={() => { setConfirming(false); setError(""); }} disabled={cancelling}>
              Keep booking
            </button>
            <button className="btn btn-danger solid" onClick={cancelBooking} disabled={cancelling}>
              {cancelling ? <span className="spinner" /> : "Yes, cancel"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default BookingDetails;
