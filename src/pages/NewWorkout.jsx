import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createWorkout, postExercise, addWorkoutExercise } from "../api/client";
import ExerciseSearch from "../components/ExerciseSearch";

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
  const [selectedExternal, setSelectedExternal] = useState(null);

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
            const savedEx = await postExercise({
              name: ex.name,
              muscle_group: ex.meta?.muscle_group,
              equipment: ex.meta?.equipment,
              difficulty: ex.meta?.difficulty,
              instructions: ex.meta?.instructions,
            });
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
    <section className="glass-panel stack--lg">
      <div className="stack">
        <h1 className="page-heading">Create Workout</h1>
        <p className="page-subtitle">
          Name it, set the date, then stack your exercises.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="stack card">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="workout-title">Title</label>
            <input
              id="workout-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="workout-date">Date</label>
            <input
              id="workout-date"
              type="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
              required
            />
          </div>
        </div>
        {error && <div className="text-error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Save Workout"}
        </button>
      </form>

      <div className="card stack">
        <h3 className="section-heading">Add Exercise</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="exercise-name">Name</label>
            <input
              id="exercise-name"
              value={exName}
              onChange={(e) => {
                const value = e.target.value;
                setExName(value);
                if (selectedExternal && selectedExternal.name !== value) {
                  setSelectedExternal(null);
                }
              }}
              className="input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="exercise-sets">Sets</label>
            <input
              id="exercise-sets"
              type="number"
              value={exSets}
              onChange={(e) => setExSets(Number(e.target.value))}
              className="input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="exercise-reps">Reps</label>
            <input
              id="exercise-reps"
              type="number"
              value={exReps}
              onChange={(e) => setExReps(Number(e.target.value))}
              className="input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="exercise-weight">Weight</label>
            <input
              id="exercise-weight"
              value={exWeight}
              onChange={(e) => setExWeight(e.target.value)}
              className="input"
            />
          </div>
        </div>
        <div className="action-bar">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              if (!exName) return;
              setExercises((s) => [
                ...s,
                {
                  name: exName,
                  sets: exSets,
                  reps: exReps,
                  weight: exWeight,
                  meta:
                    selectedExternal && selectedExternal.name === exName
                      ? selectedExternal
                      : null,
                },
              ]);
              setExName("");
              setExSets(3);
              setExReps(8);
              setExWeight("");
              setSelectedExternal(null);
            }}
          >
            Add Exercise
          </button>
        </div>

        <ExerciseSearch
          title="Search exercises (API Ninjas)"
          helperText="Pick a result to autofill the name."
          onSelect={(meta) => {
            if (!meta) return;
            setExName(meta.name || "");
            setSelectedExternal(meta);
          }}
        />

        <div>
          <h4 className="section-heading">Exercises to add</h4>
          {exercises.length === 0 ? (
            <div className="text-muted">No exercises added yet.</div>
          ) : (
            <div className="stack stack--md">
              {exercises.map((ex, i) => (
                <article key={i} className="exercise-result">
                  <div>
                    <strong>
                      {ex.name} — {ex.sets}×{ex.reps}{" "}
                      {ex.weight ? `@ ${ex.weight}` : ""}
                    </strong>
                    {ex.meta?.muscle_group && (
                      <span className="text-muted">
                        {" "}
                        ({ex.meta.muscle_group})
                      </span>
                    )}
                  </div>
                  {ex.meta?.equipment && (
                    <div className="text-muted">
                      Equipment: {ex.meta.equipment}
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      setExercises((s) => s.filter((_, idx) => idx !== i))
                    }
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
