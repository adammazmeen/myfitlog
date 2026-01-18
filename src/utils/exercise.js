export function toEquipmentString(raw) {
  if (!raw) return "";
  if (Array.isArray(raw)) {
    return raw
      .map((item) =>
        typeof item === "string"
          ? item.trim()
          : item != null
            ? String(item)
            : ""
      )
      .filter(Boolean)
      .join(", ");
  }
  if (typeof raw === "object") {
    return Object.values(raw)
      .map((item) => (item == null ? "" : String(item).trim()))
      .filter(Boolean)
      .join(", ");
  }
  return String(raw).trim();
}

export function normalizeExternalExercise(result) {
  if (!result) return null;
  const equipmentSource =
    result.equipment ??
    result.equipments ??
    result.equipment_list ??
    result.equipmentList ??
    result.equipment_required;

  return {
    name: result.name || "",
    muscle_group: result.muscle || result.muscle_group || "",
    equipment: toEquipmentString(equipmentSource),
    difficulty: result.difficulty || "",
    instructions: result.instructions || "",
  };
}
