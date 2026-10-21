import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmButton from "../../components/ConfirmButton";
import api from "../../utils/api";
import { STATE_LABELS, bookedOn, bookingState, bookingTitle, showDate, showTime } from "../../utils/bookings";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

const BookingsTab = ({ data, reload, notify, base, isAdmin }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("upcoming");
  const [query, setQuery] = useState("");

  const withState = useMemo(() => data.bookings.map((b) => ({ ...b, state: bookingState(b) })), [data.bookings]);

  const counts = useMemo(() => {
    const c = { all: withState.length, upcoming: 0, past: 0, cancelled: 0 };
    withState.forEach((b) => { c[b.state] += 1; });
    return c;
  }, [withState]);

  const q = query.trim().toLowerCase();
  const rows = withState.filter((b) =>
    (filter === "all" || b.state === filter) &&
    (!q || [b.ticketId, b.user?.name, b.user?.email, b.movie?.title].some((v) => v?.toLowerCase().includes(q)))
  );

  const revenue = rows.filter((b) => b.status !== "Cancelled").reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const tickets = rows.filter((b) => b.status !== "Cancelled").reduce((sum, b) => sum + b.seats.length, 0);

  const cancel = async (booking) => {
    try {
      await api.put(`/bookings/cancel/${booking._id}`);
      notify("success", `${booking.ticketId} cancelled. Seats ${booking.seats.join(", ")} are available again.`);
      await reload();
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't cancel the booking.");
    }
  };

  return (
    <>
      <div className="staff-toolbar">
        <div className="filter-chips">
          {FILTERS.map((f) => (
            <button key={f.key} className={filter === f.key ? "active" : ""} onClick={() => setFilter(f.key)}>
              {f.label} <span>{counts[f.key]}</span>
            </button>
          ))}
        </div>
        <div className="staff-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input type="search" placeholder="Customer, email, movie or ticket ID" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <p className="toolbar-summary">
        Showing {rows.length} booking{rows.length === 1 ? "" : "s"} · {tickets} ticket{tickets === 1 ? "" : "s"} · <strong>₹{revenue.toLocaleString()}</strong>
      </p>

      <div className="staff-table-wrap">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Customer</th>
              <th>Movie</th>
              <th>Show</th>
              <th>Seats</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Booked</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((b, i) => (
              <tr
                key={b._id}
                style={{ "--i": i }}
                className={`clickable ${b.state === "cancelled" ? "muted" : ""}`}
                onClick={() => navigate(`${base}/bookings/${b._id}`)}
              >
                <td><code>{b.ticketId}</code></td>
                <td>
                  {b.user ? (
                    <div className="cell-stack">
                      {isAdmin ? (
                        <Link to={`/admin/users/${b.user._id}`} className="cell-link" onClick={(e) => e.stopPropagation()}>{b.user.name}</Link>
                      ) : (
                        <strong>{b.user.name}</strong>
                      )}
                      <small>{b.user.email}</small>
                    </div>
                  ) : (
                    <span className="dim">Deleted user</span>
                  )}
                </td>
                <td>
                  <div className="cell-stack">
                    <strong>{bookingTitle(b)}</strong>
                    {b.movie?.theatreName && <small>{b.movie.theatreName}</small>}
                  </div>
                </td>
                <td className="nowrap">
                  <div className="cell-stack">
                    <strong>{showDate(b, { day: "numeric", month: "short" })}</strong>
                    <small>{showTime(b)}</small>
                  </div>
                </td>
                <td>{b.seats.join(", ")}</td>
                <td>₹{b.totalPrice}</td>
                <td><span className={`pill ${b.state}`}>{STATE_LABELS[b.state]}</span></td>
                <td className="nowrap dim">{bookedOn(b)}</td>
                <td>
                  {b.state === "upcoming" && (
                    <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <ConfirmButton onConfirm={() => cancel(b)} confirmLabel="Cancel it">Cancel</ConfirmButton>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr className="empty-row"><td colSpan={9}>{q ? "No bookings match your search." : "No bookings in this view."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default BookingsTab;
