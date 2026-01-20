import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-link is-active" : "nav-link";

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.warn("logout failed", err);
    }
  }

  return (
    <header className="nav-shell">
      <NavLink to="/" className="nav-brand" end>
        MyFitLog
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" className={navLinkClass} end>
          Home
        </NavLink>
        {user && (
          <>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/workouts" className={navLinkClass}>
              Workouts
            </NavLink>
            <NavLink to="/workouts/new" className={navLinkClass}>
              New Workout
            </NavLink>
            <NavLink to="/progress" className={navLinkClass}>
              Progress
            </NavLink>
          </>
        )}
        <NavLink to="/about" className={navLinkClass}>
          About
        </NavLink>
      </div>
      <div className="nav-links">
        {user ? (
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <NavLink to="/login" className={navLinkClass}>
              Login
            </NavLink>
            <NavLink to="/register" className={navLinkClass}>
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
