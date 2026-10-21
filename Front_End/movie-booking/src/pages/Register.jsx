import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FloatField, Message, PasswordField } from '../components/AuthShell';

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

const passwordScore = (pw) =>
  !pw ? 0 : Math.max(1, [pw.length >= 8, /\d/.test(pw), /[A-Z]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length);

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('details');
  const [back, setBack] = useState(false);
  const [moved, setMoved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const score = passwordScore(password);

  const goToPassword = (e) => {
    e.preventDefault();
    setBack(false);
    setMoved(true);
    setStep('password');
  };

  const editDetails = () => {
    setError('');
    setBack(true);
    setMoved(true);
    setStep('details');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post("/api/auth/register", { name, email, password });
      navigate('/login', { state: { registered: true, email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'details') {
    return (
      <form className={`auth-step ${back ? 'back' : ''} ${moved ? 'ready' : ''}`} key="details" onSubmit={goToPassword}>
        <h1>Create your account</h1>
        <p className="lede">Book tickets in seconds and keep all your bookings in one place.</p>

        <FloatField
          id="reg-name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          autoFocus
          required
        />
        <FloatField
          id="reg-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <button type="submit" className="auth-button">Continue</button>

        <p className="auth-alt">
          Already have an account?<Link to="/login">Log in</Link>
        </p>
      </form>
    );
  }

  return (
    <form className={`auth-step ${moved ? "ready" : ""}`} key="password" onSubmit={handleRegister}>
      <h1>Create a password</h1>
      <p className="lede">
        Signing up as <strong>{email}</strong>
        <button type="button" className="text-button" onClick={editDetails}>Edit</button>
      </p>

      {error && <Message type="error" key={error}>{error}</Message>}

      <PasswordField
        id="reg-password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        minLength={8}
        aria-describedby="reg-password-hint"
        invalid={!!error}
        autoFocus
        required
      />

      {password ? (
        <div className="strength" data-score={score} id="reg-password-hint" aria-live="polite">
          <i /><i /><i /><i />
          <span>{STRENGTH_LABELS[score]}</span>
        </div>
      ) : (
        <p className="field-hint" id="reg-password-hint">Use 8 or more characters.</p>
      )}

      <button type="submit" className="auth-button" disabled={loading}>
        {loading ? <span className="spinner" /> : 'Create Account'}
      </button>
    </form>
  );
};

export default Register;
