import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConfirmButton from "../../../components/ConfirmButton";
import Icon from "../../../components/Icon";
import api from "../../../utils/api";
import { STATE_LABELS, bookedOn, bookingState, bookingTitle, showDate, showTime } from "../../../utils/bookings";
import { makeImageFor } from "../../../utils/movies";
import { initialsOf } from "../../../utils/session";
import SeatGrid from "../SeatGrid";
import { BackLink, Missing } from "../Section";

const BookingInsight = ({ data, reload, notify, base, isAdmin }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const imageFor = useMemo(() => makeImageFor(data.movies), [data.movies]);
  const listPath = `${base}/bookings`;

  const found = data.bookings.find((b) => b._id === id);
  if (!found) return <Missing what="Booking" back={listPath} backLabel="All bookings" />;

  const booking = { ...found, state: bookingState(found) };
  const movie = booking.movie;
  const theatre = movie && data.theatres.find((t) => t.name === movie.theatreName);
  const customerBookings = booking.user ? data.bookings.filter((b) => b.user?._id === booking.user._id).length : 0;

  const owners = {};
  data.bookings
    .filter((b) => b.status === "Booked" && b.movie?._id === movie?._id)
    .forEach((b) => b.seats.forEach((s) => { owners[s] = b; }));

  const cancel = async () => {
    try {
      await api.put(`/bookings/cancel/${booking._id}`);
      notify("success", `${booking.ticketId} cancelled. Seats ${booking.seats.join(", ")} are available again.`);
      await reload();
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't cancel the booking.");
    }
  };

  return (
    <div className="detail-page">
      <BackLink to={listPath}>All bookings</BackLink>

      <section className={`ticket-hero ${booking.state}`}>
        <div className="ticket-hero-main">
          <span className={`pill ${booking.state}`}>{STATE_LABELS[booking.state]}</span>
          <h1><code>{booking.ticketId}</code></h1>
          <dl className="ticket-hero-facts">
            <div><dt>Amount</dt><dd>₹{booking.totalPrice}</dd></div>
            <div><dt>Seats</dt><dd>{booking.seats.join(", ")}</dd></div>
            <div><dt>Tickets</dt><dd>{booking.seats.length}</dd></div>
            <div><dt>Booked on</dt><dd>{bookedOn(booking)}</dd></div>
          </dl>
        </div>
        <div className="ticket-hero-actions">
          {booking.state === "upcoming" && (
            <ConfirmButton onConfirm={cancel} confirmLabel="Yes, cancel">Cancel booking</ConfirmButton>
          )}
          <button className="row-btn" onClick={() => window.print()}><Icon name="printer" size={14} /> Print</button>
        </div>
      </section>

      <div className="detail-grid">
        <section className="detail-panel">
          <h2>Show</h2>
          {movie ? (
            <div className="linked-card" role="link" tabIndex={0}
              onClick={() => navigate(`${base}/movies/${movie._id}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`${base}/movies/${movie._id}`)}>
              <img src={imageFor(movie)} alt="" />
              <div>
                <strong>{bookingTitle(booking)}</strong>
                <small><Icon name="calendar" size={14} /> {showDate(booking)} · {showTime(booking)}</small>
                <small>
                  <Icon name="mapPin" size={14} />{" "}
                  {theatre
                    ? <Link to={`${base}/theatres/${theatre._id}`} className="cell-link" onClick={(e) => e.stopPropagation()}>{movie.theatreName}</Link>
                    : movie.theatreName || "No theatre"}
                </small>
              </div>
              <span className="linked-arrow" aria-hidden="true">→</span>
            </div>
          ) : (
            <p className="panel-empty">This movie has been removed.</p>
          )}

          <h2 className="panel-gap">Customer</h2>
          {booking.user ? (
            <div
              className={`linked-card person ${isAdmin ? "" : "static"}`}
              role={isAdmin ? "link" : undefined}
              tabIndex={isAdmin ? 0 : undefined}
              onClick={isAdmin ? () => navigate(`/admin/users/${booking.user._id}`) : undefined}
              onKeyDown={isAdmin ? (e) => e.key === "Enter" && navigate(`/admin/users/${booking.user._id}`) : undefined}
            >
              <span className="user-avatar large">{initialsOf(booking.user.name)}</span>
              <div>
                <strong>{booking.user.name}</strong>
                <small>{booking.user.email}</small>
                <small>{customerBookings} booking{customerBookings === 1 ? "" : "s"} in total</small>
              </div>
              {isAdmin && <span className="linked-arrow" aria-hidden="true">→</span>}
            </div>
          ) : (
            <p className="panel-empty">This customer's account was deleted.</p>
          )}
        </section>

        <section className="detail-panel">
          <h2>Seats in the hall</h2>
          <p className="panel-sub">This booking's seats are highlighted. Click another sold seat to open that booking.</p>
          <SeatGrid
            owners={owners}
            highlight={booking.seats}
            onSeatClick={(b) => b._id !== booking._id && navigate(`${base}/bookings/${b._id}`)}
          />
        </section>
      </div>
    </div>
  );
};

export default BookingInsight;
