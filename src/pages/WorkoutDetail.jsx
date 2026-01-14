import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getWorkout,
  getWorkoutExercises,
  updateWorkout,
  updateWorkoutExercise,
  postExercise,
  addWorkoutExercise,
} from "../api/client";

export default function WorkoutDetail() {
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const [workoutForm, setWorkoutForm] = useState({
    title: "",
    workout_date: "",
  });
  const [exerciseEdits, setExerciseEdits] = useState([]);
  const [newExercise, setNewExercise] = useState({
    name: "",
    sets: 3,
    reps: 8,
    weight: "",
  });
  const [addingEx, setAddingEx] = useState(false);
  const [addExError, setAddExError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const w = await getWorkout(id);
        const ex = await getWorkoutExercises(id);
        if (!mounted) return;
        setWorkout(w || null);
        setExercises(ex || []);
      } catch (err) {
        console.error("Failed to load workout detail", err);
        if (!mounted) return;
        setError("Failed to load workout");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // sync inputs when workout/exercises load (but don't overwrite while editing)
  useEffect(() => {
    if (!editing && workout) {
      setWorkoutForm({
        title: workout.title || "",
        workout_date: workout.workout_date || "",
      });
      setExerciseEdits(
        exercises.map((ex) => ({
          id: ex.id,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        }))
      );
    }
  }, [workout, exercises, editing]);

  if (loading) return <div>Loading workout...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!workout) return <div>Workout not found.</div>;

  function startEdit() {
    setWorkoutForm({
      title: workout.title || "",
      workout_date: workout.workout_date || "",
    });
    setExerciseEdits(
      exercises.map((ex) => ({
        id: ex.id,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
      }))
    );
    setEditing(true);
  }

  async function saveAll() {
    setLoading(true);
    setError(null);
    try {
      await updateWorkout(workout.id, {
        title: workoutForm.title,
        workout_date: workoutForm.workout_date,
      });
      // update each exercise row
      for (const e of exerciseEdits) {
        await updateWorkoutExercise(e.id, {
          sets: Number(e.sets) || null,
          reps: Number(e.reps) || null,
          weight: e.weight === "" ? null : Number(e.weight),
        });
      }
      // refresh
      const w = await getWorkout(workout.id);
      const ex = await getWorkoutExercises(workout.id);
      setWorkout(w);
      setExercises(ex);
      setEditing(false);
    } catch (err) {
      console.error("Failed saving edits", err);
      setError("Failed saving edits");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddExercise() {
    if (!newExercise.name) return setAddExError("Name required");
    setAddingEx(true);
    setAddExError(null);
    try {
      const savedEx = await postExercise({ name: newExercise.name });
      const exId = savedEx && savedEx.id ? savedEx.id : null;
      if (!exId) throw new Error("No exercise id returned");
      await addWorkoutExercise({
        workout_id: workout.id,
        exercise_id: exId,
        sets: Number(newExercise.sets) || null,
        reps: Number(newExercise.reps) || null,
        weight: newExercise.weight === "" ? null : Number(newExercise.weight),
      });
      const ex = await getWorkoutExercises(workout.id);
      setExercises(ex);
      setExerciseEdits(
        ex.map((ex) => ({
          id: ex.id,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        }))
      );
      setNewExercise({ name: "", sets: 3, reps: 8, weight: "" });
    } catch (err) {
      console.error("Add exercise failed", err);
      setAddExError(err.message || "Failed to add exercise");
    } finally {
      setAddingEx(false);
    }
  }

  return (
    <div>
      {!editing ? (
        <>
          <h2>{workout.title}</h2>
          <div>
            Date:{" "}
            {workout.workout_date
              ? new Date(workout.workout_date).toLocaleDateString()
              : ""}
          </div>
          <button onClick={startEdit} style={{ marginTop: 8 }}>
            Edit
          </button>
        </>
      ) : (
        <div>
          <label>
            Title:{" "}
            <input
              value={workoutForm.title}
              onChange={(e) =>
                setWorkoutForm((p) => ({ ...p, title: e.target.value }))
              }
            />
          </label>
          <br />
          <label>
            Date:{" "}
            <input
              type="date"
              value={workoutForm.workout_date}
              onChange={(e) =>
                setWorkoutForm((p) => ({ ...p, workout_date: e.target.value }))
              }
            />
          </label>

          <h4 style={{ marginTop: 12 }}>Exercises</h4>
          {exerciseEdits.map((ee, idx) => (
            <div key={ee.id} style={{ marginBottom: 8 }}>
              <strong>
                {exercises.find((x) => x.id === ee.id)?.name || "Exercise"}
              </strong>
              <label style={{ marginLeft: 8 }}>
                Sets:{" "}
                <input
                  type="number"
                  value={ee.sets}
                  onChange={(e) => {
                    const v = e.target.value;
                    setExerciseEdits((s) =>
                      s.map((s2, i) => (i === idx ? { ...s2, sets: v } : s2))
                    );
                  }}
                  style={{ width: 60 }}
                />
              </label>
              <label style={{ marginLeft: 8 }}>
                Reps:{" "}
                <input
                  type="number"
                  value={ee.reps}
                  onChange={(e) => {
                    const v = e.target.value;
                    setExerciseEdits((s) =>
                      s.map((s2, i) => (i === idx ? { ...s2, reps: v } : s2))
                    );
                  }}
                  style={{ width: 60 }}
                />
              </label>
              <label style={{ marginLeft: 8 }}>
                Weight:{" "}
                <input
                  value={ee.weight ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setExerciseEdits((s) =>
                      s.map((s2, i) => (i === idx ? { ...s2, weight: v } : s2))
                    );
                  }}
                  style={{ width: 80 }}
                />
              </label>
            </div>
          ))}

          <div
            style={{
              marginTop: 12,
              borderTop: "1px solid #eee",
              paddingTop: 12,
            }}
          >
            <h5>Add Exercise</h5>
            <label>
              Name:{" "}
              <input
                value={newExercise.name}
                onChange={(e) =>
                  setNewExercise((p) => ({ ...p, name: e.target.value }))
                }
              />
            </label>
            <label style={{ marginLeft: 8 }}>
              Sets:{" "}
              <input
                type="number"
                value={newExercise.sets}
                onChange={(e) =>
                  setNewExercise((p) => ({
                    ...p,
                    sets: Number(e.target.value),
                  }))
                }
                style={{ width: 60 }}
              />
            </label>
            <label style={{ marginLeft: 8 }}>
              Reps:{" "}
              <input
                type="number"
                value={newExercise.reps}
                onChange={(e) =>
                  setNewExercise((p) => ({
                    ...p,
                    reps: Number(e.target.value),
                  }))
                }
                style={{ width: 60 }}
              />
            </label>
            <label style={{ marginLeft: 8 }}>
              Weight:{" "}
              <input
                value={newExercise.weight}
                onChange={(e) =>
                  setNewExercise((p) => ({ ...p, weight: e.target.value }))
                }
                style={{ width: 80 }}
              />
            </label>
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={handleAddExercise}
                disabled={addingEx}
              >
                {addingEx ? "Adding..." : "Add Exercise"}
              </button>
              {addExError && (
                <div style={{ color: "red", marginTop: 6 }}>{addExError}</div>
              )}
            </div>
          </div>

          <div>
            <button onClick={saveAll} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(false)} style={{ marginLeft: 8 }}>
              Cancel
            </button>
            {error && <div style={{ color: "red" }}>{error}</div>}
          </div>
        </div>
      )}

      <h3 style={{ marginTop: 16 }}>Exercises</h3>
      {exercises.length === 0 ? (
        <div>No exercises added to this workout.</div>
      ) : (
        <ul>
          {exercises.map((ex) => (
            <li key={ex.id}>
              {ex.name} — {ex.sets} × {ex.reps}{" "}
              {ex.weight ? `@ ${ex.weight}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
