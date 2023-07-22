/// <reference types="cypress"/>

import { firestoreClientFactory } from "../../src/FirestoreClient";
import { EditProgramModal } from "../../src/components/EditProgramModal";
import { getStore } from "../../src/store";
import { addPerson, setLegacyPeople } from "../../src/store/peopleSlice";
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
