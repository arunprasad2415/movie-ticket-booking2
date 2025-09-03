import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/ManagerPanel.css';

const ManagerPanel = () => {
  const { token } = useAuth();
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [activeTab, setActiveTab] = useState('movies');
  const [viewType, setViewType] = useState('view'); // 'view' or 'add'
  const [formData, setFormData] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [moviesRes, theatresRes] = await Promise.all([
        fetch('http://localhost:5000/api/movies', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/theatres', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const moviesData = await moviesRes.json();
      const theatresData = await theatresRes.json();

      setMovies(Array.isArray(moviesData) ? moviesData : []);
      setTheatres(Array.isArray(theatresData) ? theatresData : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build payload properly
    let payload = {};
    if (activeTab === 'movies') {
      payload = {
        title: formData.title || '',
        genre: formData.genre || '',
        duration: formData.duration || '',
        theatreName: formData.theatreName || '',
        availableSeats: Number(formData.availableSeats) || 0,
        showtime: formData.showtime || '',
      };
    } else {
      payload = {
        name: formData.name || '',
        location: formData.location || '',
        totalScreens: Number(formData.totalScreens) || 0,
      };
    }

    const url = activeTab === 'movies' ? 'http://localhost:5000/api/movies' : 'http://localhost:5000/api/theatres';
    const method = editingItem ? 'PUT' : 'POST';
    const endpoint = editingItem ? `${url}/${editingItem._id}` : url;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      setFormData({});
      setEditingItem(null);
      setViewType('view');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to submit data');
    }
  };

  const handleDelete = async (id) => {
    const url = activeTab === 'movies' ? `http://localhost:5000/api/movies/${id}` : `http://localhost:5000/api/theatres/${id}`;
    try {
      const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete item');
    }
  };

  const handleUpdate = (item) => {
    setEditingItem(item);
    setFormData(item);
    setViewType('add');
  };

  return (
    <div className="manager-container">
      <h1>Manager Panel</h1>

      <nav className="manager-navbar">
        <button className={activeTab === 'movies' ? 'active' : ''} onClick={() => { setActiveTab('movies'); setViewType('view'); }}>Movies</button>
        <button className={activeTab === 'theatres' ? 'active' : ''} onClick={() => { setActiveTab('theatres'); setViewType('view'); }}>Theatres</button>
      </nav>

      {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
        <>
          <div className="manager-actions">
            <button className={viewType === 'add' ? 'action-btn active' : 'action-btn'} onClick={() => { setFormData({}); setEditingItem(null); setViewType('add'); }}>
              {editingItem ? 'Update' : 'Add'} {activeTab === 'movies' ? 'Movie' : 'Theatre'}
            </button>
            <button className={viewType === 'view' ? 'action-btn active' : 'action-btn'} onClick={() => setViewType('view')}>
              View {activeTab === 'movies' ? 'Movies' : 'Theatres'}
            </button>
          </div>

          {viewType === 'add' && (
            <div className="form-container">
              <h2>{editingItem ? 'Update' : 'Add'} {activeTab === 'movies' ? 'Movie' : 'Theatre'}</h2>
              <form onSubmit={handleSubmit}>
                {activeTab === 'movies' ? (
                  <>
                    <input type="text" placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    <input type="text" placeholder="Genre" value={formData.genre || ''} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} />
                    <input type="text" placeholder="Duration" value={formData.duration || ''} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                    <input type="text" placeholder="Theatre Name" value={formData.theatreName || ''} onChange={(e) => setFormData({ ...formData, theatreName: e.target.value })} />
                    <input type="number" placeholder="Available Seats" value={formData.availableSeats || ''} onChange={(e) => setFormData({ ...formData, availableSeats: parseInt(e.target.value) })} />
                    <input type="datetime-local" value={formData.showtime || ''} onChange={(e) => setFormData({ ...formData, showtime: e.target.value })} />
                  </>
                ) : (
                  <>
                    <input type="text" placeholder="Theatre Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <input type="text" placeholder="Location" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
                    <input type="number" placeholder="Total Screens" value={formData.totalScreens || ''} onChange={(e) => setFormData({ ...formData, totalScreens: parseInt(e.target.value) })} required />
                  </>
                )}
                <button type="submit">{editingItem ? 'Update' : 'Add'}</button>
              </form>
            </div>
          )}

          {viewType === 'view' && (
            <div className="list-container">
              <h2>{activeTab === 'movies' ? 'Movies' : 'Theatres'} List</h2>
              <table>
                <thead>
                  <tr>
                    {activeTab === 'movies' ? (
                      <>
                        <th>Title</th>
                        <th>Genre</th>
                        <th>Duration</th>
                        <th>Theatre</th>
                        <th>Seats</th>
                        <th>Actions</th>
                      </>
                    ) : (
                      <>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Total Screens</th>
                        <th>Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'movies' ? movies : theatres).map((item) => (
                    <tr key={item._id}>
                      {activeTab === 'movies' ? (
                        <>
                          <td>{item.title}</td>
                          <td>{item.genre}</td>
                          <td>{item.duration}</td>
                          <td>{item.theatreName}</td>
                          <td>{item.availableSeats}</td>
                        </>
                      ) : (
                        <>
                          <td>{item.name}</td>
                          <td>{item.location}</td>
                          <td>{item.totalScreens}</td>
                        </>
                      )}
                      <td>
                        <button className="update-btn" onClick={() => handleUpdate(item)}>Update</button>
                        <button className="delete-btn" onClick={() => handleDelete(item._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManagerPanel;
