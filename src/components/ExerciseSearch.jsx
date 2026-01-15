import { useEffect, useState } from "react";
import { searchExternalExercises } from "../api/client";

export default function ExerciseSearch({
  onSelect,
  title = "Search exercises",
  helperText = "Powered by API Ninjas",
  limit = 8,
}) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const trimmed = term.trim();
    if (!trimmed) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const found = await searchExternalExercises(trimmed);
        if (!cancelled) {
          setResults(found.slice(0, limit));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setError(err.message || "Failed to search exercises");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [term, limit]);

  function handleSelect(result) {
    if (onSelect) onSelect(result);
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ marginBottom: 6 }}>
        <strong>{title}</strong>
        <div style={{ marginTop: 4 }}>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. bench press"
            style={{ minWidth: 220 }}
          />
        </div>
      </div>
      {helperText && (
        <div style={{ fontSize: 12, color: "#666" }}>{helperText}</div>
      )}
      {loading && term.trim() && (
        <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
          Searching...
        </div>
      )}
      {error && <div style={{ color: "red", marginTop: 6 }}>{error}</div>}
      {results.length > 0 && (
        <ul style={{ marginTop: 8 }}>
          {results.map((result, idx) => (
            <li key={`${result.name}-${idx}`} style={{ marginBottom: 8 }}>
              <div>
                <strong>{result.name}</strong>
                {result.muscle ? ` · ${result.muscle}` : ""}
                {result.type ? ` · ${result.type}` : ""}
                {result.difficulty ? ` · ${result.difficulty}` : ""}
              </div>
              {result.equipment && (
                <div style={{ fontSize: 12 }}>
                  Equipment: {result.equipment}
                </div>
              )}
              <button
                type="button"
                onClick={() => handleSelect(result)}
                style={{ marginTop: 4 }}
              >
                Use Exercise
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
