export default function ProgressPhotos() {
  return (
    <div>
      <h2>Progress Photos</h2>
      <p>Upload and view progress photos (placeholder).</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        <div style={{ background: '#f6f6f6', height: 120 }} />
        <div style={{ background: '#f6f6f6', height: 120 }} />
        <div style={{ background: '#f6f6f6', height: 120 }} />
      </div>
    </div>
  )
}
