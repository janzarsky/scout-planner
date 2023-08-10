/// <reference types="cypress"/>

import { testing } from "../../src/components/EditProgramModal";
import { getStore } from "../../src/store";
import { overrideConfig } from "../../src/store/configSlice";

describe("PersonCheck", () => {
  let store;

  beforeEach(() => {
    store = getStore();
  });

  describe("as checkbox", () => {
    beforeEach(() => {
      store.dispatch(overrideConfig({ optionalAttendance: false }));
    });

    it("sets attendance", () => {
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

  describe("as button", () => {
    beforeEach(() => {
      store.dispatch(overrideConfig({ optionalAttendance: true }));
    });

    it("sets attendance", () => {
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

    it("sets optional attendance", () => {
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
      cy.get("@set").should("have.been.calledOnceWith", "person1", {
        optional: true,
      });
    });

    it("removes attendance", () => {
      cy.mount(
        <testing.PersonCheck
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
