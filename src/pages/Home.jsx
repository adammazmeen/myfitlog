import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 16px",
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: 12 }}>MyFitLog</h1>
        <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: 24 }}>
          Track workouts. Stay consistent. Keep your progress photos and
          exercise history in one place.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <Link
            to="/login"
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              background: "#111",
              color: "#fff",
              textDecoration: "none",
              minWidth: 140,
            }}
          >
            Login
          </Link>
          <Link
            to="/register"
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              border: "1px solid #111",
              color: "#111",
              textDecoration: "none",
              minWidth: 140,
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
