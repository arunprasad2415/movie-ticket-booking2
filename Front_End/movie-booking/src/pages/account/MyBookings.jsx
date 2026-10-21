import React, { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Icon from "../../components/Icon";
import { STATE_LABELS, bookingImage, bookingState, bookingTitle, showDate, showTime } from "../../utils/bookings";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

const EMPTY = {
  upcoming: { title: "No upcoming shows", text: "Your next movie night is one click away." },
  past: { title: "No past bookings yet", text: "Shows you've watched will appear here." },
  cancelled: { title: "No cancelled bookings", text: "Nice, every plan went ahead." },
};

const MyBookings = () => {
  const { bookings } = useOutletContext();
  const [tab, setTab] = useState("upcoming");

  const groups = useMemo(() => {
    const byShow = (a, b) => new Date(a.showtime) - new Date(b.showtime);
    const g = { upcoming: [], past: [], cancelled: [] };
    bookings.forEach((b) => g[bookingState(b)].push(b));
    g.upcoming.sort(byShow);
    g.past.sort((a, b) => byShow(b, a));
    return g;
  }, [bookings]);

  const list = groups[tab];
  const tabIndex = TABS.findIndex((t) => t.key === tab);

  return (
    <section className="account-panel">
      <div className="panel-head">
        <div>
          <h2>My Bookings</h2>
          <p>Every ticket you've booked, in one place.</p>
        </div>
        <Link to="/movies" className="btn btn-primary">Book a show</Link>
      </div>

      <div className="booking-tabs" role="tablist" style={{ "--tab": tabIndex }}>
        <span className="tab-indicator" aria-hidden="true" />
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? "active" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className="tab-count">{groups[t.key].length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="account-empty" key={tab}>
          <span className="empty-icon"><Icon name="ticket" size={28} /></span>
          <h3>{EMPTY[tab].title}</h3>
          <p>{EMPTY[tab].text}</p>
          {tab === "upcoming" && <Link to="/movies" className="btn btn-primary">Browse movies</Link>}
        </div>
      ) : (
        <div className="booking-list" key={tab}>
          {list.map((b, i) => {
            const state = bookingState(b);
            return (
              <Link to={`/account/bookings/${b._id}`} className={`booking-card ${state}`} key={b._id} style={{ "--i": i }}>
                <div className="bc-media">
                  <img src={bookingImage(b)} alt="" loading="lazy" />
                  <span className={`status-badge ${state}`}>{STATE_LABELS[state]}</span>
                </div>

                <div className="bc-body">
                  <h3>{bookingTitle(b)}</h3>
                  <p className="bc-line"><Icon name="calendar" size={15} /> {showDate(b)} · {showTime(b)}</p>
                  {b.movie?.theatreName && <p className="bc-line"><Icon name="mapPin" size={15} /> {b.movie.theatreName}</p>}
                  <div className="seat-chips">
                    {b.seats.map((s) => <span key={s}>{s}</span>)}
                  </div>
                </div>

                <div className="bc-side">
                  <span className="bc-label">Total</span>
                  <strong>₹{b.totalPrice}</strong>
                  <code>{b.ticketId}</code>
                  <span className="bc-arrow" aria-hidden="true">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MyBookings;
