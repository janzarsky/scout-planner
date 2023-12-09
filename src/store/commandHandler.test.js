import { describe, vi } from "vitest";
import { addProgram } from "./programsSlice";
import { getCommandHandler } from "./commandHandler";

describe("Command handler", () => {
  let store;

  beforeEach(() => {
    store = {
      dispatch: vi.fn().mockImplementation(),
    };
  });

  it("throws error when the command is not recognized", () => {
    const commandHandler = getCommandHandler(store);
    expect(() =>
      commandHandler.dispatchCommand({
        action: "testcommand",
        payload: "testpayload",
      }),
    ).toThrowError(/testcommand/);
  });

  it("executes command", () => {
    const commandHandler = getCommandHandler(store);
    commandHandler.dispatchCommand({
      action: "programs/addProgram",
      payload: { id: "test" },
    });
    expect(store.dispatch).toHaveBeenCalledWith(addProgram({ id: "test" }));
  });
});
