import { describe, vi } from "vitest";
import { getCommandHandler } from "./commandHandler";

describe("Command handler", () => {
  let store;
  let client;

  beforeEach(() => {
    store = {
      dispatch: vi.fn().mockImplementation(),
    };
    client = {
      addProgram: vi.fn().mockImplementation(async (req) => req),
    };
  });

  it("throws error when the command is not recognized", () => {
    const commandHandler = getCommandHandler(store);
    expect(() =>
      commandHandler.dispatchCommand(client, {
        action: "testcommand",
        payload: "testpayload",
      }),
    ).toThrowError(/testcommand/);
  });

  it("executes command", async () => {
    const commandHandler = getCommandHandler(store);
    commandHandler.dispatchCommand(client, {
      action: "programs/addProgram",
      payload: { id: "test" },
    });
    expect(client.addProgram).toHaveBeenCalledWith({ id: "test" });
    // TODO: we need to add flushing of commands so that this can be checked
    //expect(store.dispatch).toHaveBeenCalledWith(addProgram({ id: "test" }));
  });
});
