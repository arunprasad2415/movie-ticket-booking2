import { useCallback, useEffect, useState } from "react";
import api from "../../utils/api";

const useStaffData = (isAdmin) => {
  const [data, setData] = useState({ movies: [], theatres: [], bookings: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(null);

  const reload = useCallback(async () => {
    try {
      const [movies, theatres, bookings, users] = await Promise.all([
        api.get("/movies"),
        api.get("/theatres"),
        api.get("/bookings"),
        isAdmin ? api.get("/admin/users") : Promise.resolve({ data: [] }),
      ]);
      setData({ movies: movies.data, theatres: theatres.data, bookings: bookings.data, users: users.data });
      setLoadError("");
    } catch (err) {
      setLoadError(err.response?.data?.message || "Couldn't load the dashboard. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const notify = useCallback((type, text) => setNotice({ type, text, at: Date.now() }), []);
  const retry = () => {
    setLoading(true);
    reload();
  };

  return { data, loading, loadError, reload, retry, notice, notify, dismiss: () => setNotice(null) };
};

export default useStaffData;
