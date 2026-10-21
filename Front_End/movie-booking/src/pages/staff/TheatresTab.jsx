import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmButton from "../../components/ConfirmButton";
import api from "../../utils/api";

export const TheatreForm = ({ initial, onCancel, onSaved, notify }) => {
  const [form, setForm] = useState({
    name: initial?.name || "",
    location: initial?.location || "",
    totalScreens: initial?.totalScreens || 1,
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, totalScreens: Number(form.totalScreens) };
      const { data: saved } = initial
        ? await api.put(`/theatres/${initial._id}`, payload)
        : await api.post("/theatres", payload);
      const renamed = initial && initial.name !== form.name;
      notify("success", renamed ? `Renamed to ${form.name}. Its movies were moved too.` : `${form.name} ${initial ? "updated" : "added"}.`);
      onSaved(saved.data.theatre._id);
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't save the theatre.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="staff-form" onSubmit={submit}>
      <div className="form-grid">
        <label><span>Name *</span><input value={form.name} onChange={set("name")} required /></label>
        <label className="span-2"><span>Location *</span><input value={form.location} onChange={set("location")} required /></label>
        <label><span>Screens *</span><input type="number" min="1" max="30" value={form.totalScreens} onChange={set("totalScreens")} required /></label>
      </div>
      <div className="staff-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span className="spinner" /> : initial ? "Save changes" : "Add theatre"}
        </button>
      </div>
    </form>
  );
};

const TheatresTab = ({ data, reload, notify, base }) => {
  const navigate = useNavigate();

  const scheduled = useMemo(() => {
    const counts = {};
    data.movies.forEach((m) => { counts[m.theatreName] = (counts[m.theatreName] || 0) + 1; });
    return counts;
  }, [data.movies]);

  const remove = async (theatre) => {
    try {
      await api.delete(`/theatres/${theatre._id}`);
      notify("success", `${theatre.name} deleted.`);
      await reload();
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't delete the theatre.");
    }
  };

  return (
    <>
      <div className="staff-toolbar">
        <p className="toolbar-note">Movies pick their theatre from this list.</p>
        <button className="btn btn-primary" onClick={() => navigate(`${base}/theatres/new`)}>+ Add theatre</button>
      </div>

      <div className="staff-table-wrap">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Theatre</th>
              <th>Location</th>
              <th>Screens</th>
              <th>Movies scheduled</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {data.theatres.map((t, i) => {
              const count = scheduled[t.name] || 0;
              return (
                <tr key={t._id} style={{ "--i": i }} className="clickable" onClick={() => navigate(`${base}/theatres/${t._id}`)}>
                  <td><strong>{t.name}</strong></td>
                  <td>{t.location || "—"}</td>
                  <td>{t.totalScreens}</td>
                  <td>{count}</td>
                  <td>
                    <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="row-btn" onClick={() => navigate(`${base}/theatres/${t._id}/edit`)}>Edit</button>
                      <ConfirmButton
                        onConfirm={() => remove(t)}
                        confirmLabel="Delete"
                        disabled={count > 0}
                        title={count > 0 ? "Move or delete its movies first" : undefined}
                      >
                        Delete
                      </ConfirmButton>
                    </div>
                  </td>
                </tr>
              );
            })}
            {data.theatres.length === 0 && (
              <tr className="empty-row"><td colSpan={5}>No theatres yet. Add one so movies can be scheduled.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TheatresTab;
