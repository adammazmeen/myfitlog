export default function Register() {
  return (
    <div style={{ maxWidth: 480 }}>
      <h2>Register</h2>
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
        <div>
          <label>
            Confirm Password
            <input name="confirmPassword" type="password" />
          </label>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
