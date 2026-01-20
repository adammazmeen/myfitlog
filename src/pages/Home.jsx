import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const heroPhotos = [
  {
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    alt: "Athlete powering through battle ropes",
    caption: "Conditioning",
    meta: "HIIT finishers",
    variant: "tall",
  },
  {
    src: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=900&q=80",
    alt: "Colorful meal prep bowls on a counter",
    caption: "Fuel Log",
    meta: "Macro snapshots",
    variant: "wide",
  },
  {
    src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80",
    alt: "Person in baton relay stance",
    caption: "Relay Tracker",
    meta: "Intervals logged",
    variant: "tall",
  },
  {
    src: "https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&w=900&q=80",
    alt: "Person about to lift the barbell",
    caption: "Strength Block",
    meta: "Week 08",
    variant: "wide",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  return (
    <section className="hero hero--with-gallery">
      <div className="hero__content">
        <p className="pill">Daily momentum • Captured in color</p>
        <h1 className="hero__title">MyFitLog</h1>
        <p className="hero__lead">
          Track the reps, the runs, and the glow-up photos in one cinematic
          timeline. Your routine finally looks as strong as it feels.
        </p>
        <div className="hero__actions">
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-outline">
            Sign Up
          </Link>
        </div>
        <ul className="hero__stat-list">
          <li>
            <span className="hero__stat-value">+380</span>
            <span className="hero__stat-label">photos logged every week</span>
          </li>
          <li>
            <span className="hero__stat-value">92%</span>
            <span className="hero__stat-label">
              stick to their workout streak
            </span>
          </li>
        </ul>
      </div>

      <div className="hero__gallery">
        {heroPhotos.map((photo) => (
          <figure
            key={photo.src}
            className={`hero__shot ${photo.variant === "tall" ? "hero__shot--tall" : ""}`}
          >
            <img src={photo.src} alt={photo.alt} loading="lazy" />
            <figcaption className="hero__shot-caption">
              <span>{photo.caption}</span>
              <small>{photo.meta}</small>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
