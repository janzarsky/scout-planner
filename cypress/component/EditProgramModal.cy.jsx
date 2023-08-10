/// <reference types="cypress"/>

import { firestoreClientFactory } from "../../src/FirestoreClient";
import {
  EditProgramModal,
  testing,
} from "../../src/components/EditProgramModal";
import { getStore } from "../../src/store";
import { overrideConfig } from "../../src/store/configSlice";
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

describe("PersonCheck", () => {
  let store;

  beforeEach(() => {
    store = getStore();
  });

  it("sets attendance", () => {
    store.dispatch(overrideConfig({ optionalAttendance: false }));
    cy.mount(
      <testing.PersonCheck
        name={"Person 1"}
        id={"person1"}
        available={true}
        attendance={null}
        disabled={false}
        setAttendance={cy.stub().as("set")}
        removeAttendance={cy.stub().as("remove")}
      />,
      { reduxStore: store },
    );

    cy.contains("Person 1").click();
    cy.get("@set").should("have.been.calledOnceWith", "person1", {});
  });

  it("removes attendance", () => {
    store.dispatch(overrideConfig({ optionalAttendance: false }));
    cy.mount(
      <testing.PersonCheck
        name={"Person 1"}
        id={"person1"}
        available={true}
        attendance={{ person: "person1" }}
        disabled={false}
        setAttendance={cy.stub().as("set")}
        removeAttendance={cy.stub().as("remove")}
      />,
      { reduxStore: store },
    );

    cy.contains("Person 1").click();
    cy.get("@remove").should("have.been.calledOnceWith", "person1");
  });
});
