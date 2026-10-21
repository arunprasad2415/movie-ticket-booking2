import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmButton from "../../../components/ConfirmButton";
import Icon from "../../../components/Icon";
import api from "../../../utils/api";
import { STATE_LABELS, bookingState, bookingTitle } from "../../../utils/bookings";
import { formatShowtime, makeImageFor } from "../../../utils/movies";
import { BackLink, Missing } from "../Section";

const HALL = 50;

const TheatreInsight = ({ data, reload, notify, base }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const imageFor = useMemo(() => makeImageFor(data.movies), [data.movies]);
  const listPath = `${base}/theatres`;

  const theatre = data.theatres.find((t) => t._id === id);
  if (!theatre) return <Missing what="Theatre" back={listPath} backLabel="All theatres" />;

  const shows = data.movies
    .filter((m) => m.theatreName === theatre.name)
    .sort((a, b) => new Date(a.showtime) - new Date(b.showtime));
  const showIds = new Set(shows.map((m) => m._id));
  const bookings = data.bookings.filter((b) => b.movie && showIds.has(b.movie._id)).map((b) => ({ ...b, state: bookingState(b) }));
  const active = bookings.filter((b) => b.status === "Booked");

  const soldFor = (movieId) => active.filter((b) => b.movie._id === movieId).reduce((sum, b) => sum + b.seats.length, 0);
  const revenueFor = (movieId) => active.filter((b) => b.movie._id === movieId).reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const tickets = active.reduce((sum, b) => sum + b.seats.length, 0);
  const revenue = active.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const upcoming = shows.filter((m) => new Date(m.showtime) >= new Date()).length;
  const occupancy = shows.length ? Math.round((tickets / (shows.length * HALL)) * 100) : 0;

  const remove = async () => {
    try {
      await api.delete(`/theatres/${theatre._id}`);
      notify("success", `${theatre.name} deleted.`);
      navigate(listPath);
      await reload();
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't delete the theatre.");
    }
  };

  return (
    <div className="detail-page">
      <BackLink to={listPath}>All theatres</BackLink>

      <section className="detail-hero plain">
        <div className="detail-hero-body">
          <span className="pill past">Theatre</span>
          <h1>{theatre.name}</h1>
          <p className="detail-when">
            <span><Icon name="mapPin" size={16} /> {theatre.location || "No location"}</span>
            <span><Icon name="film" size={16} /> {theatre.totalScreens} screen{theatre.totalScreens === 1 ? "" : "s"}</span>
          </p>
        </div>
        <div className="detail-hero-actions">
          <button className="btn btn-primary" onClick={() => navigate(`${base}/theatres/${theatre._id}/edit`)}>Edit theatre</button>
          <ConfirmButton
            onConfirm={remove}
            confirmLabel="Delete"
            disabled={shows.length > 0}
            title={shows.length > 0 ? "Move or delete its shows first" : undefined}
          >
            Delete
          </ConfirmButton>
        </div>
      </section>

      <div className="detail-stats">
        <div><small>Shows</small><strong>{shows.length}</strong></div>
        <div><small>Upcoming</small><strong>{upcoming}</strong></div>
        <div><small>Tickets sold</small><strong>{tickets}</strong></div>
        <div><small>Revenue</small><strong>₹{revenue.toLocaleString()}</strong></div>
        <div><small>Occupancy</small><strong>{occupancy}%</strong></div>
      </div>

      <section className="detail-panel">
        <h2>Shows at {theatre.name} <span className="count">{shows.length}</span></h2>
        {shows.length === 0 ? (
          <p className="panel-empty">No shows scheduled here yet.</p>
        ) : (
          <div className="show-tiles">
            {shows.map((m, i) => {
              const sold = soldFor(m._id);
              return (
                <button key={m._id} className="show-tile" style={{ "--i": i }} onClick={() => navigate(`${base}/movies/${m._id}`)}>
                  <img src={imageFor(m)} alt="" loading="lazy" />
                  <span className="show-tile-body">
                    <strong>{m.title}</strong>
                    <small>{formatShowtime(m.showtime)}</small>
                    <span className="fill-bar"><b style={{ width: `${(sold / HALL) * 100}%` }} /></span>
                    <small>{sold}/{HALL} sold · ₹{revenueFor(m._id).toLocaleString()}</small>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="detail-panel">
        <h2>Recent bookings <span className="count">{bookings.length}</span></h2>
        {bookings.length === 0 ? (
          <p className="panel-empty">No bookings at this theatre yet.</p>
        ) : (
          <div className="list-rows">
            {bookings.slice(0, 8).map((b) => (
              <div key={b._id} className={`list-row ${b.state}`} role="link" tabIndex={0}
                onClick={() => navigate(`${base}/bookings/${b._id}`)}
                onKeyDown={(e) => e.key === "Enter" && navigate(`${base}/bookings/${b._id}`)}>
                <div className="cell-stack">
                  <strong>{bookingTitle(b)}</strong>
                  <small>{b.user?.name || "Deleted user"} · <code>{b.ticketId}</code> · Seats {b.seats.join(", ")}</small>
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
  );
};

export default TheatreInsight;
