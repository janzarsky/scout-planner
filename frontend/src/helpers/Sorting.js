export function byOrder(a, b) {
  if (a.order < b.order) return -1;
  if (a.order > b.order) return 1;
  return 0;
}

export function byName(a, b) {
  return a.name.localeCompare(b.name);
}
