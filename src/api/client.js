export const API_BASE = import.meta.env.VITE_API_BASE || "";

export async function postUser({ firebase_uid, email }) {
  if (!API_BASE) return null;
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firebase_uid, email }),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function getWorkoutsForUser(userId) {
  if (!API_BASE) return [];
  const res = await fetch(`${API_BASE}/workouts/user/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch workouts");
  return res.json();
}

export async function createWorkout({ user_id, title, workout_date }) {
  if (!API_BASE) return null;
  const res = await fetch(`${API_BASE}/workouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, title, workout_date }),
  });
  if (!res.ok) throw new Error("Failed to create workout");
  return res.json();
}

export async function getWorkout(workoutId) {
  if (!API_BASE) return null;
  const res = await fetch(`${API_BASE}/workouts/${workoutId}`);
  if (!res.ok) throw new Error("Failed to fetch workout");
  return res.json();
}

export async function getWorkoutExercises(workoutId) {
  if (!API_BASE) return [];
  const res = await fetch(`${API_BASE}/workout-exercises/${workoutId}`);
  if (!res.ok) throw new Error("Failed to fetch workout exercises");
  return res.json();
}

export async function postExercise({
  name,
  muscle_group,
  equipment,
  difficulty,
  instructions,
}) {
  if (!API_BASE) return null;
  const res = await fetch(`${API_BASE}/exercises`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      muscle_group,
      equipment,
      difficulty,
      instructions,
    }),
  });
  if (!res.ok) throw new Error("Failed to save exercise");
  return res.json();
}

export async function addWorkoutExercise({
  workout_id,
  exercise_id,
  sets,
  reps,
  weight,
}) {
  if (!API_BASE) return null;
  const res = await fetch(`${API_BASE}/workout-exercises`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workout_id, exercise_id, sets, reps, weight }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to add workout exercise: ${res.status} ${body}`);
  }
  return res.json();
}
