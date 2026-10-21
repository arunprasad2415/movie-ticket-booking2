import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BarChart from "../../../components/BarChart";
import { STATE_LABELS, bookedOn, bookingState, bookingTitle } from "../../../utils/bookings";
import { initialsOf } from "../../../utils/session";

const HALL = 50;
const rupees = (v) => `₹${v.toLocaleString()}`;

const AdminOverview = ({ data, me }) => {
  const navigate = useNavigate();

  const m = useMemo(() => {
    const bookings = data.bookings.map((b) => ({ ...b, state: bookingState(b) }));
    const active = bookings.filter((b) => b.status === "Booked");

    const byMovie = {};
    active.forEach((b) => {
      if (!b.movie) return;
      const row = byMovie[b.movie._id] || (byMovie[b.movie._id] = { movie: b.movie, revenue: 0, tickets: 0, count: 0 });
      row.revenue += b.totalPrice || 0;
      row.tickets += b.seats.length;
      row.count += 1;
    });

    const byTheatre = data.theatres.map((t) => {
      const showIds = new Set(data.movies.filter((mv) => mv.theatreName === t.name).map((mv) => mv._id));
      const sold = active.filter((b) => b.movie && showIds.has(b.movie._id)).reduce((s, b) => s + b.seats.length, 0);
      const capacity = showIds.size * HALL;
      return { theatre: t, sold, capacity, pct: capacity ? Math.round((sold / capacity) * 100) : 0 };
    });

    const spendByUser = {};
    active.forEach((b) => {
      if (!b.user) return;
      const row = spendByUser[b.user._id] || (spendByUser[b.user._id] = { user: b.user, spent: 0, count: 0 });
      row.spent += b.totalPrice || 0;
      row.count += 1;
    });

    return {
      bookings,
      revenue: active.reduce((s, b) => s + (b.totalPrice || 0), 0),
      tickets: active.reduce((s, b) => s + b.seats.length, 0),
      active: active.length,
      cancelRate: bookings.length ? Math.round(((bookings.length - active.length) / bookings.length) * 100) : 0,
      members: data.users.filter((u) => u.role === "User").length,
      upcomingShows: data.movies.filter((mv) => new Date(mv.showtime) >= new Date()).length,
      movieRows: Object.values(byMovie).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
      theatreRows: byTheatre.sort((a, b) => b.pct - a.pct),
      topCustomers: Object.values(spendByUser).sort((a, b) => b.spent - a.spent).slice(0, 5),
      newestUsers: [...data.users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    };
  }, [data]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="overview">
      <header className="section-head">
        <h1>Overview</h1>
        <p>{greeting}{me ? `, ${me.name.split(" ")[0]}` : ""}. Here's how CineBook is doing today, {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}.</p>
      </header>

      <div className="kpi-row">
        <div className="kpi kpi-hero">
          <small>Total revenue</small>
          <strong>{rupees(m.revenue)}</strong>
          <span>from {m.active} active booking{m.active === 1 ? "" : "s"}</span>
        </div>
        <div className="kpi"><small>Tickets sold</small><strong>{m.tickets}</strong></div>
        <div className="kpi"><small>Active bookings</small><strong>{m.active}</strong></div>
        <div className="kpi"><small>Cancellation rate</small><strong>{m.cancelRate}%</strong></div>
        <div className="kpi"><small>Members</small><strong>{m.members}</strong></div>
        <div className="kpi"><small>Upcoming shows</small><strong>{m.upcomingShows}</strong></div>
      </div>

      <div className="chart-row">
        <BarChart
          title="Revenue by movie"
          subtitle="Top 8, active bookings only"
          format={rupees}
          rows={m.movieRows.map((r) => ({
            label: r.movie.title,
            value: r.revenue,
            hint: `${r.tickets} ticket${r.tickets === 1 ? "" : "s"} · ${r.count} booking${r.count === 1 ? "" : "s"}`,
            onClick: () => navigate(`/admin/movies/${r.movie._id}`),
          }))}
          empty="No ticket sales yet."
        />
        <BarChart
          title="Occupancy by theatre"
          subtitle="Seats sold across every show, 50 seats per show"
          format={(v) => `${v}%`}
          rows={m.theatreRows.map((r) => ({
            label: r.theatre.name,
            value: r.pct,
            hint: `${r.sold} of ${r.capacity} seats`,
            onClick: () => navigate(`/admin/theatres/${r.theatre._id}`),
          }))}
          empty="No theatres yet."
        />
      </div>

      <div className="feed-row">
        <section className="feed">
          <header><h3>Recent bookings</h3><button className="row-btn" onClick={() => navigate("/admin/bookings")}>View all</button></header>
          {m.bookings.slice(0, 6).map((b) => (
            <div key={b._id} className="feed-item" role="link" tabIndex={0}
              onClick={() => navigate(`/admin/bookings/${b._id}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/admin/bookings/${b._id}`)}>
              <div className="cell-stack">
                <strong>{bookingTitle(b)}</strong>
                <small>{b.user?.name || "Deleted user"} · {b.seats.length} seat{b.seats.length === 1 ? "" : "s"} · {bookedOn(b)}</small>
              </div>
              <span className={`pill ${b.state}`}>{STATE_LABELS[b.state]}</span>
            </div>
          ))}
          {m.bookings.length === 0 && <p className="panel-empty">No bookings yet.</p>}
        </section>

        <section className="feed">
          <header><h3>Newest users</h3><button className="row-btn" onClick={() => navigate("/admin/users")}>View all</button></header>
          {m.newestUsers.map((u) => (
            <div key={u._id} className="feed-item" role="link" tabIndex={0}
              onClick={() => navigate(`/admin/users/${u._id}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/admin/users/${u._id}`)}>
              <span className="user-avatar">{initialsOf(u.name)}</span>
              <div className="cell-stack grow">
                <strong>{u.name}</strong>
                <small>{u.email}</small>
              </div>
              <span className="pill past">{u.role}</span>
            </div>
          ))}
        </section>

        <section className="feed">
          <header><h3>Top customers</h3></header>
          {m.topCustomers.map((c, i) => (
            <div key={c.user._id} className="feed-item" role="link" tabIndex={0}
              onClick={() => navigate(`/admin/users/${c.user._id}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/admin/users/${c.user._id}`)}>
              <span className="rank">{i + 1}</span>
              <div className="cell-stack grow">
                <strong>{c.user.name}</strong>
                <small>{c.count} booking{c.count === 1 ? "" : "s"}</small>
              </div>
              <strong>{rupees(c.spent)}</strong>
            </div>
          ))}
          {m.topCustomers.length === 0 && <p className="panel-empty">No customers yet.</p>}
        </section>
      </div>
    </div>
  );
};

export default AdminOverview;
