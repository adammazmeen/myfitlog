export default function Login() {
  return (
    <div style={{ maxWidth: 480 }}>
      <h2>Login</h2>
      <form>
        <div>
          <label>
            Email
            <input name="email" type="email" />
          </label>
        </div>
        <div>
          <label>
            Password
            <input name="password" type="password" />
          </label>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
