import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../components/Icon";

const HALL = 50;

const TheatreBoard = ({ data, base }) => {
  const navigate = useNavigate();

  const cards = useMemo(() => {
    const now = new Date();
    return data.theatres.map((t) => {
      const shows = data.movies.filter((m) => m.theatreName === t.name);
      const ids = new Set(shows.map((m) => m._id));
      const active = data.bookings.filter((b) => b.status === "Booked" && b.movie && ids.has(b.movie._id));
      const sold = active.reduce((s, b) => s + b.seats.length, 0);
      return {
        theatre: t,
        shows: shows.length,
        upcoming: shows.filter((m) => new Date(m.showtime) >= now).length,
        sold,
        revenue: active.reduce((s, b) => s + (b.totalPrice || 0), 0),
        pct: shows.length ? Math.round((sold / (shows.length * HALL)) * 100) : 0,
      };
    });
  }, [data]);

  return (
    <div className="theatre-board">
      <div className="bo-toolbar">
        <p className="toolbar-note">Every show is scheduled at one of these theatres.</p>
        <button className="btn btn-ghost" onClick={() => navigate(`${base}/theatres/new`)}>+ Add theatre</button>
      </div>

      <div className="tb-grid">
        {cards.map((c, i) => {
          const open = () => navigate(`${base}/theatres/${c.theatre._id}`);
          return (
            <article key={c.theatre._id} className="theatre-card" style={{ "--i": i }} role="link" tabIndex={0}
              onClick={open} onKeyDown={(e) => e.key === "Enter" && open()}>
              <header>
                <h3>{c.theatre.name}</h3>
                <p><Icon name="mapPin" size={14} /> {c.theatre.location || "No location"} · {c.theatre.totalScreens} screens</p>
              </header>
              <div className="tc-numbers">
                <div><strong>{c.shows}</strong><small>shows</small></div>
                <div><strong>{c.upcoming}</strong><small>upcoming</small></div>
                <div><strong>{c.sold}</strong><small>tickets</small></div>
              </div>
              <div className="tc-occupancy">
                <span>Occupancy <strong>{c.pct}%</strong></span>
                <i><b style={{ width: `${c.pct}%` }} /></i>
              </div>
              <footer>
                <strong>₹{c.revenue.toLocaleString()}</strong>
                <button className="row-btn" onClick={(e) => { e.stopPropagation(); navigate(`${base}/theatres/${c.theatre._id}/edit`); }}>
                  Edit
                </button>
              </footer>
            </article>
          );
        })}
        {cards.length === 0 && <p className="panel-empty">No theatres yet. Add one to start scheduling shows.</p>}
      </div>
    </div>
  );
};

export default TheatreBoard;
