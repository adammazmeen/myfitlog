import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getWorkout,
  getWorkoutExercises,
  updateWorkout,
  updateWorkoutExercise,
  postExercise,
  addWorkoutExercise,
  deleteWorkout,
  deleteWorkoutExercise,
} from "../api/client";
import ExerciseSearch from "../components/ExerciseSearch";

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [removingIds, setRemovingIds] = useState({});
  const [removeError, setRemoveError] = useState(null);

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
    meta: null,
  });
  const [addingEx, setAddingEx] = useState(false);
  const [addExError, setAddExError] = useState(null);

  const initialLoad = loading && !workout;
  const saving = loading && !!workout;

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
        })),
      );
    }
  }, [workout, exercises, editing]);

  function startEdit() {
    if (!workout) return;
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
      })),
    );
    setEditing(true);
  }

  async function saveAll() {
    if (!workout) return;
    setLoading(true);
    setError(null);
    try {
      await updateWorkout(workout.id, {
        title: workoutForm.title,
        workout_date: workoutForm.workout_date,
      });
      for (const e of exerciseEdits) {
        await updateWorkoutExercise(e.id, {
          sets: Number(e.sets) || null,
          reps: Number(e.reps) || null,
          weight: e.weight === "" ? null : Number(e.weight),
        });
      }
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

  async function handleDeleteWorkout() {
    if (!workout?.id) return;
    const confirmed = window.confirm(
      "Delete this workout? This cannot be undone.",
    );
    if (!confirmed) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteWorkout(workout.id);
      navigate("/workouts");
    } catch (err) {
      console.error("Failed to delete workout", err);
      setDeleteError("Failed to delete workout");
    } finally {
      setDeleting(false);
    }
  }

  async function handleAddExercise() {
    if (!newExercise.name) return setAddExError("Name required");
    if (!workout) return;
    setAddingEx(true);
    setAddExError(null);
    try {
      const savedEx = await postExercise({
        name: newExercise.name,
        muscle_group: newExercise.meta?.muscle_group,
        equipment: newExercise.meta?.equipment,
        difficulty: newExercise.meta?.difficulty,
        instructions: newExercise.meta?.instructions,
      });
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
        })),
      );
      setNewExercise({ name: "", sets: 3, reps: 8, weight: "", meta: null });
    } catch (err) {
      console.error("Add exercise failed", err);
      setAddExError(err.message || "Failed to add exercise");
    } finally {
      setAddingEx(false);
    }
  }

  async function handleRemoveExercise(workoutExerciseId) {
    if (!workoutExerciseId) return;
    const confirmed = window.confirm("Remove this exercise from the workout?");
    if (!confirmed) return;
    setRemovingIds((prev) => ({ ...prev, [workoutExerciseId]: true }));
    setRemoveError(null);
    try {
      await deleteWorkoutExercise(workoutExerciseId);
      setExercises((prev) => prev.filter((ex) => ex.id !== workoutExerciseId));
      setExerciseEdits((prev) =>
        prev.filter((ex) => ex.id !== workoutExerciseId),
      );
    } catch (err) {
      console.error("Failed to remove workout exercise", err);
      setRemoveError("Failed to remove exercise");
    } finally {
      setRemovingIds((prev) => {
        const next = { ...prev };
        delete next[workoutExerciseId];
        return next;
      });
    }
  }

  if (initialLoad) return <div className="text-muted">Loading workout...</div>;
  if (!workout && error) return <div className="text-error">{error}</div>;
  if (!workout) return <div className="text-error">Workout not found.</div>;

  const formattedDate = formatDate(workout.workout_date);

  return (
    <section className="glass-panel stack--lg">
      <div className="card stack">
        <span className="pill">Workout detail</span>
        {editing ? (
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="detail-title">Title</label>
              <input
                id="detail-title"
                className="input"
                value={workoutForm.title}
                onChange={(e) =>
                  setWorkoutForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="detail-date">Date</label>
              <input
                id="detail-date"
                type="date"
                className="input"
                value={workoutForm.workout_date}
                onChange={(e) =>
                  setWorkoutForm((p) => ({
                    ...p,
                    workout_date: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        ) : (
          <div>
            <h1 className="page-heading">{workout.title}</h1>
            <p className="text-muted">
              {formattedDate ? `Scheduled for ${formattedDate}` : "No date set"}
            </p>
          </div>
        )}
        <div className="action-bar">
          {editing ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveAll}
                disabled={saving}
              >
                {saving ? "Saving changes..." : "Save changes"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={startEdit}
              >
                Edit workout
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteWorkout}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete workout"}
              </button>
            </>
          )}
        </div>
        {saving && (
          <div className="status-line text-muted">Saving changes...</div>
        )}
        {error && workout && <div className="text-error">{error}</div>}
        {deleteError && <div className="text-error">{deleteError}</div>}
      </div>

      <div className="card stack">
        <h3 className="section-heading">
          {editing ? "Edit exercises" : "Exercises"}
        </h3>
        {removeError && <div className="text-error">{removeError}</div>}
        {!editing ? (
          exercises.length === 0 ? (
            <div className="text-muted">No exercises logged yet.</div>
          ) : (
            <div className="stack stack--md">
              {exercises.map((ex) => (
                <article key={ex.id} className="exercise-result">
                  <div>
                    <strong>{ex.name}</strong>
                    {ex.muscle_group && (
                      <span className="text-muted"> ({ex.muscle_group})</span>
                    )}
                  </div>
                  <div className="chip-group">
                    <span className="chip">{ex.sets} sets</span>
                    <span className="chip">{ex.reps} reps</span>
                    {ex.weight && <span className="chip">{ex.weight} kg</span>}
                    {ex.equipment && (
                      <span className="chip">{ex.equipment}</span>
                    )}
                    {ex.difficulty && (
                      <span className="chip">{ex.difficulty}</span>
                    )}
                  </div>
                  {ex.instructions && (
                    <p className="text-muted">{ex.instructions}</p>
                  )}
                </article>
              ))}
            </div>
          )
        ) : (
          <div className="stack stack--md">
            {exerciseEdits.map((ee, idx) => {
              const meta = exercises.find((x) => x.id === ee.id);
              return (
                <article key={ee.id} className="exercise-result">
                  <div>
                    <strong>{meta?.name || "Exercise"}</strong>
                    {meta?.muscle_group && (
                      <span className="text-muted"> ({meta.muscle_group})</span>
                    )}
                  </div>
                  {meta?.equipment && (
                    <div className="text-muted">
                      Equipment: {meta.equipment}
                    </div>
                  )}
                  {meta?.difficulty && (
                    <div className="text-muted">
                      Difficulty: {meta.difficulty}
                    </div>
                  )}
                  {meta?.instructions && (
                    <div className="text-muted">{meta.instructions}</div>
                  )}
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Sets</label>
                      <input
                        type="number"
                        className="input"
                        value={ee.sets}
                        onChange={(e) => {
                          const v = e.target.value;
                          setExerciseEdits((s) =>
                            s.map((s2, i) =>
                              i === idx ? { ...s2, sets: v } : s2,
                            ),
                          );
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Reps</label>
                      <input
                        type="number"
                        className="input"
                        value={ee.reps}
                        onChange={(e) => {
                          const v = e.target.value;
                          setExerciseEdits((s) =>
                            s.map((s2, i) =>
                              i === idx ? { ...s2, reps: v } : s2,
                            ),
                          );
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input
                        className="input"
                        value={ee.weight ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setExerciseEdits((s) =>
                            s.map((s2, i) =>
                              i === idx ? { ...s2, weight: v } : s2,
                            ),
                          );
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleRemoveExercise(ee.id)}
                    disabled={!!removingIds[ee.id]}
                  >
                    {removingIds[ee.id] ? "Removing..." : "Remove"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <div className="card stack">
          <h3 className="section-heading">Add exercise</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="new-ex-name">Name</label>
              <input
                id="new-ex-name"
                className="input"
                value={newExercise.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewExercise((p) => ({
                    ...p,
                    name: value,
                    meta: p.meta?.name && p.meta.name === value ? p.meta : null,
                  }));
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-ex-sets">Sets</label>
              <input
                id="new-ex-sets"
                type="number"
                className="input"
                value={newExercise.sets}
                onChange={(e) =>
                  setNewExercise((p) => ({
                    ...p,
                    sets: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-ex-reps">Reps</label>
              <input
                id="new-ex-reps"
                type="number"
                className="input"
                value={newExercise.reps}
                onChange={(e) =>
                  setNewExercise((p) => ({
                    ...p,
                    reps: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-ex-weight">Weight (kg)</label>
              <input
                id="new-ex-weight"
                className="input"
                value={newExercise.weight}
                onChange={(e) =>
                  setNewExercise((p) => ({ ...p, weight: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="action-bar">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddExercise}
              disabled={addingEx}
            >
              {addingEx ? "Adding..." : "Attach to workout"}
            </button>
            {addExError && <div className="text-error">{addExError}</div>}
          </div>
          <ExerciseSearch
            title="Search exercises (API Ninjas)"
            helperText="Pick a result to autofill the name."
            onSelect={(meta) => {
              if (!meta) return;
              setNewExercise((p) => ({
                ...p,
                name: meta.name || "",
                meta,
              }));
            }}
          />
        </div>
      )}
    </section>
  );
}

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString();
  } catch (err) {
    console.error("date format failed", err);
    return value;
  }
}
