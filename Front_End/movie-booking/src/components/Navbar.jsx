import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import api from "../utils/api";
import { clearSession, getStoredUser, initialsOf, saveUser } from "../utils/session";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [, refresh] = useState(0);
  const accountRef = useRef(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user = getStoredUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    const onUserUpdated = () => refresh((n) => n + 1);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("user-updated", onUserUpdated);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("user-updated", onUserUpdated);
    };
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    api.get("/auth/me")
      .then(({ data }) => saveUser({ id: data.id, name: data.name, email: data.email, role: data.role }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e) => accountRef.current && !accountRef.current.contains(e.target) && setAccountOpen(false);
    const onKey = (e) => e.key === "Escape" && setAccountOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  if (location.pathname === "/login" || location.pathname === "/register") return null;

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <span className="logo-icon" aria-hidden="true">
          <span />
        </span>
        <span className="logo-text">
          Cine<span>Book</span>
        </span>
      </div>

      <button
        className={`menu-toggle ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" end className="nav-link">Home</NavLink>
        <NavLink to="/movies" className="nav-link">Movies</NavLink>
        {token && <NavLink to="/account/bookings" className="nav-link">My Bookings</NavLink>}
        {role === "Admin" && <NavLink to="/admin" className="nav-link">Admin</NavLink>}
        {role === "Manager" && <NavLink to="/manager" className="nav-link">Manager</NavLink>}

        <div className="navbar-buttons">
          {token ? (
            <div className="account-menu" ref={accountRef}>
              <button
                className={`account-trigger ${accountOpen ? "open" : ""}`}
                onClick={() => setAccountOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <span className="avatar">{initialsOf(user?.name)}</span>
                <span className="account-first">{user?.name?.split(" ")[0]}</span>
                <Icon name="chevronDown" size={16} />
              </button>

              {accountOpen && (
                <div className="account-dropdown" role="menu">
                  <div className="ad-head">
                    <span className="avatar large">{initialsOf(user?.name)}</span>
                    <div>
                      <strong>{user?.name}</strong>
                      <small>{user?.email}</small>
                    </div>
                  </div>
                  <Link to="/account/bookings" role="menuitem"><Icon name="ticket" size={17} /> My Bookings</Link>
                  <Link to="/account/profile" role="menuitem"><Icon name="user" size={17} /> Profile</Link>
                  <Link to="/account/security" role="menuitem"><Icon name="shield" size={17} /> Password & Security</Link>
                  <div className="ad-divider" />
                  <button onClick={logout} role="menuitem" className="ad-signout">
                    <Icon name="logOut" size={17} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="nav-btn" onClick={() => navigate("/login")}>Login</button>
              <button className="nav-btn nav-btn-solid" onClick={() => navigate("/register")}>
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
