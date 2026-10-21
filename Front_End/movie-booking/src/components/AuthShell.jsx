import React, { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { BACKDROPS, shuffle } from "../utils/stills";
import "../styles/Auth.css";

export const FloatField = ({ id, label, type = "text", invalid, children, ...rest }) => (
  <div className={`float-field ${invalid ? "invalid" : ""}`}>
    <input id={id} type={type} placeholder=" " aria-invalid={invalid || undefined} {...rest} />
    <label htmlFor={id}>{label}</label>
    {children}
  </div>
);

export const PasswordField = (props) => {
  const [visible, setVisible] = useState(false);
  return (
    <FloatField type={visible ? "text" : "password"} {...props}>
      <button
        type="button"
        className="field-action"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        <span className="icon-swap" key={visible}>
          <Icon name={visible ? "eyeOff" : "eye"} size={20} />
        </span>
      </button>
    </FloatField>
  );
};

export const Message = ({ type, children }) => (
  <div className={`auth-message ${type}`} role={type === "error" ? "alert" : "status"}>
    <Icon name={type === "error" ? "alert" : "check"} />
    <span>{children}</span>
  </div>
);

const COLUMNS = 6;
const PER_COLUMN = 8;
const STARS = 14;

const columnStills = (stills, c) => {
  const run = [...Array(PER_COLUMN)].map((_, k) => stills[(c * PER_COLUMN + k) % stills.length]);
  return [...run, ...run];
};

const AuthShell = ({ children }) => {
  const [stills] = useState(() => shuffle(BACKDROPS));

  return (
  <div className="auth-page">
    <Link to="/" className="auth-home" aria-label="Back to home">
      <Icon name="arrowLeft" size={18} /> Home
    </Link>
    <div className="poster-stage" aria-hidden="true">
      <div className="poster-columns">
        {[...Array(COLUMNS)].map((_, c) => (
          <div
            key={c}
            className={`poster-column ${c % 2 ? "down" : "up"}`}
            style={{ "--speed": `${48 + (c % 3) * 14}s` }}
          >
            {columnStills(stills, c).map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>
        ))}
      </div>
    </div>
    <div className="auth-vignette" aria-hidden="true" />

    <Link to="/" className="auth-brand" aria-label="CineBook home">
      <svg className="brand-arc" viewBox="0 0 300 70" aria-hidden="true">
        <defs>
          <linearGradient id="arcGold" x1="0" x2="1">
            <stop offset="0%" stopColor="#ffcf5a" stopOpacity="0" />
            <stop offset="35%" stopColor="#ffcf5a" />
            <stop offset="65%" stopColor="#fff3cf" />
            <stop offset="100%" stopColor="#ffcf5a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="arc-path" d="M10 66 Q150 -18 290 66" />
      </svg>
      <span className="arc-spark" aria-hidden="true" />
      {[...Array(STARS)].map((_, i) => (
        <i
          key={i}
          className="star"
          aria-hidden="true"
          style={{
            "--sx": `${(i * 53) % 100}%`,
            "--sy": `${(i * 37) % 100}%`,
            "--sd": `${1.6 + (i % 5) * 0.35}s`,
            "--sdelay": `${(i * 0.31) % 2.4}s`,
          }}
        />
      ))}
      <span className="auth-logo">
        Cine<span>Book</span>
      </span>
    </Link>

    <main className="auth-main">{children}</main>
    <footer className="auth-legal">© {new Date().getFullYear()} CineBook. All rights reserved.</footer>
  </div>
  );
};

export default AuthShell;
