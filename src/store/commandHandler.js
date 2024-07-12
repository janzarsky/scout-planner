import { addError } from "./errorsSlice";
import { addProgram, deleteProgram, updateProgram } from "./programsSlice";
import { updateSettings } from "./settingsSlice";
import { updateTitle } from "./timetableSlice";

export function getCommandHandler(store) {
  return {
    dispatchCommand(client, { type, payload }) {
      const actions = {
        // throwing out promise on purpose in all actions

        // programs
        [addProgram().type]: (payload) => {
          client.addProgram(payload).then(
            (resp) => store.dispatch(addProgram(resp)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        [updateProgram().type]: (payload) => {
          client.updateProgram(payload).then(
            (resp) => store.dispatch(updateProgram(resp)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        [deleteProgram().type]: (payload) => {
          client.updateProgram({ ...payload, deleted: true }).then(
            () => store.dispatch(deleteProgram(payload._id)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        // settings
        [updateSettings().type]: (payload) => {
          client.updateTimetable({ settings: payload }).then(
            () => store.dispatch(updateSettings(payload)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        [updateTitle().type]: (payload) => {
          client.updateTimetable({ title: payload }).then(
            () => store.dispatch(updateTitle(payload)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
      };

      if (!actions[type]) throw new Error(`Unsupported command: ${type}`);

      actions[type](payload);
    },
  };
}
