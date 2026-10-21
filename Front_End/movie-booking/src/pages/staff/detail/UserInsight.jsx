import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmButton from "../../../components/ConfirmButton";
import Icon from "../../../components/Icon";
import api from "../../../utils/api";
import { STATE_LABELS, bookedOn, bookingState, bookingTitle, showDate, showTime } from "../../../utils/bookings";
import { makeImageFor } from "../../../utils/movies";
import { initialsOf } from "../../../utils/session";
import { BackLink, Missing } from "../Section";

const ROLES = ["User", "Manager", "Admin"];

const mostCommon = (values) => {
  const counts = {};
  values.filter(Boolean).forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
};

const UserInsight = ({ data, reload, notify, me }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const imageFor = useMemo(() => makeImageFor(data.movies), [data.movies]);

  const user = data.users.find((u) => u._id === id);
  if (!user) return <Missing what="User" back="/admin/users" backLabel="All users" />;

  const isSelf = me && user._id === me.id;
  const bookings = data.bookings.filter((b) => b.user?._id === id).map((b) => ({ ...b, state: bookingState(b) }));
  const active = bookings.filter((b) => b.status === "Booked");
  const upcoming = bookings
    .filter((b) => b.state === "upcoming")
    .sort((a, b) => new Date(a.showtime) - new Date(b.showtime));
  const spent = active.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const tickets = active.reduce((sum, b) => sum + b.seats.length, 0);
  const favouriteGenre = mostCommon(active.map((b) => b.movie?.genre));
  const favouriteTheatre = mostCommon(active.map((b) => b.movie?.theatreName));
  const joined = new Date(user.createdAt);
  const openBooking = (b) => navigate(`/admin/bookings/${b._id}`);

  const changeRole = async (role) => {
    try {
      await api.put(`/admin/users/${user._id}`, { role });
      notify("success", `${user.name} is now ${role === "User" ? "a member" : `a ${role.toLowerCase()}`}.`);
      await reload();
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't change the role.");
    }
  };

  const remove = async () => {
    try {
      const { data: res } = await api.delete(`/admin/users/${user._id}`);
      notify("success", res.cancelledBookings
        ? `${res.message}. ${res.cancelledBookings} booking${res.cancelledBookings > 1 ? "s were" : " was"} cancelled and seats released.`
        : `${res.message}.`);
      navigate("/admin/users");
      await reload();
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't delete the user.");
    }
  };

  return (
    <div className="detail-page">
      <BackLink to="/admin/users">All users</BackLink>

      <section className="profile-hero">
        <span className="profile-avatar">{initialsOf(user.name)}</span>
        <div className="profile-main">
          <h1>{user.name} {isSelf && <span className="you-tag">You</span>}</h1>
          <p>{user.email}</p>
          <div className="profile-tags">
            <select
              className={`role-select ${user.role.toLowerCase()}`}
              value={user.role}
              onChange={(e) => changeRole(e.target.value)}
              disabled={isSelf}
              title={isSelf ? "You can't change your own role" : "Change role"}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {!isNaN(joined) && (
              <span className="tag-soft">Joined {joined.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</span>
            )}
            <span className="tag-soft mono">ID {user._id.slice(-8)}</span>
          </div>
        </div>
        <div className="detail-hero-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/admin/users/${user._id}/edit`)}>Edit user</button>
          <ConfirmButton
            onConfirm={remove}
            confirmLabel={active.length ? `Delete + cancel ${active.length}` : "Delete"}
            disabled={isSelf}
            title={isSelf ? "You can't delete your own account" : undefined}
          >
            Delete user
          </ConfirmButton>
        </div>
      </section>

      <div className="detail-stats">
        <div><small>Bookings</small><strong>{active.length}</strong></div>
        <div><small>Tickets</small><strong>{tickets}</strong></div>
        <div><small>Total spent</small><strong>₹{spent.toLocaleString()}</strong></div>
        <div><small>Upcoming</small><strong>{upcoming.length}</strong></div>
        <div><small>Cancelled</small><strong>{bookings.length - active.length}</strong></div>
      </div>

      <div className="insight-chips">
        <span><Icon name="film" size={15} /> Favourite genre: <strong>{favouriteGenre || "—"}</strong></span>
        <span><Icon name="mapPin" size={15} /> Favourite theatre: <strong>{favouriteTheatre || "—"}</strong></span>
        <span><Icon name="ticket" size={15} /> Last booking: <strong>{bookings[0] ? bookedOn(bookings[0]) : "—"}</strong></span>
      </div>

      <section className="detail-panel">
        <h2>Upcoming shows <span className="count">{upcoming.length}</span></h2>
        {upcoming.length === 0 ? (
          <p className="panel-empty">No upcoming shows booked.</p>
        ) : (
          <div className="show-tiles">
            {upcoming.map((b, i) => (
              <button key={b._id} className="show-tile" style={{ "--i": i }} onClick={() => openBooking(b)}>
                {b.movie && <img src={imageFor(b.movie)} alt="" loading="lazy" />}
                <span className="show-tile-body">
                  <strong>{bookingTitle(b)}</strong>
                  <small>{showDate(b)} · {showTime(b)}</small>
                  <small>Seats {b.seats.join(", ")} · ₹{b.totalPrice}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="detail-panel">
        <h2>Booking history <span className="count">{bookings.length}</span></h2>
        {bookings.length === 0 ? (
          <p className="panel-empty">{user.name} hasn't booked anything yet.</p>
        ) : (
          <div className="list-rows">
            {bookings.map((b) => (
              <div key={b._id} className={`list-row ${b.state}`} role="link" tabIndex={0}
                onClick={() => openBooking(b)} onKeyDown={(e) => e.key === "Enter" && openBooking(b)}>
                <div className="cell-stack">
                  <strong>{bookingTitle(b)}</strong>
                  <small><code>{b.ticketId}</code> · {showDate(b, { day: "numeric", month: "short" })} {showTime(b)} · Seats {b.seats.join(", ")}</small>
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

export default UserInsight;
