import { useNavigate } from 'react-router-dom'

export default function NewWorkout() {
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: create workout and navigate to its detail page
    navigate('/workouts')
  }

  return (
    <div>
      <h2>Create Workout</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name: <input name="name" />
        </label>
        <button type="submit">Create</button>
      </form>
    </div>
  )
}
