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
    <div>
      <h2>Workouts</h2>
      {loading ? (
        <div>Loading workouts...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : workouts.length === 0 ? (
        <div>No workouts yet. Create your first workout.</div>
      ) : (
        <ul>
          {workouts.map((w) => (
            <li key={w.id}>
              <Link to={`/workouts/${w.id}`}>
                {w.title}{" "}
                {w.workout_date
                  ? `— ${new Date(w.workout_date).toLocaleDateString()}`
                  : ""}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link to="/workouts/new">Create new workout</Link>
    </div>
  );
}
