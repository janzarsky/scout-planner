import { describe, expect, it } from "vitest";
import { generateTimetableId, isValidTimetableId } from "./timetableIdUtils";

describe("Timetable ID validator", () => {
  it("rejects empty string", () =>
    expect(isValidTimetableId("")).toEqual(false));

  it("rejects strings shorter than 3 characters", () =>
    expect(isValidTimetableId("ab")).toEqual(false));

  it("rejects strings containing invalid characters", () =>
    expect(isValidTimetableId("abc#$%")).toEqual(false));

  it("accepts strings with alphanumeric characters", () =>
    expect(isValidTimetableId("abc123ABC")).toEqual(true));

  it("accepts strings with underscores and hyphens characters", () =>
    expect(isValidTimetableId("abc-123_ABC")).toEqual(true));
});

describe("Timetable ID generator", () => {
  it("produces string at least 8 characters long", () =>
    expect(generateTimetableId().length).toBeGreaterThanOrEqual(8));

  it("produces alphanumeric string", () =>
    expect(generateTimetableId()).toMatch(/[a-zA-Z0-9]+/));

  it("produces valid string", () =>
    expect(isValidTimetableId(generateTimetableId())).toEqual(true));
});
