import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { getWorkoutsForUser } from "../api/client";

export default function Dashboard() {
  const { apiUser, logout } = useAuth();
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
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Dashboard</h2>
        <div>
          <Link to="/progress" style={{ marginRight: 12 }}>
            Progress
          </Link>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <section style={{ marginTop: 16 }}>
        <Link to="/workouts/new">
          <button style={{ padding: "8px 12px" }}>Add Workout</button>
        </Link>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Recent Workouts</h3>
        {loading ? (
          <div>Loading workouts...</div>
        ) : workouts.length === 0 ? (
          <div>No workouts yet. Start your first one.</div>
        ) : (
          <ul>
            {workouts.map((w) => (
              <li key={w.id}>
                {w.title} — {w.workout_date}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
