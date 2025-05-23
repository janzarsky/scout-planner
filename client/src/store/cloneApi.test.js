import { describe, expect, it } from "vitest";
import { testing } from "./cloneApi";

const { msgs, translateError } = testing;

describe("translate error", () => {
  it("returns generic message when response is null", () =>
    expect(translateError(null)).toEqual(msgs.generic));

  it("returns generic message when response data is missing", () =>
    expect(translateError({})).toEqual(msgs.generic));

  it("returns generic message when response data is null", () =>
    expect(translateError({ data: null })).toEqual(msgs.generic));

  it("returns generic message when response data has no status", () =>
    expect(translateError({ data: {} })).toEqual(msgs.generic));

  it("returns unauthorized message for 401", () =>
    expect(
      translateError({ status: 401, data: { message: "Unauthorized" } }),
    ).toEqual(msgs.unauthorized));

  it("returns table access error message for 403", () =>
    expect(
      translateError({
        status: 403,
        data: { message: "Access to source table forbidden" },
      }),
    ).toEqual(msgs.forbidden));

  it("returns generic message for 400", () =>
    expect(
      translateError({ status: 400, data: { message: "Invalid parameters" } }),
    ).toEqual(msgs.generic));

  it("returns generic message for 500", () =>
    expect(
      translateError({
        status: 500,
        data: { message: "Internal server error" },
      }),
    ).toEqual(msgs.generic));
});
