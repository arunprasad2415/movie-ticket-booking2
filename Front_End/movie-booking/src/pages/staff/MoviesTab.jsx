import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmButton from "../../components/ConfirmButton";
import Icon from "../../components/Icon";
import api from "../../utils/api";
import { formatRating, formatShowtime, makeImageFor } from "../../utils/movies";

const MAX_SEATS = 50;
const EMPTY_MOVIE = {
  title: "", theatreName: "", showtime: "", availableSeats: MAX_SEATS, genre: "", duration: "", rating: "",
  language: "English", certificate: "UA", releaseYear: "", director: "", cast: "", imageUrl: "", trailerUrl: "", description: "",
};
const GENRES = ["Action", "Adventure", "Animation", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi", "Thriller"];

const toForm = (movie) => ({
  ...EMPTY_MOVIE,
  ...Object.fromEntries(Object.entries(movie).filter(([, v]) => v !== null && v !== undefined)),
  cast: Array.isArray(movie.cast) ? movie.cast.join(", ") : movie.cast || "",
});

const toPayload = (form) => ({
  ...form,
  availableSeats: Number(form.availableSeats),
  rating: form.rating === "" ? undefined : Number(form.rating),
  releaseYear: form.releaseYear === "" ? undefined : Number(form.releaseYear),
});

export const MovieForm = ({ initial, theatres, onCancel, onSaved, notify }) => {
  const [form, setForm] = useState(initial ? toForm(initial) : { ...EMPTY_MOVIE, theatreName: theatres[0]?.name || "" });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const theatreNames = theatres.map((t) => t.name);
  if (form.theatreName && !theatreNames.includes(form.theatreName)) theatreNames.unshift(form.theatreName);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: saved } = initial
        ? await api.put(`/movies/${initial._id}`, toPayload(form))
        : await api.post("/movies", toPayload(form));
      notify("success", `${form.title} ${initial ? "updated" : "added"}.`);
      onSaved(saved._id);
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't save the movie.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="staff-form" onSubmit={submit}>
      <div className="form-grid">
        <label className="span-2"><span>Title *</span><input value={form.title} onChange={set("title")} required /></label>
        <label>
          <span>Theatre *</span>
          {theatreNames.length ? (
            <select value={form.theatreName} onChange={set("theatreName")} required>
              {theatreNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          ) : (
            <input value="Add a theatre first" disabled />
          )}
        </label>
        <label><span>Showtime *</span><input type="datetime-local" value={form.showtime} onChange={set("showtime")} required /></label>
        <label><span>Available seats (0–{MAX_SEATS})</span><input type="number" min="0" max={MAX_SEATS} value={form.availableSeats} onChange={set("availableSeats")} required /></label>
        <label>
          <span>Genre</span>
          <input list="genre-options" value={form.genre} onChange={set("genre")} />
          <datalist id="genre-options">{GENRES.map((g) => <option key={g} value={g} />)}</datalist>
        </label>
        <label><span>Duration</span><input placeholder="2h 15m" value={form.duration} onChange={set("duration")} /></label>
        <label><span>Rating (0–10)</span><input type="number" min="0" max="10" step="0.1" value={form.rating} onChange={set("rating")} /></label>
        <label><span>Language</span><input value={form.language} onChange={set("language")} /></label>
        <label>
          <span>Certificate</span>
          <select value={form.certificate} onChange={set("certificate")}>
            <option value="U">U</option>
            <option value="UA">UA</option>
            <option value="A">A</option>
          </select>
        </label>
        <label><span>Release year</span><input type="number" min="1900" max="2100" value={form.releaseYear} onChange={set("releaseYear")} /></label>
        <label><span>Director</span><input value={form.director} onChange={set("director")} /></label>
        <label className="span-2"><span>Cast (comma separated)</span><input value={form.cast} onChange={set("cast")} /></label>
        <label className="span-2"><span>Trailer URL (YouTube)</span><input type="url" value={form.trailerUrl} onChange={set("trailerUrl")} /></label>
        <label className="span-2 image-field">
          <span>Image URL</span>
          <input value={form.imageUrl} onChange={set("imageUrl")} placeholder="/images/backdrops/dune2.jpg or https://…" />
          {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="image-preview" />}
        </label>
        <label className="span-full"><span>Synopsis</span><textarea rows={3} value={form.description} onChange={set("description")} /></label>
      </div>

      <div className="staff-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving || !theatres.length}>
          {saving ? <span className="spinner" /> : initial ? "Save changes" : "Add movie"}
        </button>
      </div>
    </form>
  );
};

const MoviesTab = ({ data, reload, notify, base }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const imageFor = useMemo(() => makeImageFor(data.movies), [data.movies]);

  const activeBookings = useMemo(() => {
    const counts = {};
    data.bookings.forEach((b) => {
      if (b.status === "Booked" && b.movie) counts[b.movie._id] = (counts[b.movie._id] || 0) + 1;
    });
    return counts;
  }, [data.bookings]);

  const q = query.trim().toLowerCase();
  const movies = data.movies.filter((m) =>
    !q || [m.title, m.genre, m.theatreName].some((v) => v?.toLowerCase().includes(q))
  );

  const remove = async (movie) => {
    try {
      await api.delete(`/movies/${movie._id}`);
      notify("success", `${movie.title} deleted.`);
      await reload();
    } catch (err) {
      notify("error", err.response?.data?.message || "Couldn't delete the movie.");
    }
  };

  return (
    <>
      <div className="staff-toolbar">
        <div className="staff-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input type="search" placeholder="Search title, genre or theatre" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`${base}/movies/new`)}>+ Add movie</button>
      </div>

      <div className="staff-table-wrap">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Movie</th>
              <th>Theatre</th>
              <th>Showtime</th>
              <th>Seats left</th>
              <th>Rating</th>
              <th>Active bookings</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {movies.map((m, i) => {
              const seats = Number(m.availableSeats) || 0;
              const booked = activeBookings[m._id] || 0;
              return (
                <tr key={m._id} style={{ "--i": i }} className="clickable" onClick={() => navigate(`${base}/movies/${m._id}`)}>
                  <td>
                    <div className="cell-movie">
                      <img src={imageFor(m)} alt="" loading="lazy" />
                      <div>
                        <strong>{m.title}</strong>
                        <small>{[m.genre, m.duration, m.certificate].filter(Boolean).join(" · ")}</small>
                      </div>
                    </div>
                  </td>
                  <td>{m.theatreName || "—"}</td>
                  <td className="nowrap">{formatShowtime(m.showtime)}</td>
                  <td>
                    <div className="seat-meter-cell">
                      <span className={seats === 0 ? "sold" : seats <= 10 ? "low" : ""}>{seats}/{MAX_SEATS}</span>
                      <i><b style={{ width: `${(seats / MAX_SEATS) * 100}%` }} /></i>
                    </div>
                  </td>
                  <td>{m.rating ? `★ ${formatRating(m.rating)}` : "—"}</td>
                  <td>{booked}</td>
                  <td>
                    <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/movie/${m._id}`} className="row-btn" title="View public page"><Icon name="film" size={14} /></Link>
                      <button className="row-btn" onClick={() => navigate(`${base}/movies/${m._id}/edit`)}>Edit</button>
                      <ConfirmButton
                        onConfirm={() => remove(m)}
                        confirmLabel="Delete"
                        disabled={booked > 0}
                        title={booked > 0 ? "Cancel its active bookings first" : undefined}
                      >
                        Delete
                      </ConfirmButton>
                    </div>
                  </td>
                </tr>
              );
            })}
            {movies.length === 0 && (
              <tr className="empty-row"><td colSpan={7}>{q ? "No movies match your search." : "No movies yet. Add one to get started."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MoviesTab;
