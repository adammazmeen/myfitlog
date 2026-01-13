import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createWorkout } from "../api/client";

export default function NewWorkout() {
  const navigate = useNavigate();
  const { apiUser } = useAuth();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!apiUser?.id) {
      setError("User not available");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const created = await createWorkout({
        user_id: apiUser.id,
        title: title || "Workout",
        workout_date: date,
      });
      if (created && created.id) {
        navigate(`/workouts/${created.id}`);
      } else {
        navigate("/workouts");
      }
    } catch (err) {
      console.error("create workout failed", err);
      setError("Failed to create workout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Create Workout</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title:{" "}
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <br />
        <label>
          Date:{" "}
          <input
            type="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </form>
    </div>
  );
}
