/// <reference types="cypress"/>

import React from "react";
import { PersonCheck } from "../../src/components/EditProgramModal";
import { getStore } from "../../src/store";

describe("PersonCheck", () => {
  let store;

  beforeEach(() => {
    store = getStore();
  });

  describe("as button", () => {
    it("sets attendance", () => {
      cy.mount(
        <PersonCheck
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

    it("sets optional attendance", () => {
      cy.mount(
        <PersonCheck
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
      cy.get("@set").should("have.been.calledOnceWith", "person1", {
        optional: true,
      });
    });

    it("removes attendance", () => {
      cy.mount(
        <PersonCheck
          name={"Person 1"}
          id={"person1"}
          available={true}
          attendance={{ person: "person1", optional: true }}
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
});
