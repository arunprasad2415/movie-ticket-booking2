import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearSession } from "../utils/session";

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const toLogin = <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;

  if (!token) {
    return toLogin;
  }

  const decoded = parseJwt(token);

  if (!decoded || decoded.exp * 1000 < Date.now()) {
    clearSession();
    return toLogin;
  }

  const userRole = localStorage.getItem("role");
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
