import { describe, it, expect } from "vitest";
import { level } from "./level";

describe("Access level", () => {
  // dummy test, can be removed later
  it("has constants for all levels", () => {
    expect(level).to.haveOwnProperty("NONE");
    expect(level).to.haveOwnProperty("VIEW");
    expect(level).to.haveOwnProperty("EDIT");
    expect(level).to.haveOwnProperty("ADMIN");
  });
});
