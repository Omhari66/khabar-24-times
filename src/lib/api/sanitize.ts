export function sanitizeString(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function sanitizeOptionalString(value: string | null | undefined) {
  if (typeof value !== "string") return value;

  const sanitized = sanitizeString(value);
  return sanitized.length > 0 ? sanitized : "";
}

export function normalizeSlug(value: string) {
  return sanitizeString(value).toLowerCase();
}
