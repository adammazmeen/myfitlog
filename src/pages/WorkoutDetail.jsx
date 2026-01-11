import { useParams } from 'react-router-dom'

export default function WorkoutDetail() {
  const { id } = useParams()
  return (
    <div>
      <h2>Workout {id}</h2>
      <p>Detail view for workout {id} (replace with real data fetch).</p>
    </div>
  )
}
