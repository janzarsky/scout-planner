import { describe, vi } from "vitest";
import { dispatchCommand } from "./commandHandler";
import { addProgram } from "./programsSlice";

describe("Command handler", () => {
  let store;

  beforeEach(() => {
    store = {
      dispatch: vi.fn().mockImplementation(),
    };
  });

  it("throws error when the command is not recognized", () =>
    expect(() =>
      dispatchCommand(store, { action: "testcommand", payload: "testpayload" }),
    ).toThrowError(/testcommand/));

  it("executes command", () => {
    dispatchCommand(store, {
      action: "programs/addProgram",
      payload: { id: "test" },
    });
    expect(store.dispatch).toHaveBeenCalledWith(addProgram({ id: "test" }));
  });
});
