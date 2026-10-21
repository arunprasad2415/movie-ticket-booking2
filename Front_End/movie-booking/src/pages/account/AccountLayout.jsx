import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import api from "../../utils/api";
import { bookingImage, bookingState } from "../../utils/bookings";
import { clearSession, initialsOf } from "../../utils/session";
import "../../styles/Account.css";

const AccountLayout = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [meRes, bookingsRes] = await Promise.all([api.get("/auth/me"), api.get("/bookings/my")]);
      setMe(meRes.data);
      setBookings(bookingsRes.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        clearSession();
        navigate("/login");
        return;
      }
      setError("We couldn't load your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const active = bookings.filter((b) => b.status !== "Cancelled");
    return {
      upcoming: bookings.filter((b) => bookingState(b) === "upcoming").length,
      tickets: active.reduce((sum, b) => sum + b.seats.length, 0),
      spent: active.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    };
  }, [bookings]);

  const heroImage = useMemo(() => {
    const next = bookings
      .filter((b) => bookingState(b) === "upcoming")
      .sort((a, b) => new Date(a.showtime) - new Date(b.showtime))[0];
    const pick = next || bookings[0];
    return pick ? bookingImage(pick) : "/images/backdrops/inception.jpg";
  }, [bookings]);

  const signOut = () => {
    clearSession();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="account-loading">
        <span className="spinner" />
      </div>
    );
  }

  if (error || !me) {
    return (
      <div className="account-loading">
        <p>{error || "Something went wrong."}</p>
        <button className="btn btn-primary" onClick={() => { setLoading(true); load(); }}>Try again</button>
      </div>
    );
  }

  const memberSince = new Date(me.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="account">
      <header className="account-hero">
        <img className="account-hero-bg" src={heroImage} alt="" />
        <div className="account-hero-inner">
          <div className="account-id">
            <span className="account-avatar">{initialsOf(me.name)}</span>
            <div>
              <h1>{me.name}</h1>
              <p className="account-email">{me.email}</p>
              <div className="account-tags">
                <span className="tag">{me.role === "User" ? "Member" : me.role}</span>
                {!isNaN(new Date(me.createdAt)) && <span className="tag subtle">Since {memberSince}</span>}
              </div>
            </div>
          </div>

          <dl className="account-stats">
            <div style={{ "--i": 0 }}>
              <dt>Upcoming</dt>
              <dd>{stats.upcoming}</dd>
            </div>
            <div style={{ "--i": 1 }}>
              <dt>Tickets</dt>
              <dd>{stats.tickets}</dd>
            </div>
            <div style={{ "--i": 2 }}>
              <dt>Spent</dt>
              <dd>₹{stats.spent.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="account-body">
        <nav className="account-nav" aria-label="Account">
          <NavLink to="/account/bookings">
            <Icon name="ticket" /> My Bookings
            {bookings.length > 0 && <span className="count">{bookings.length}</span>}
          </NavLink>
          <NavLink to="/account/profile">
            <Icon name="user" /> Profile
          </NavLink>
          <NavLink to="/account/security">
            <Icon name="shield" /> Password & Security
          </NavLink>
          <button className="account-signout" onClick={signOut}>
            <Icon name="logOut" /> Sign out
          </button>
        </nav>

        <main className="account-main">
          <Outlet context={{ me, setMe, bookings, reload: load }} />
        </main>
      </div>
    </div>
  );
};

export default AccountLayout;
