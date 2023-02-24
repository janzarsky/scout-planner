export function byOrder(a, b) {
  if (a.order < b.order) return -1;
  if (a.order > b.order) return 1;
  return 0;
}

export function byName(a, b) {
  return a.name.localeCompare(b.name);
}

export function arraysEqualWithSorting(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  const aSorted = [...a].sort();
  const bSorted = [...b].sort();

  for (var i = 0; i < aSorted.length; ++i) {
    if (aSorted[i] !== bSorted[i]) return false;
  }
  return true;
}
