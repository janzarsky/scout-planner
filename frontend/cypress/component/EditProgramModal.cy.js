/// <reference types="cypress"/>

import { EditProgramModal } from "../../src/components/EditProgramModal";
import { getStore } from "../../src/store";
import { addPerson, setLegacyPeople } from "../../src/store/peopleSlice";
import { addProgram } from "../../src/store/programsSlice";

describe("EditProgramModal", () => {
  const alice = {
    _id: "testuseralice",
    name: "Alice",
  };
  const bob = {
    _id: "testuserbob",
    name: "Bob",
  };

  let store;

  function mountModal(programId) {
    cy.mount(
      <EditProgramModal programId={programId} handleClose={() => {}} />,
      { dndProvider: false, reduxStore: store }
    );
  }

  beforeEach(() => {
    cy.viewport(400, 600);

    store = getStore();

    store.dispatch(setLegacyPeople(["Cecil"]));

    store.dispatch(addPerson(alice));
    store.dispatch(addPerson(bob));
  });

  it("combined people", () => {
    const prog1 = {
      _id: "prog1",
      people: [alice.name, bob.name, "Cecil"],
    };
    store.dispatch(addProgram(prog1));
    mountModal(prog1._id);
    cy.get("#Alice").should("be.checked");
    cy.get("#Bob").should("be.checked");
    cy.get("#Cecil").should("be.checked");
  });
});