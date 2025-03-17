import { describe, it } from "vitest";
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
        authorization: "asdf",
      },
    };
    await expect(testing.getIdentity(req)).rejects.toThrowError("Unauthorized");
  });

  // TODO: use stub for validating token
  it.skip("throws error when called with invalid ID token", async () => {
    const req = {
      headers: {
        authorization: "Bearer eyJhbGciOiJ",
      },
    };
    await expect(testing.getIdentity(req)).rejects.toThrowError();
  });
});
