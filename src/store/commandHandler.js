import { addProgram } from "./programsSlice";

export function getCommandHandler(store) {
  return {
    dispatchCommand({ action, payload }) {
      const actions = {
        [addProgram().type]: (store, payload) => {
          store.dispatch(addProgram(payload));
        },
      };

      if (!actions[action]) throw new Error(`Unsupported command: ${action}`);

      actions[action](store, payload);
    },
  };
}
