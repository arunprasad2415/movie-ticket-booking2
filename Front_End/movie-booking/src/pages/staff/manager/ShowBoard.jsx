import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { makeImageFor } from "../../../utils/movies";

const HALL = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

const dayLabel = (date) => {
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === new Date(today.getTime() + DAY_MS).toDateString()) return "Tomorrow";
  return date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
};

const Ring = ({ pct }) => (
  <svg className="ring" viewBox="0 0 40 40" aria-label={`${pct}% sold`}>
    <circle className="ring-track" cx="20" cy="20" r="16" />
    <circle className="ring-fill" cx="20" cy="20" r="16" pathLength="100" strokeDasharray={`${pct} 100`} />
    <text x="20" y="24">{pct}%</text>
  </svg>
);

const ShowBoard = ({ data, base }) => {
  const navigate = useNavigate();
  const [theatre, setTheatre] = useState("All");
  const [query, setQuery] = useState("");
  const imageFor = useMemo(() => makeImageFor(data.movies), [data.movies]);

  const perShow = useMemo(() => {
    const stats = {};
    data.bookings.forEach((b) => {
      if (b.status !== "Booked" || !b.movie) return;
      const s = stats[b.movie._id] || (stats[b.movie._id] = { sold: 0, revenue: 0, bookings: 0 });
      s.sold += b.seats.length;
      s.revenue += b.totalPrice || 0;
      s.bookings += 1;
    });
    return stats;
  }, [data.bookings]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();
    const shows = data.movies
      .filter((m) => theatre === "All" || m.theatreName === theatre)
      .filter((m) => !q || m.title.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.showtime) - new Date(b.showtime));

    const upcoming = new Map();
    const earlier = [];
    shows.forEach((m) => {
      const d = new Date(m.showtime);
      if (isNaN(d) || d < now) return earlier.push(m);
      const key = d.toDateString();
      if (!upcoming.has(key)) upcoming.set(key, { label: dayLabel(d), shows: [] });
      upcoming.get(key).shows.push(m);
    });
    const list = [...upcoming.values()];
    if (earlier.length) list.push({ label: "Earlier shows", shows: earlier, past: true });
    return list;
  }, [data.movies, theatre, query]);

  return (
    <div className="show-board">
      <div className="bo-toolbar">
        <div className="bo-chips">
          {["All", ...data.theatres.map((t) => t.name)].map((name) => (
            <button key={name} className={theatre === name ? "active" : ""} onClick={() => setTheatre(name)}>{name}</button>
          ))}
        </div>
        <div className="staff-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input type="search" placeholder="Find a show" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {groups.length === 0 && <p className="panel-empty">No shows match. Try another theatre or search.</p>}

      {groups.map((group) => (
        <section key={group.label} className={`bo-day ${group.past ? "past" : ""}`}>
          <h2>{group.label} <span>{group.shows.length} show{group.shows.length === 1 ? "" : "s"}</span></h2>
          <div className="bo-grid">
            {group.shows.map((m, i) => {
              const s = perShow[m._id] || { sold: 0, revenue: 0, bookings: 0 };
              const pct = Math.round((s.sold / HALL) * 100);
              const open = () => navigate(`${base}/movies/${m._id}`);
              return (
                <article key={m._id} className="show-card" style={{ "--i": i }} role="link" tabIndex={0}
                  onClick={open} onKeyDown={(e) => e.key === "Enter" && open()}>
                  <div className="sc-media">
                    <img src={imageFor(m)} alt="" loading="lazy" />
                    <span className="sc-time">
                      {new Date(m.showtime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    </span>
                    {m.certificate && <span className="sc-cert">{m.certificate}</span>}
                  </div>
                  <div className="sc-body">
                    <h3>{m.title}</h3>
                    <p>{[m.theatreName, m.duration].filter(Boolean).join(" · ")}</p>
                    <div className="sc-stats">
                      <Ring pct={pct} />
                      <div><strong>{s.sold}/{HALL}</strong><small>seats sold</small></div>
                      <div><strong>₹{s.revenue.toLocaleString()}</strong><small>{s.bookings} booking{s.bookings === 1 ? "" : "s"}</small></div>
                    </div>
                  </div>
                  <button
                    className="sc-edit"
                    onClick={(e) => { e.stopPropagation(); navigate(`${base}/movies/${m._id}/edit`); }}
                  >
                    Edit
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ShowBoard;
