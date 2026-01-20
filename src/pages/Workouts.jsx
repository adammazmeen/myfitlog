import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getWorkoutsForUser } from "../api/client";

export default function Workouts() {
  const { apiUser } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiUser?.id) return;
    setLoading(true);
    setError(null);
    getWorkoutsForUser(apiUser.id)
      .then((data) => setWorkouts(data || []))
      .catch((err) => {
        console.warn("fetch workouts failed", err);
        setError("Failed to load workouts");
      })
      .finally(() => setLoading(false));
  }, [apiUser]);

  return (
    <section className="glass-panel stack">
      <div className="stack">
        <h1 className="page-heading">Workouts</h1>
        <p className="page-subtitle">
          Browse every session you have logged so far.
        </p>
        <div className="action-bar">
          <Link to="/workouts/new" className="btn btn-primary">
            Create Workout
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="section-heading">All Workouts</div>
        {loading ? (
          <div className="text-muted">Loading workouts...</div>
        ) : error ? (
          <div className="text-error">{error}</div>
        ) : workouts.length === 0 ? (
          <div className="text-muted">
            No workouts yet. Create your first one.
          </div>
        ) : (
          <ul className="data-list">
            {workouts.map((w) => (
              <li key={w.id} className="data-row">
                <Link to={`/workouts/${w.id}`}>{w.title}</Link>
                <span className="text-muted">
                  {w.workout_date
                    ? new Date(w.workout_date).toLocaleDateString()
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
