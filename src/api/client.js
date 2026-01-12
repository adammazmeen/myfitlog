export const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function postUser({ firebase_uid, email }) {
  if (!API_BASE) return null
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firebase_uid, email }),
  })
  if (!res.ok) throw new Error('Failed to create user')
  return res.json()
}
