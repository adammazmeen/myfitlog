export default function About() {
  return (
    <div style={{ maxWidth: 720 }}>
      <h2>About MyFitLog</h2>
      <p>
        MyFitLog is a simple workout tracker focused on fast logging and progress tracking. The
        MVP keeps things minimal: workouts, progress photos, and a clean dashboard.
      </p>
      <h3>Tech</h3>
      <ul>
        <li>React + Vite</li>
        <li>Planned: local persistence, simple API</li>
      </ul>
    </div>
  )
}
