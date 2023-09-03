import { describe, expect, test } from "vitest";
import { parseDate } from "./DateUtils";
import { addEmptyDays } from "./EmptyDays";

/**
 * @param {[string]} input Input array of dates
 * @param {[string]} expected Output array, if omitted, we expect
 * that there were no days added
 */
function checkDates(input, expected) {
  const convertedInput = input.map((day) => parseDate(day));
  const convertedExpected = expected
    ? expected.map((day) => parseDate(day))
    : convertedInput;
  expect(addEmptyDays(convertedInput)).toEqual(convertedExpected);
}

test("no new days", () =>
  checkDates(["10.06.2022", "11.06.2022", "12.06.2022"]));

describe("gaps", () => {
  test("1 day gap", () =>
    checkDates(
      ["10.06.2022", "11.06.2022", "13.06.2022"],
      ["10.06.2022", "11.06.2022", "12.06.2022", "13.06.2022"],
    ));

  test("2 day gap", () =>
    checkDates(
      ["10.06.2022", "11.06.2022", "14.06.2022"],
      ["10.06.2022", "11.06.2022", "12.06.2022", "13.06.2022", "14.06.2022"],
    ));

  test("3 day gap", () =>
    checkDates(
      ["10.06.2022", "11.06.2022", "15.06.2022"],
      [
        "10.06.2022",
        "11.06.2022",
        "12.06.2022",
        "13.06.2022",
        "14.06.2022",
        "15.06.2022",
      ],
    ));

  test("4 day gap", () =>
    checkDates(["10.06.2022", "11.06.2022", "16.06.2022"]));
});

describe("few days", () => {
  test("1 day", () =>
    checkDates(["10.06.2022"], ["10.06.2022", "11.06.2022", "12.06.2022"]));

  test("2 days", () =>
    checkDates(
      ["10.06.2022", "11.06.2022"],
      ["10.06.2022", "11.06.2022", "12.06.2022"],
    ));
});

test("gap between 2 days", () =>
  checkDates(
    ["10.06.2022", "12.06.2022"],
    ["10.06.2022", "11.06.2022", "12.06.2022"],
  ));
