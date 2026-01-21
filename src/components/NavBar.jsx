import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-link is-active" : "nav-link";

  const authedNav = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/workouts", label: "Workouts" },
    { to: "/progress", label: "Progress" },
    { to: "/about", label: "About" },
  ];

  const guestNav = [{ to: "/about", label: "About" }];

  const navItems = user ? authedNav : guestNav;

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  function handleNavSelection() {
    setIsMenuOpen(false);
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.warn("logout failed", err);
    } finally {
      setIsMenuOpen(false);
    }
  }

  return (
    <header className={`nav-shell ${isMenuOpen ? "nav-shell--open" : ""}`}>
      <div className="nav-header">
        <NavLink to="/" className="nav-brand" end onClick={handleNavSelection}>
          MyFitLog
        </NavLink>
        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <nav className="nav-links nav-links--primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={navLinkClass}
            onClick={handleNavSelection}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="nav-links nav-links--actions">
        {user ? (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <NavLink
              to="/login"
              className={navLinkClass}
              onClick={handleNavSelection}
            >
              Login
            </NavLink>
            <Link
              to="/register"
              className="btn btn-primary btn-sm"
              onClick={handleNavSelection}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
