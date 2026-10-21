import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConfirmButton from "../../../components/ConfirmButton";
import Icon from "../../../components/Icon";
import api from "../../../utils/api";
import { STATE_LABELS, bookingState } from "../../../utils/bookings";
import { formatRating, formatShowtime, makeImageFor } from "../../../utils/movies";
import SeatGrid from "../SeatGrid";
import { BackLink, Missing } from "../Section";

const HALL = 50;

const MovieInsight = ({ data, reload, notify, base, isAdmin }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const imageFor = useMemo(() => makeImageFor(data.movies), [data.movies]);
  const listPath = isAdmin ? `${base}/movies` : base;
  const listLabel = isAdmin ? "All movies" : "Show board";

  const movie = data.movies.find((m) => m._id === id);
  if (!movie) return <Missing what="Movie" back={listPath} backLabel={listLabel} />;

  const bookings = data.bookings.filter((b) => b.movie?._id === id).map((b) => ({ ...b, state: bookingState(b) }));
  const active = bookings.filter((b) => b.status === "Booked");
  const owners = {};
  active.forEach((b) => b.seats.forEach((s) => { owners[s] = b; }));
  const sold = Object.keys(owners).length;
  const revenue = active.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const theatre = data.theatres.find((t) => t.name === movie.theatreName);
  const ended = new Date(movie.showtime) < new Date();
  const openBooking = (b) => navigate(`${base}/bookings/${b._id}`);

  const remove = async () => {
    try {
      await api.delete(`/movies/${movie._id}`);
      notify("success", `${movie.title} deleted.`);
      navigate(listPath);
      await reload();
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't delete the movie.");
    }
  };

  return (
    <div className="detail-page">
      <BackLink to={listPath}>{listLabel}</BackLink>

      <section className="detail-hero">
        <img src={imageFor(movie)} alt="" />
        <div className="detail-hero-body">
          <span className={`pill ${ended ? "past" : "upcoming"}`}>{ended ? "Show ended" : "Upcoming show"}</span>
          <h1>{movie.title}</h1>
          <p className="detail-meta">
            {[movie.genre, movie.duration, movie.certificate, movie.language, movie.rating && `★ ${formatRating(movie.rating)}`]
              .filter(Boolean).join(" · ")}
          </p>
          <p className="detail-when">
            <span><Icon name="calendar" size={16} /> {formatShowtime(movie.showtime)}</span>
            <span>
              <Icon name="mapPin" size={16} />{" "}
              {theatre ? <Link to={`${base}/theatres/${theatre._id}`}>{movie.theatreName}</Link> : movie.theatreName || "No theatre"}
            </span>
          </p>
        </div>
        <div className="detail-hero-actions">
          <button className="btn btn-primary" onClick={() => navigate(`${base}/movies/${movie._id}/edit`)}>Edit show</button>
          <Link className="btn btn-ghost" to={`/movie/${movie._id}`}>Public page</Link>
          <ConfirmButton
            onConfirm={remove}
            confirmLabel="Delete"
            disabled={active.length > 0}
            title={active.length > 0 ? "Cancel its active bookings first" : undefined}
          >
            Delete
          </ConfirmButton>
        </div>
      </section>

      <div className="detail-stats">
        <div><small>Seats sold</small><strong>{sold}<em>/{HALL}</em></strong></div>
        <div><small>Occupancy</small><strong>{Math.round((sold / HALL) * 100)}%</strong></div>
        <div><small>Revenue</small><strong>₹{revenue.toLocaleString()}</strong></div>
        <div><small>Active bookings</small><strong>{active.length}</strong></div>
        <div><small>Cancelled</small><strong>{bookings.length - active.length}</strong></div>
      </div>

      <div className="detail-grid">
        <section className="detail-panel">
          <h2>Seat map</h2>
          <p className="panel-sub">Hover a sold seat to see who holds it. Click it to open the booking.</p>
          <SeatGrid owners={owners} onSeatClick={openBooking} />
        </section>

        <section className="detail-panel">
          <h2>Bookings <span className="count">{bookings.length}</span></h2>
          {bookings.length === 0 ? (
            <p className="panel-empty">No bookings for this show yet.</p>
          ) : (
            <div className="list-rows">
              {bookings.map((b) => (
                <div key={b._id} className={`list-row ${b.state}`} role="link" tabIndex={0}
                  onClick={() => openBooking(b)} onKeyDown={(e) => e.key === "Enter" && openBooking(b)}>
                  <div className="cell-stack">
                    <strong>
                      {isAdmin && b.user
                        ? <Link to={`/admin/users/${b.user._id}`} className="cell-link" onClick={(e) => e.stopPropagation()}>{b.user.name}</Link>
                        : b.user?.name || "Deleted user"}
                    </strong>
                    <small><code>{b.ticketId}</code> · Seats {b.seats.join(", ")}</small>
                  </div>
                  <div className="list-row-end">
                    <span className={`pill ${b.state}`}>{STATE_LABELS[b.state]}</span>
                    <strong>₹{b.totalPrice}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {(movie.description || movie.director || movie.cast?.length > 0) && (
        <section className="detail-panel">
          <h2>About</h2>
          {movie.description && <p className="detail-synopsis">{movie.description}</p>}
          <dl className="detail-facts">
            {movie.director && <div><dt>Director</dt><dd>{movie.director}</dd></div>}
            {movie.releaseYear && <div><dt>Released</dt><dd>{movie.releaseYear}</dd></div>}
            {movie.cast?.length > 0 && <div className="wide"><dt>Cast</dt><dd>{movie.cast.join(", ")}</dd></div>}
          </dl>
        </section>
      )}
    </div>
  );
};

export default MovieInsight;
