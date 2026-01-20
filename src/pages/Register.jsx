import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { register } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError("Passwords do not match");
    try {
      await register(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  }

  return (
    <section className="glass-panel form-card stack">
      <div className="stack">
        <h1 className="page-heading">Create Account</h1>
        <p className="page-subtitle">
          Join MyFitLog and keep your training organized.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="stack">
        <div className="form-group">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            name="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-confirm">Confirm Password</label>
          <input
            id="reg-confirm"
            name="confirmPassword"
            type="password"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-error">{error}</div>}
        <button type="submit" className="btn btn-primary btn-block">
          Register
        </button>
      </form>
    </section>
  );
}
