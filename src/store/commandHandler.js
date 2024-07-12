import { addError } from "./errorsSlice";
import { addProgram, deleteProgram, updateProgram } from "./programsSlice";
import { addRule, deleteRule } from "./rulesSlice";
import { updateSettings } from "./settingsSlice";
import { updateTitle } from "./timetableSlice";
import { addUser, deleteUser, updateUser } from "./usersSlice";
import { setPublicLevel } from "./publicLevelSlice";

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
        // rules
        [addRule().type]: (payload) => {
          client.addRule(payload).then(
            (resp) => store.dispatch(addRule(resp)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        // (update rule is not used anywhere)
        [deleteRule().type]: (id) => {
          client.deleteRule(id).then(
            () => store.dispatch(deleteRule(id)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        // users
        [addUser().type]: (payload) => {
          // note that update here is on purpose (users are indexed by email)
          client.updateUser(payload).then(
            (resp) => store.dispatch(addUser(resp)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        [updateUser().type]: (payload) => {
          client.updateUser(payload).then(
            (resp) => store.dispatch(updateUser(resp)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        [deleteUser().type]: (id) => {
          client.deleteUser(id).then(
            () => store.dispatch(deleteUser(id)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        [setPublicLevel().type]: (payload) => {
          client.setPublicLevel(payload).then(
            (level) => store.dispatch(setPublicLevel(level)),
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
