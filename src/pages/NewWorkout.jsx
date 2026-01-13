import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createWorkout, postExercise, addWorkoutExercise } from "../api/client";

export default function NewWorkout() {
  const navigate = useNavigate();
  const { apiUser } = useAuth();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exName, setExName] = useState("");
  const [exSets, setExSets] = useState(3);
  const [exReps, setExReps] = useState(8);
  const [exWeight, setExWeight] = useState("");
  const [exercises, setExercises] = useState([]);

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
      // attach exercises after creating the workout
      if (created && created.id && exercises.length > 0) {
        const failed = [];
        for (const ex of exercises) {
          try {
            // ensure exercise exists in exercises table
            const savedEx = await postExercise({ name: ex.name });
            const exId = savedEx && savedEx.id ? savedEx.id : ex.id;
            if (!exId) {
              console.warn("postExercise returned no id", savedEx);
              failed.push({ name: ex.name, reason: "no exercise id" });
              continue;
            }

            // normalize numeric fields
            const sets = Number(ex.sets) || null;
            const reps = Number(ex.reps) || null;
            const weight =
              ex.weight === "" || ex.weight == null ? null : Number(ex.weight);

            await addWorkoutExercise({
              workout_id: created.id,
              exercise_id: exId,
              sets,
              reps,
              weight,
            });
          } catch (err) {
            console.error("addWorkoutExercise failed for", ex.name, err);
            failed.push({ name: ex.name, reason: err.message || String(err) });
            // continue with next exercise
          }
        }
        if (failed.length > 0) {
          setError(
            `Failed to attach ${failed.length} exercise(s): ${failed
              .map((f) => f.name)
              .join(", ")}`
          );
        }
      }
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

      <section style={{ marginTop: 16 }}>
        <h3>Add Exercise</h3>
        <label>
          Name:{" "}
          <input value={exName} onChange={(e) => setExName(e.target.value)} />
        </label>
        <label style={{ marginLeft: 8 }}>
          Sets:{" "}
          <input
            type="number"
            value={exSets}
            onChange={(e) => setExSets(Number(e.target.value))}
            style={{ width: 60 }}
          />
        </label>
        <label style={{ marginLeft: 8 }}>
          Reps:{" "}
          <input
            type="number"
            value={exReps}
            onChange={(e) => setExReps(Number(e.target.value))}
            style={{ width: 60 }}
          />
        </label>
        <label style={{ marginLeft: 8 }}>
          Weight:{" "}
          <input
            value={exWeight}
            onChange={(e) => setExWeight(e.target.value)}
            style={{ width: 80 }}
          />
        </label>
        <button
          onClick={() => {
            if (!exName) return;
            setExercises((s) => [
              ...s,
              { name: exName, sets: exSets, reps: exReps, weight: exWeight },
            ]);
            setExName("");
            setExSets(3);
            setExReps(8);
            setExWeight("");
          }}
          style={{ marginLeft: 8 }}
          type="button"
        >
          Add Exercise
        </button>

        <div style={{ marginTop: 12 }}>
          <h4>Exercises to add</h4>
          {exercises.length === 0 ? (
            <div>No exercises added yet.</div>
          ) : (
            <ul>
              {exercises.map((ex, i) => (
                <li key={i}>
                  {ex.name} — {ex.sets}×{ex.reps}{" "}
                  {ex.weight ? `@ ${ex.weight}` : ""}
                  <button
                    onClick={() =>
                      setExercises((s) => s.filter((_, idx) => idx !== i))
                    }
                    style={{ marginLeft: 8 }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
