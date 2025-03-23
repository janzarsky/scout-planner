import { describe, it, expect } from "vitest";
import { testing } from ".";

describe("get identity", () => {
  it("throws error when called without auth header", async () => {
    await expect(testing.getIdentity({ headers: {} })).rejects.toThrowError(
      "Unauthorized",
    );
  });

  it("throws error when called with invalid auth header", async () => {
    const req = {
      headers: {
        authorization: "invalid_value",
      },
    };
    await expect(testing.getIdentity(req)).rejects.toThrowError("Unauthorized");
  });

  // TODO: use stub for validating token
  it.skip("throws error when called with invalid ID token", async () => {
    const req = {
      headers: {
        authorization: "Bearer abc",
      },
    };
    await expect(testing.getIdentity(req)).rejects.toThrowError();
  });
});

describe("get options", () => {
  it("throws error when no parameters", () => {
    expect(() => testing.getOptions({ query: {} })).toThrow(
      "Invalid parameters",
    );
  });

  it("throws error when no destination", () => {
    expect(() =>
      testing.getOptions({ query: { source: "timetable1" } }),
    ).toThrow("Invalid parameters");
  });

  it("returns source and destination", () => {
    expect(
      testing.getOptions({
        query: { source: "timetable1", destination: "timetable2" },
      }),
    ).toEqual({ source: "timetable1", destination: "timetable2" });
  });
});
