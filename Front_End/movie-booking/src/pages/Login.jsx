import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FloatField, Message, PasswordField } from "../components/AuthShell";

const Login = () => {
  const registered = useLocation().state;
  const [email, setEmail] = useState(registered?.email || "");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(registered?.email ? "password" : "email");
  const [back, setBack] = useState(false);
  const [moved, setMoved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const goToPassword = (e) => {
    e.preventDefault();
    setBack(false);
    setMoved(true);
    setStep("password");
  };

  const editEmail = () => {
    setError("");
    setPassword("");
    setBack(true);
    setMoved(true);
    setStep("email");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });

      if (!res.data || !res.data.token || !res.data.user) {
        throw new Error("Invalid response format from server");
      }

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      const role = (user.role || "").toLowerCase();
      if (registered?.from) {
        navigate(registered.from, { replace: true });
      } else if (role === "admin") {
        navigate("/admin");
      } else if (role === "manager") {
        navigate("/manager");
      } else {
        navigate("/movies");
      }
    } catch (err) {
      console.error("Login error:", err);
      let message = "Login failed. Please try again.";
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message?.includes("Network")) {
        message = "Cannot connect to server. Please check if backend is running.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "email") {
    return (
      <form className={`auth-step ${back ? "back" : ""} ${moved ? "ready" : ""}`} key="email" onSubmit={goToPassword}>
        <h1>Log in with your email</h1>
        <p className="lede">Use the email address you signed up with to access your tickets and bookings.</p>

        <FloatField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          required
        />

        <button type="submit" className="auth-button">Continue</button>

        <p className="auth-alt">
          New to CineBook?<Link to="/register">Sign up</Link>
        </p>
      </form>
    );
  }

  return (
    <form className={`auth-step ${moved ? "ready" : ""}`} key="password" onSubmit={handleLogin}>
      <h1>Enter your password</h1>
      <p className="lede">
        Logging in as <strong>{email}</strong>
        <button type="button" className="text-button" onClick={editEmail}>Edit</button>
      </p>

      {registered?.email && !error && (
        <Message type="success">Your account is ready. Enter your password to log in.</Message>
      )}
      {error && <Message type="error" key={error}>{error}</Message>}

      <PasswordField
        id="login-password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        invalid={!!error}
        autoFocus
        required
      />

      <button type="submit" className="auth-button" disabled={loading}>
        {loading ? <span className="spinner" /> : "Log In"}
      </button>
    </form>
  );
};

export default Login;
