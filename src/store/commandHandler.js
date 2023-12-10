import { addError } from "./errorsSlice";
import { addGroup, deleteGroup, updateGroup } from "./groupsSlice";
import { addPerson, deletePerson, updatePerson } from "./peopleSlice";
import { addProgram, deleteProgram, updateProgram } from "./programsSlice";

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
        // people
        [addPerson().type]: (payload) => {
          client.addPerson(payload).then(
            (resp) => store.dispatch(addPerson(resp)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        [updatePerson().type]: (payload) => {
          client.updatePerson(payload).then(
            (resp) => store.dispatch(updatePerson(resp)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        [deletePerson().type]: (id) => {
          client.deletePerson(id).then(
            () => store.dispatch(deletePerson(id)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        // groups
        [addGroup().type]: (payload) => {
          client.addGroup(payload).then(
            (resp) => store.dispatch(addGroup(resp)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        [updateGroup().type]: (payload) => {
          client.updateGroup(payload).then(
            (resp) => store.dispatch(updateGroup(resp)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
        [deleteGroup().type]: (id) => {
          client.deleteGroup(id).then(
            () => store.dispatch(deleteGroup(id)),
            (e) => store.dispatch(addError(e.message)),
          );
        },
      };

      if (!actions[type]) throw new Error(`Unsupported command: ${type}`);

      actions[type](payload);
    },
  };
}
