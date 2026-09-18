const CLASS_PATTERN = /^[0-9]+[A-Z](?:-[A-Z][0-9]{3})?$/;

export function normalizeClass(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

export function parseAudience(value) {
  const raw = String(value || "all").trim();
  if (!raw) return ["all"];
  const scopes = raw.split(/[,;|]/).map(normalizeClass).filter(Boolean);
  if (!scopes.length) return ["all"];
  if (scopes.some(scope => scope.toLowerCase() === "all")) {
    if (scopes.length !== 1) throw new Error("Phạm vi `all` không được đi cùng mã lớp khác.");
    return ["all"];
  }
  for (const scope of scopes) {
    if (!CLASS_PATTERN.test(scope)) {
      throw new Error(`Phạm vi lớp không hợp lệ: ${scope}. Dùng all, 3A, 3A-E402 hoặc 3A-D301.`);
    }
  }
  return [...new Set(scopes)];
}

export function canonicalAudience(value) {
  return parseAudience(value).join(", ");
}

function sourceScopeMatchesClass(scope, studentClass) {
  return scope === studentClass || studentClass.startsWith(`${scope}-`);
}

export function sourceAppliesToProfile(audience, profile = {}) {
  let scopes;
  try { scopes = parseAudience(audience); } catch { return false; }
  if (scopes.includes("all")) return true;
  const studentClasses = [profile.practice_class, profile.theory_class]
    .map(normalizeClass)
    .filter(value => CLASS_PATTERN.test(value));
  return scopes.some(scope => studentClasses.some(studentClass => sourceScopeMatchesClass(scope, studentClass)));
}
