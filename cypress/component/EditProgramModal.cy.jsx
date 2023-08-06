/// <reference types="cypress"/>

import { firestoreClientFactory } from "../../src/FirestoreClient";
import { EditProgramModal } from "../../src/components/EditProgramModal";
import { getStore } from "../../src/store";
import { addPerson } from "../../src/store/peopleSlice";
import { addProgram } from "../../src/store/programsSlice";
import { Route, Routes } from "react-router-dom";

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
      <Routes>
        <Route path="/edit/:id" element={<EditProgramModal />} />
      </Routes>,
      {
        dndProvider: false,
        reduxStore: store,
        router: true,
        initialEntries: [`/edit/${programId}`],
      },
    );
  }

  beforeEach(() => {
    cy.viewport(400, 600);

    cy.stub(firestoreClientFactory, "getClient").log(false);

    store = getStore();

    store.dispatch(addPerson(alice));
    store.dispatch(addPerson(bob));
  });

  it("shows attendance", () => {
    const prog1 = {
      _id: "prog1",
      people: [{ person: alice._id }, { person: bob._id }],
    };
    store.dispatch(addProgram(prog1));
    mountModal(prog1._id);
    cy.get("#testuseralice").should("be.checked");
    cy.get("#testuserbob").should("be.checked");
  });
});
