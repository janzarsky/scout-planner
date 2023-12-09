import { addError } from "./errorsSlice";
import { addProgram } from "./programsSlice";

export function getCommandHandler(store) {
  return {
    dispatchCommand(client, { action, payload }) {
      const actions = {
        [addProgram().type]: (payload) => {
          client.addProgram(payload).then(
            (resp) => store.dispatch(addProgram(resp)),
            (e) => store.dispatch(addError(e.message)),
          );
          // throwing out promise on purpose
        },
      };

      if (!actions[action]) throw new Error(`Unsupported command: ${action}`);

      actions[action](payload);
    },
  };
}
