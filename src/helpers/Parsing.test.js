import { expect, test } from "vitest";
import { parseIntOrZero } from "./Parsing";

test("valid number", () => {
  expect(parseIntOrZero("42")).toEqual(42);
});

test("zero", () => {
  expect(parseIntOrZero("0")).toEqual(0);
});

test("invalid number", () => {
  expect(parseIntOrZero("asdf")).toEqual(0);
});
