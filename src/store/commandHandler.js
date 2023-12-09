import { addProgram } from "./programsSlice";

export function getCommandHandler(store) {
  return {
    dispatchCommand({ action, payload }) {
      const actions = {
        "programs/addProgram"(store, payload) {
          store.dispatch(addProgram(payload));
        },
      };

      if (!actions[action]) throw new Error(`Unsupported command: ${action}`);

      actions[action](store, payload);
    },
  };
}
