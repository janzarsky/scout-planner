import { describe, expect, it, vi } from "vitest";
import { corsMiddleware } from "./corsMiddleware";

describe("CORS middleware", () => {
  it("always adds allow origin header", async () => {
    const res = { set: vi.fn() };
    const next = vi.fn();

    await corsMiddleware({ method: "GET" }, res, next);

    expect(res.set).toBeCalledWith("Access-Control-Allow-Origin", "*");
    expect(next).toBeCalled();
  });

  it("adds CORS header when the request method is OPTIONS", async () => {
    const send = vi.fn();
    const res = { set: vi.fn(), status: vi.fn().mockReturnValue({ send }) };
    const next = vi.fn();

    await corsMiddleware({ method: "OPTIONS" }, res, next);

    expect(res.set).toBeCalledWith("Access-Control-Allow-Origin", "*");
    expect(res.set).toBeCalledWith("Access-Control-Allow-Methods", "POST");
    expect(res.set).toBeCalledWith(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    expect(res.set).toBeCalledWith("Access-Control-Max-Age", "3600");

    expect(res.status).toBeCalledWith(204);
    expect(send).toBeCalled();

    expect(next).not.toBeCalled();
  });
});
