import { describe, expect, it, vi } from "vitest";
import { authMiddleware, testing } from "./authMiddleware";

const { getIdentity } = testing;

describe("auth middleware", () => {
  it("send 401 when not authenticated", async () => {
    const send = vi.fn();
    const res = {
      status: vi.fn().mockReturnValue({ send }),
    };
    const next = vi.fn();

    await authMiddleware({ headers: [] }, res, next);

    expect(res.status).toBeCalledWith(401);
    expect(send).toBeCalled();
    expect(next).not.toBeCalled();
  });
});

describe("get identity", () => {
  it("throws error when called without auth header", async () => {
    await expect(getIdentity({ headers: {} })).rejects.toThrowError(
      "Unauthorized",
    );
  });

  it("throws error when called with invalid auth header", async () => {
    const req = {
      headers: {
        authorization: "invalid_value",
      },
    };
    await expect(getIdentity(req)).rejects.toThrowError("Unauthorized");
  });

  // TODO: use stub for validating token
  it.skip("throws error when called with invalid ID token", async () => {
    const req = {
      headers: {
        authorization: "Bearer abc",
      },
    };
    await expect(getIdentity(req)).rejects.toThrowError();
  });
});
