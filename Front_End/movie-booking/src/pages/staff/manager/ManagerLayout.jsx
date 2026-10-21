import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Icon from "../../../components/Icon";
import { getStoredUser } from "../../../utils/session";
import Notice from "../Notice";
import useStaffData from "../useStaffData";
import "../../../styles/Staff.css";
import "../../../styles/Manager.css";

const sameDay = (a, b) => a.toDateString() === b.toDateString();

const ManagerLayout = () => {
  const staff = useStaffData(false);
  const me = getStoredUser();
  const navigate = useNavigate();
  const { data } = staff;
  const now = new Date();

  const active = data.bookings.filter((b) => b.status === "Booked");
  const strip = [
    { label: "Shows today", value: data.movies.filter((m) => sameDay(new Date(m.showtime), now)).length },
    { label: "Upcoming shows", value: data.movies.filter((m) => new Date(m.showtime) >= now).length },
    { label: "Tickets sold", value: active.reduce((s, b) => s + b.seats.length, 0) },
    { label: "Box office", value: `₹${active.reduce((s, b) => s + (b.totalPrice || 0), 0).toLocaleString()}` },
  ];

  return (
    <div className="boxoffice">
      <header className="bo-header">
        <div className="bo-title">
          <span className="bo-eyebrow">Manager{me ? ` · ${me.name}` : ""}</span>
          <h1>Box <span>Office</span></h1>
          <p>{now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        <div className="bo-strip">
          {strip.map((s, i) => (
            <div key={s.label} style={{ "--i": i }}>
              <strong>{staff.loading ? "–" : s.value}</strong>
              <small>{s.label}</small>
            </div>
          ))}
        </div>
      </header>

      <div className="bo-navbar">
        <nav className="bo-nav" aria-label="Box office sections">
          <NavLink to="/manager" end><Icon name="film" size={16} /> Show board</NavLink>
          <NavLink to="/manager/theatres"><Icon name="mapPin" size={16} /> Theatres</NavLink>
          <NavLink to="/manager/bookings"><Icon name="ticket" size={16} /> Bookings</NavLink>
        </nav>
        <button className="btn btn-primary bo-cta" onClick={() => navigate("/manager/movies/new")}>+ Schedule show</button>
      </div>

      <main className="bo-main">
        {staff.loading ? (
          <div className="staff-loading"><span className="spinner" /></div>
        ) : staff.loadError ? (
          <div className="staff-loading">
            <p>{staff.loadError}</p>
            <button className="btn btn-primary" onClick={staff.retry}>Try again</button>
          </div>
        ) : (
          <>
            <Notice notice={staff.notice} onDismiss={staff.dismiss} />
            <Outlet context={{ ...staff, me, isAdmin: false, base: "/manager" }} />
          </>
        )}
      </main>
    </div>
  );
};

export default ManagerLayout;
