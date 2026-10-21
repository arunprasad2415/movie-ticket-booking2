import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Icon from "../../components/Icon";
import api from "../../utils/api";

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

const passwordScore = (pw) =>
  !pw ? 0 : Math.max(1, [pw.length >= 8, /\d/.test(pw), /[A-Z]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length);

const Security = () => {
  const { me } = useOutletContext();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const score = passwordScore(next);
  const mismatch = confirm.length > 0 && confirm !== next;
  const canSubmit = current && next.length >= 8 && confirm === next && !saving;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/auth/me/password", { currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      setMessage({ type: "success", text: "Password updated. Use your new password next time you log in." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Couldn't update your password." });
    } finally {
      setSaving(false);
    }
  };

  const type = show ? "text" : "password";

  return (
    <section className="account-panel">
      <div className="panel-head">
        <div>
          <h2>Password & Security</h2>
          <p>Signed in as <strong>{me.email}</strong></p>
        </div>
      </div>

      <form className="account-card account-form" onSubmit={submit}>
        <h3 className="card-title"><Icon name="lock" /> Change password</h3>

        {message && (
          <div className={`account-message ${message.type}`} key={message.text}>
            <Icon name={message.type === "success" ? "check" : "alert"} /> {message.text}
          </div>
        )}

        <label className="form-field">
          <span>Current password</span>
          <input type={type} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        </label>

        <label className="form-field">
          <span>New password</span>
          <input type={type} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={8} required />
          {next ? (
            <div className="strength" data-score={score}>
              <i /><i /><i /><i />
              <span>{STRENGTH_LABELS[score]}</span>
            </div>
          ) : (
            <small>Use 8 or more characters with a mix of letters, numbers and symbols.</small>
          )}
        </label>

        <label className="form-field">
          <span>Confirm new password</span>
          <input
            type={type}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            aria-invalid={mismatch || undefined}
            required
          />
          {mismatch && <small className="field-error">Passwords don't match.</small>}
        </label>

        <label className="show-toggle">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
          Show passwords
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {saving ? <span className="spinner" /> : "Update password"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Security;
