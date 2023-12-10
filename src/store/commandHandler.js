import { addError } from "./errorsSlice";
import { addPerson, deletePerson, updatePerson } from "./peopleSlice";
import { addProgram, deleteProgram, updateProgram } from "./programsSlice";

export function getCommandHandler(store) {
  return {
    dispatchCommand(client, { type, payload }) {
      const actions = {
        // throwing out promise on purpose in all actions
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
      };

      if (!actions[type]) throw new Error(`Unsupported command: ${type}`);

      actions[type](payload);
    },
  };
}
