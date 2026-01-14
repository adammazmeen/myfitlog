import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE || "";

function makeError(prefix, err) {
  if (err?.response) {
    const body =
      typeof err.response.data === "string"
        ? err.response.data
        : JSON.stringify(err.response.data);
    return new Error(`${prefix}: ${err.response.status} ${body}`);
  }
  return new Error(`${prefix}: ${err.message || String(err)}`);
}

export async function postUser({ firebase_uid, email }) {
  if (!API_BASE) return null;
  try {
    const res = await axios.post(`${API_BASE}/users`, { firebase_uid, email });
    return res.data;
  } catch (err) {
    throw makeError("Failed to create user", err);
  }
}

export async function getWorkoutsForUser(userId) {
  if (!API_BASE) return [];
  try {
    const res = await axios.get(`${API_BASE}/workouts/user/${userId}`);
    return res.data;
  } catch (err) {
    throw makeError("Failed to fetch workouts", err);
  }
}

export async function createWorkout({ user_id, title, workout_date }) {
  if (!API_BASE) return null;
  try {
    const res = await axios.post(`${API_BASE}/workouts`, {
      user_id,
      title,
      workout_date,
    });
    return res.data;
  } catch (err) {
    throw makeError("Failed to create workout", err);
  }
}

export async function getWorkout(workoutId) {
  if (!API_BASE) return null;
  try {
    const res = await axios.get(`${API_BASE}/workouts/${workoutId}`);
    return res.data;
  } catch (err) {
    throw makeError("Failed to fetch workout", err);
  }
}

export async function getWorkoutExercises(workoutId) {
  if (!API_BASE) return [];
  try {
    const res = await axios.get(`${API_BASE}/workout-exercises/${workoutId}`);
    return res.data;
  } catch (err) {
    throw makeError("Failed to fetch workout exercises", err);
  }
}

export async function postExercise({
  name,
  muscle_group,
  equipment,
  difficulty,
  instructions,
}) {
  if (!API_BASE) return null;
  try {
    const res = await axios.post(`${API_BASE}/exercises`, {
      name,
      muscle_group,
      equipment,
      difficulty,
      instructions,
    });
    return res.data;
  } catch (err) {
    throw makeError("Failed to save exercise", err);
  }
}

export async function addWorkoutExercise({
  workout_id,
  exercise_id,
  sets,
  reps,
  weight,
}) {
  if (!API_BASE) return null;
  try {
    const res = await axios.post(`${API_BASE}/workout-exercises`, {
      workout_id,
      exercise_id,
      sets,
      reps,
      weight,
    });
    return res.data;
  } catch (err) {
    throw makeError("Failed to add workout exercise", err);
  }
}

export async function updateWorkout(workoutId, { title, workout_date }) {
  if (!API_BASE) return null;
  try {
    const res = await axios.put(`${API_BASE}/workouts/${workoutId}`, {
      title,
      workout_date,
    });
    return res.data;
  } catch (err) {
    throw makeError("Failed to update workout", err);
  }
}

export async function updateWorkoutExercise(id, { sets, reps, weight }) {
  if (!API_BASE) return null;
  try {
    const res = await axios.put(`${API_BASE}/workout-exercises/${id}`, {
      sets,
      reps,
      weight,
    });
    return res.data;
  } catch (err) {
    throw makeError("Failed to update workout exercise", err);
  }
}
