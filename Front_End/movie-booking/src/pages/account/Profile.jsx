import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Icon from "../../components/Icon";
import api from "../../utils/api";
import { saveUser } from "../../utils/session";

const Profile = () => {
  const { me, setMe } = useOutletContext();
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const dirty = name.trim() !== me.name || email.trim().toLowerCase() !== me.email;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await api.put("/auth/me", { name, email });
      setMe(data);
      setName(data.name);
      setEmail(data.email);
      saveUser({ id: data.id, name: data.name, email: data.email, role: data.role });
      setMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Couldn't save your changes." });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setName(me.name);
    setEmail(me.email);
    setMessage(null);
  };

  return (
    <section className="account-panel">
      <div className="panel-head">
        <div>
          <h2>Profile</h2>
          <p>Your name and the email you use to sign in.</p>
        </div>
      </div>

      <form className="account-card account-form" onSubmit={save}>
        {message && (
          <div className={`account-message ${message.type}`} key={message.text}>
            <Icon name={message.type === "success" ? "check" : "alert"} /> {message.text}
          </div>
        )}

        <label className="form-field">
          <span>Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </label>

        <label className="form-field">
          <span>Email address</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <small>Changing this changes the email you log in with.</small>
        </label>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={reset} disabled={!dirty || saving}>
            Discard
          </button>
          <button type="submit" className="btn btn-primary" disabled={!dirty || saving}>
            {saving ? <span className="spinner" /> : "Save changes"}
          </button>
        </div>
      </form>

      <div className="account-card info-grid">
        <div>
          <span>Account type</span>
          <strong>{me.role === "User" ? "Member" : me.role}</strong>
        </div>
        <div>
          <span>Member since</span>
          <strong>
            {isNaN(new Date(me.createdAt))
              ? "—"
              : new Date(me.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
          </strong>
        </div>
      </div>
    </section>
  );
};

export default Profile;
