import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MovieForm } from "./MoviesTab";
import { TheatreForm } from "./TheatresTab";
import { UserForm } from "./UsersTab";
import { BackLink, Missing } from "./Section";

const EditorFrame = ({ back, backLabel, eyebrow, title, sub, children }) => {
  const navigate = useNavigate();
  return (
    <div className="editor-page">
      <BackLink to={back}>{backLabel}</BackLink>
      <header className="editor-head">
        <div>
          <span className="eyebrow-label">{eyebrow}</span>
          <h1>{title}</h1>
          {sub && <p>{sub}</p>}
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => navigate(back)}>Cancel</button>
      </header>
      {children}
    </div>
  );
};

export const MovieEditor = ({ data, reload, notify, base, isAdmin }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const movie = id ? data.movies.find((m) => m._id === id) : null;
  const listPath = isAdmin ? `${base}/movies` : base;

  if (id && !movie) return <Missing what="Movie" back={listPath} backLabel="Back" />;
  const back = movie ? `${base}/movies/${movie._id}` : listPath;

  return (
    <EditorFrame
      back={back}
      backLabel={movie ? movie.title : isAdmin ? "All movies" : "Show board"}
      eyebrow={movie ? "Edit show" : "New show"}
      title={movie ? movie.title : "Schedule a movie"}
      sub={movie ? "Changes go live on the public movie page as soon as you save." : "Pick a theatre and showtime. Tickets go on sale immediately."}
    >
      <MovieForm
        initial={movie}
        theatres={data.theatres}
        notify={notify}
        onCancel={() => navigate(back)}
        onSaved={async (savedId) => {
          await reload();
          navigate(`${base}/movies/${savedId}`);
        }}
      />
    </EditorFrame>
  );
};

export const TheatreEditor = ({ data, reload, notify, base }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theatre = id ? data.theatres.find((t) => t._id === id) : null;
  const listPath = `${base}/theatres`;

  if (id && !theatre) return <Missing what="Theatre" back={listPath} backLabel="All theatres" />;
  const back = theatre ? `${base}/theatres/${theatre._id}` : listPath;

  return (
    <EditorFrame
      back={back}
      backLabel={theatre ? theatre.name : "All theatres"}
      eyebrow={theatre ? "Edit theatre" : "New theatre"}
      title={theatre ? theatre.name : "Add a theatre"}
      sub={theatre ? "Renaming a theatre moves all of its shows to the new name." : "New theatres appear in the theatre picker when scheduling shows."}
    >
      <TheatreForm
        initial={theatre}
        notify={notify}
        onCancel={() => navigate(back)}
        onSaved={async (savedId) => {
          await reload();
          navigate(`${base}/theatres/${savedId}`);
        }}
      />
    </EditorFrame>
  );
};

export const UserEditor = ({ data, reload, notify, me }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = id ? data.users.find((u) => u._id === id) : null;

  if (id && !user) return <Missing what="User" back="/admin/users" backLabel="All users" />;
  const back = user ? `/admin/users/${user._id}` : "/admin/users";

  return (
    <EditorFrame
      back={back}
      backLabel={user ? user.name : "All users"}
      eyebrow={user ? "Edit user" : "New user"}
      title={user ? user.name : "Create a user"}
      sub={user ? "Update their details or change what they can access." : "They can log in straight away with the temporary password you set."}
    >
      <UserForm
        initial={user ? { ...user, isSelf: me && user._id === me.id } : null}
        notify={notify}
        onCancel={() => navigate(back)}
        onSaved={async (savedId) => {
          await reload();
          navigate(`/admin/users/${savedId}`);
        }}
      />
    </EditorFrame>
  );
};
