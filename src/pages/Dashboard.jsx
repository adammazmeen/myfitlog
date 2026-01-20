import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { getWorkoutsForUser } from "../api/client";

export default function Dashboard() {
  const { apiUser } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiUser?.id) return;
    setLoading(true);
    getWorkoutsForUser(apiUser.id)
      .then((data) => setWorkouts(data || []))
      .catch((err) => console.warn("fetch workouts failed", err))
      .finally(() => setLoading(false));
  }, [apiUser]);

  return (
    <section className="glass-panel stack--lg">
      <div className="stack">
        <div className="pill">Signed in as {apiUser?.email || ""}</div>
        <h1 className="page-heading">Dashboard</h1>
        <p className="page-subtitle">
          Quick snapshot of your workouts and progress photos.
        </p>
        <div className="action-bar">
          <Link to="/workouts/new" className="btn btn-primary">
            Add Workout
          </Link>
          <Link to="/progress" className="btn btn-ghost">
            View Progress Photos
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="section-heading">Recent Workouts</div>
        {loading ? (
          <div className="text-muted" style={{ marginTop: 12 }}>
            Loading workouts...
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-muted" style={{ marginTop: 12 }}>
            No workouts yet. Start your first one.
          </div>
        ) : (
          <ul className="data-list">
            {workouts.map((w) => (
              <li key={w.id} className="data-row">
                <span>{w.title}</span>
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
