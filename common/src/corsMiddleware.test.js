import { describe, expect, it, vi } from "vitest";
import { corsMiddleware } from "./corsMiddleware";

describe("CORS middleware", () => {
  it("always adds allow origin header", async () => {
    const res = { set: vi.fn() };
    const next = vi.fn();

    await corsMiddleware(["POST"])({ method: "POST" }, res, next);

    expect(res.set).toBeCalledWith("Access-Control-Allow-Origin", "*");
    expect(next).toBeCalled();
  });

  it("adds CORS header when the request method is OPTIONS", async () => {
    const send = vi.fn();
    const res = { set: vi.fn(), status: vi.fn().mockReturnValue({ send }) };
    const next = vi.fn();

    await corsMiddleware(["POST"])({ method: "OPTIONS" }, res, next);

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

  it("allows specific methods in CORS headers", async () => {
    const res = {
      set: vi.fn(),
      status: vi.fn().mockReturnValue({ send: vi.fn() }),
    };
    const next = vi.fn();

    await corsMiddleware(["GET", "POST"])({ method: "OPTIONS" }, res, next);

    expect(res.set).toBeCalledWith("Access-Control-Allow-Methods", "GET, POST");
  });

  it("returns 405 when method not allowed", async () => {
    const send = vi.fn();
    const res = {
      set: vi.fn(),
      status: vi.fn().mockReturnValue({ send }),
    };
    const next = vi.fn();

    await corsMiddleware(["GET", "POST"])({ method: "PUT" }, res, next);

    expect(res.set).toBeCalledWith("Allow", "GET, POST");
    expect(res.status).toBeCalledWith(405);
    expect(send).toBeCalled();
  });
});
