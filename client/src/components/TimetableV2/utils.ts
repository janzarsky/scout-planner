import { Temporal } from "@js-temporal/polyfill";
import { LOCAL_TIMEZONE } from "./types";

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

// Cache for storing previously calculated PlainDateTime results
const dateTimeCache = new Map<number, Temporal.PlainDateTime>();

/**
 * Converts epoch milliseconds to Temporal.PlainDateTime. It caches the result
 * to avoid recalculating the same value multiple times, since the conversion
 * is expensive.
 */
export function epochMillisecondsToPlainDateTime(
  epochMilliseconds: number,
): Temporal.PlainDateTime {
  const cached = dateTimeCache.get(epochMilliseconds);
  if (cached) {
    return cached;
  }

  const result = Temporal.Instant.fromEpochMilliseconds(epochMilliseconds)
    .toZonedDateTimeISO(LOCAL_TIMEZONE)
    .toPlainDateTime();
  dateTimeCache.set(epochMilliseconds, result);
  return result;
}
