import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Icon from "../../../components/Icon";
import { bookingState } from "../../../utils/bookings";
import { getStoredUser, initialsOf } from "../../../utils/session";
import Notice from "../Notice";
import useStaffData from "../useStaffData";
import "../../../styles/Staff.css";
import "../../../styles/Admin.css";

const AdminLayout = () => {
  const staff = useStaffData(true);
  const me = getStoredUser();
  const { data } = staff;
  const upcoming = data.bookings.filter((b) => bookingState(b) === "upcoming").length;

  const nav = [
    { to: "/admin", label: "Overview", icon: "shield", end: true },
    { to: "/admin/users", label: "Users", icon: "user", count: data.users.length },
    { to: "/admin/movies", label: "Movies", icon: "film", count: data.movies.length },
    { to: "/admin/theatres", label: "Theatres", icon: "mapPin", count: data.theatres.length },
    { to: "/admin/bookings", label: "Bookings", icon: "ticket", count: upcoming, hint: "upcoming" },
  ];

  return (
    <div className="console">
      <aside className="console-side">
        <div className="console-brand">
          <span className="console-badge">Admin</span>
          <strong>Control Center</strong>
        </div>

        <nav className="console-nav" aria-label="Admin sections">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
              {item.count !== undefined && <em title={item.hint}>{item.count}</em>}
            </NavLink>
          ))}
        </nav>

        {me && (
          <div className="console-me">
            <span className="user-avatar">{initialsOf(me.name)}</span>
            <div>
              <strong>{me.name}</strong>
              <small>Administrator</small>
            </div>
          </div>
        )}
      </aside>

      <main className="console-main">
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
            <Outlet context={{ ...staff, me, isAdmin: true, base: "/admin" }} />
          </>
        )}
      </main>
    </div>
  );
};

export default AdminLayout;
