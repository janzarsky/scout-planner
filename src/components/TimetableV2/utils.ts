/**
 * Groups neighbouring numbers into arrays of consecutive numbers
 * @param _items Array of numbers
 * @returns Array of arrays of consecutive numbers
 *
 * @example
 * groupNeighbours([1, 2, 3, 5, 6, 8, 9, 10])
 * // => [[1, 2, 3], [5, 6], [8, 9, 10]]
 */
export function groupNeighbours(_items: number[]): number[][] {
  const items = [..._items];
  items.sort();
  const result: number[][] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (
      result.length === 0 ||
      result[result.length - 1][result[result.length - 1].length - 1] !==
        item - 1
    ) {
      result.push([item]);
    } else {
      result[result.length - 1].push(item);
    }
  }

  return result;
}

/**
 * Determines if a program should be highlighted based on filters
 */
export function isProgramHighlighted(
  program: { people: { person: string }[]; pkg: string | null },
  ownerFilter: string | null,
  packageFilter: string | null,
): boolean {
  if (ownerFilter === null && packageFilter === null) {
    return true;
  }
  const ownerSatisfied =
    ownerFilter === null ||
    program.people.some((it) => it.person === ownerFilter);
  const packageSatified =
    packageFilter === null || program.pkg === packageFilter;
  return ownerSatisfied && packageSatified;
}
