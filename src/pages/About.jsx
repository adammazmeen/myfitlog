export default function About() {
  return (
    <section className="glass-panel stack">
      <div className="stack">
        <h1 className="page-heading">About MyFitLog</h1>
        <p className="page-subtitle">
          A deliberately focused workout companion built for lifters who care
          about consistency.
        </p>
      </div>

      <div className="card">
        <h3 className="section-heading">What it does</h3>
        <p className="text-muted">
          Log workouts, capture progress photos, and see everything in a
          distraction-free dashboard. No feeds, no noise—just your training
          data.
        </p>
      </div>

      <div className="card">
        <h3 className="section-heading">Stack</h3>
        <ul className="text-muted list-soft">
          <li>React + Vite frontend</li>
          <li>Firebase Authentication & Storage</li>
          <li>Express + PostgreSQL API</li>
        </ul>
      </div>
    </section>
  );
}
