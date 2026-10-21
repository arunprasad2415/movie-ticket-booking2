import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import Icon from "../../components/Icon";

export const Section = ({ title, sub, component }) => {
  const ctx = useOutletContext();
  const Component = component;
  return (
    <div className="section-page">
      {title && (
        <header className="section-head">
          <h1>{title}</h1>
          {sub && <p>{sub}</p>}
        </header>
      )}
      <Component {...ctx} />
    </div>
  );
};

export const BackLink = ({ to, children }) => (
  <Link to={to} className="detail-back">
    <Icon name="arrowLeft" size={16} /> {children}
  </Link>
);

export const Missing = ({ what, back, backLabel }) => (
  <div className="detail-missing">
    <h2>{what} not found</h2>
    <p>It may have been deleted.</p>
    <Link to={back} className="btn btn-primary">{backLabel}</Link>
  </div>
);
