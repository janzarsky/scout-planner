export function parseIntOrZero(input) {
  const result = parseInt(input);
  if (isNaN(result)) return 0;
  return result;
}
