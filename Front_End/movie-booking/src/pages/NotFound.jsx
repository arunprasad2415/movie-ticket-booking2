import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="not-found">
    <div>
      <h1>404</h1>
      <span className="eyebrow-label">Scene missing</span>
      <p>This reel seems to have been lost in the projection room.</p>
      <Link to="/" className="btn btn-primary">Back to the lobby</Link>
    </div>
  </div>
);

export default NotFound;
