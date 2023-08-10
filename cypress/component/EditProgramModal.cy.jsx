/// <reference types="cypress"/>

import { testing } from "../../src/components/EditProgramModal";
import { getStore } from "../../src/store";
import { overrideConfig } from "../../src/store/configSlice";

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
