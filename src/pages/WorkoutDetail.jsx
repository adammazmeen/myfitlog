import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getWorkout, getWorkoutExercises } from "../api/client";

export default function WorkoutDetail() {
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading workout...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!workout) return <div>Workout not found.</div>;

  return (
    <div>
      <h2>{workout.title}</h2>
      <div>
        Date:{" "}
        {workout.workout_date
          ? new Date(workout.workout_date).toLocaleDateString()
          : ""}
      </div>

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
