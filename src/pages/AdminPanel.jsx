import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminPanel.css";

const API_BASE = "https://backend2-3-hmvz.onrender.com/api";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("movies");
  const [viewType, setViewType] = useState("view");
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingItem, setEditingItem] = useState(null);

  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  useEffect(() => {
    fetchMovies();
    fetchTheatres();
    fetchUsers();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await axiosInstance.get("/movies");
      setMovies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setMovies([]);
    }
  };

  const fetchTheatres = async () => {
    try {
      const res = await axiosInstance.get("/theatres");
      setTheatres(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching theatres:", err);
      setTheatres([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let url = "";
    if (activeTab === "movies") url = "/movies";
    if (activeTab === "theatres") url = "/theatres";
    if (activeTab === "users") url = "/admin/users";

    const method = editingItem ? "put" : "post";
    const endpoint = editingItem ? `${url}/${editingItem._id}` : url;

    try {
      await axiosInstance[method](endpoint, formData);
      setFormData({});
      setEditingItem(null);
      setViewType("view");
      fetchMovies();
      fetchTheatres();
      fetchUsers();
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to save data.");
    }
  };

  const handleDelete = async (id, type) => {
    try {
      let url = `/${type}/${id}`;
      if (type === "users") url = `/admin/users/${id}`;
      await axiosInstance.delete(url);

      if (type === "movies") fetchMovies();
      if (type === "theatres") fetchTheatres();
      if (type === "users") fetchUsers();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleUpdate = (item, type) => {
    setEditingItem(item);
    setFormData(item);
    setViewType("add");
    setActiveTab(type);
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await axiosInstance.put(`/admin/users/${id}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  return (
    <div className="admin-container">
      <nav className="admin-navbar">
        <button
          className={activeTab === "movies" ? "active" : ""}
          onClick={() => {
            setActiveTab("movies");
            setViewType("view");
          }}
        >
          Movies
        </button>
        <button
          className={activeTab === "theatres" ? "active" : ""}
          onClick={() => {
            setActiveTab("theatres");
            setViewType("view");
          }}
        >
          Theatres
        </button>
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => {
            setActiveTab("users");
            setViewType("view");
          }}
        >
          Users
        </button>
      </nav>

      <div className="admin-actions">
        <button
          className={viewType === "add" ? "action-btn active" : "action-btn"}
          onClick={() => {
            setFormData({});
            setEditingItem(null);
            setViewType("add");
          }}
        >
          {editingItem ? "Update" : "Add"}{" "}
          {activeTab === "movies"
            ? "Movie"
            : activeTab === "theatres"
            ? "Theatre"
            : "User"}
        </button>
        <button
          className={viewType === "view" ? "action-btn active" : "action-btn"}
          onClick={() => setViewType("view")}
        >
          View{" "}
          {activeTab === "movies"
            ? "Movies"
            : activeTab === "theatres"
            ? "Theatres"
            : "Users"}
        </button>
      </div>

      {viewType === "add" && (
        <div className="form-container">
          <h2>
            {editingItem ? "Update" : "Add"}{" "}
            {activeTab === "movies"
              ? "Movie"
              : activeTab === "theatres"
              ? "Theatre"
              : "User"}
          </h2>
          <form onSubmit={handleSubmit}>
            {activeTab === "movies" ? (
              <>
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Rating"
                  value={formData.rating || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={formData.imageUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Theatre Name"
                  value={formData.theatreName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, theatreName: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Available Seats"
                  value={formData.availableSeats || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availableSeats: e.target.value,
                    })
                  }
                />
                <input
                  type="datetime-local"
                  value={formData.showtime || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, showtime: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Genre"
                  value={formData.genre || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, genre: e.target.value })
                  }
                />
              </>
            ) : activeTab === "theatres" ? (
              <>
                <input
                  type="text"
                  placeholder="Theatre Name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Total Screens"
                  value={formData.totalScreens || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, totalScreens: e.target.value })
                  }
                  required
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                {!editingItem && (
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                )}
                <select
                  value={formData.role || "User"}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </>
            )}
            <button type="submit">{editingItem ? "Update" : "Add"}</button>
          </form>
        </div>
      )}

      {viewType === "view" && (
        <div className="list-container">
          <h2>
            {activeTab === "movies"
              ? "Movies"
              : activeTab === "theatres"
              ? "Theatres"
              : "Users"}{" "}
            List
          </h2>
          <table>
            <thead>
              <tr>
                {activeTab === "movies" ? (
                  <>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Duration</th>
                    <th>Seats</th>
                    <th>Actions</th>
                  </>
                ) : activeTab === "theatres" ? (
                  <>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Total Screens</th>
                    <th>Actions</th>
                  </>
                ) : (
                  <>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {(activeTab === "movies"
                ? movies
                : activeTab === "theatres"
                ? theatres
                : users
              ).map((item) => (
                <tr key={item._id}>
                  {activeTab === "movies" ? (
                    <>
                      <td>{item.title}</td>
                      <td>{item.genre}</td>
                      <td>{item.duration}</td>
                      <td>{item.availableSeats}</td>
                    </>
                  ) : activeTab === "theatres" ? (
                    <>
                      <td>{item.name}</td>
                      <td>{item.location}</td>
                      <td>{item.totalScreens}</td>
                    </>
                  ) : (
                    <>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>
                        <select
                          value={item.role}
                          onChange={(e) =>
                            handleRoleChange(item._id, e.target.value)
                          }
                        >
                          <option value="User">User</option>
                          <option value="Manager">Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                    </>
                  )}
                  <td>
                    <button
                      className="update-btn"
                      onClick={() =>
                        handleUpdate(
                          item,
                          activeTab === "movies"
                            ? "movies"
                            : activeTab === "theatres"
                            ? "theatres"
                            : "users"
                        )
                      }
                    >
                      Update
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(
                          item._id,
                          activeTab === "movies"
                            ? "movies"
                            : activeTab === "theatres"
                            ? "theatres"
                            : "users"
                        )
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
