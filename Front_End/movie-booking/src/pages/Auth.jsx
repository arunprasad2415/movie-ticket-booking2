import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Login from "./Login";
import Register from "./Register";

const Auth = () => {
  const mode = useLocation().pathname.startsWith("/register") ? "register" : "login";
  if (localStorage.getItem("token")) return <Navigate to="/movies" replace />;
  return <AuthShell>{mode === "login" ? <Login /> : <Register />}</AuthShell>;
};

export default Auth;
