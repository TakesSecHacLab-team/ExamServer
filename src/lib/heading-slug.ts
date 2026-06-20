export function slugifyHeading(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\\`*_{}[\]()#+.!?:"'|<>]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
