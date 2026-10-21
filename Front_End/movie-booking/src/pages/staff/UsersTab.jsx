import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmButton from "../../components/ConfirmButton";
import api from "../../utils/api";
import { initialsOf } from "../../utils/session";

const ROLES = ["User", "Manager", "Admin"];

export const UserForm = ({ initial, onCancel, onSaved, notify }) => {
  const [form, setForm] = useState({
    name: initial?.name || "",
    email: initial?.email || "",
    password: "",
    role: initial?.role || "User",
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: saved } = initial
        ? await api.put(`/admin/users/${initial._id}`, { name: form.name, email: form.email, role: form.role })
        : await api.post("/admin/users", form);
      notify("success", `${form.name} ${initial ? "updated" : "created"}.`);
      onSaved(saved._id);
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't save the user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="staff-form" onSubmit={submit}>
      <div className="form-grid">
        <label><span>Full name *</span><input value={form.name} onChange={set("name")} required /></label>
        <label className="span-2"><span>Email *</span><input type="email" value={form.email} onChange={set("email")} required /></label>
        <label>
          <span>Role</span>
          <select value={form.role} onChange={set("role")} disabled={initial?.isSelf}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        {!initial && (
          <label className="span-2">
            <span>Temporary password * (8+ characters)</span>
            <input type="text" minLength={8} value={form.password} onChange={set("password")} required />
          </label>
        )}
      </div>
      <div className="staff-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span className="spinner" /> : initial ? "Save changes" : "Create user"}
        </button>
      </div>
    </form>
  );
};

const UsersTab = ({ data, reload, notify, me }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const activeBookings = useMemo(() => {
    const counts = {};
    data.bookings.forEach((b) => {
      if (b.status === "Booked" && b.user) counts[b.user._id] = (counts[b.user._id] || 0) + 1;
    });
    return counts;
  }, [data.bookings]);

  const q = query.trim().toLowerCase();
  const users = data.users.filter((u) => !q || [u.name, u.email, u.role].some((v) => v?.toLowerCase().includes(q)));

  const changeRole = async (user, role) => {
    try {
      await api.put(`/admin/users/${user._id}`, { role });
      notify("success", `${user.name} is now ${role === "User" ? "a member" : `a ${role.toLowerCase()}`}.`);
      await reload();
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't change the role.");
    }
  };

  const remove = async (user) => {
    try {
      const { data: res } = await api.delete(`/admin/users/${user._id}`);
      notify("success", res.cancelledBookings
        ? `${res.message}. ${res.cancelledBookings} booking${res.cancelledBookings > 1 ? "s were" : " was"} cancelled and seats released.`
        : `${res.message}.`);
      await reload();
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't delete the user.");
    }
  };

  return (
    <>
      <div className="staff-toolbar">
        <div className="staff-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input type="search" placeholder="Search name, email or role" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/admin/users/new")}>+ Create user</button>
      </div>

      <div className="staff-table-wrap">
        <table className="staff-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Active bookings</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const isSelf = me && u._id === me.id;
              const booked = activeBookings[u._id] || 0;
              return (
                <tr key={u._id} style={{ "--i": i }} className="clickable" onClick={() => navigate(`/admin/users/${u._id}`)}>
                  <td>
                    <div className="cell-user">
                      <span className="user-avatar">{initialsOf(u.name)}</span>
                      <div className="cell-stack">
                        <strong>{u.name} {isSelf && <span className="you-tag">You</span>}</strong>
                        <small>{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      className={`role-select ${u.role.toLowerCase()}`}
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={isSelf}
                      title={isSelf ? "You can't change your own role" : undefined}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="nowrap dim">
                    {isNaN(new Date(u.createdAt)) ? "—" : new Date(u.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>{booked}</td>
                  <td>
                    <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="row-btn" onClick={() => navigate(`/admin/users/${u._id}/edit`)}>Edit</button>
                      <ConfirmButton
                        onConfirm={() => remove(u)}
                        confirmLabel={booked ? `Delete + cancel ${booked}` : "Delete"}
                        disabled={isSelf}
                        title={isSelf ? "You can't delete your own account" : undefined}
                      >
                        Delete
                      </ConfirmButton>
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr className="empty-row"><td colSpan={5}>No users match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UsersTab;
