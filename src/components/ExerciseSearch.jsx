import { useEffect, useState } from "react";
import { searchExternalExercises } from "../api/client";
import {
  normalizeExternalExercise,
  toEquipmentString,
} from "../utils/exercise";

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
    if (!onSelect) return;
    const normalized = normalizeExternalExercise(result);
    onSelect(normalized);
  }

  return (
    <div className="exercise-search">
      <div className="exercise-search__header">
        <strong>{title}</strong>
        {helperText && (
          <span className="exercise-search__helper">{helperText}</span>
        )}
      </div>
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="e.g. bench press"
        className="input"
      />
      {loading && term.trim() && (
        <div className="text-muted status-line">Searching...</div>
      )}
      {error && <div className="text-error status-line">{error}</div>}
      {results.length > 0 && (
        <ul className="exercise-results">
          {results.map((result, idx) => {
            const equipmentLabel = toEquipmentString(
              result.equipment ??
                result.equipments ??
                result.equipment_list ??
                result.equipment_required ??
                result.equipmentList
            );
            return (
              <li key={`${result.name}-${idx}`} className="exercise-result">
                <div>
                  <strong>{result.name}</strong>
                  {result.muscle ? ` · ${result.muscle}` : ""}
                  {result.type ? ` · ${result.type}` : ""}
                  {result.difficulty ? ` · ${result.difficulty}` : ""}
                </div>
                {equipmentLabel && (
                  <div className="text-muted">Equipment: {equipmentLabel}</div>
                )}
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="btn btn-outline"
                >
                  Use Exercise
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
