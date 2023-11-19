/// <reference types="cypress"/>

import React from "react";
import { PersonCheck } from "../../src/components/EditProgramModal";
import { ProgramBeginning } from "../../src/components/EditProgramModal";
import { getStore } from "../../src/store";
import { overrideConfig } from "../../src/store/configSlice";

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

describe("Program beginning", () => {
  let store;

  beforeEach(() => {
    store = getStore();
    store.dispatch(overrideConfig({ datepicker: true }));
  });

  function mountBeginning(disabled = false, tray = false) {
    cy.mount(
      <ProgramBeginning
        time={tray ? "(odkladiště)" : "11:30"}
        setTime={cy.stub().as("setTime")}
        date={tray ? "(odkladiště)" : "11.6.2022"}
        setDate={cy.stub().as("setDate")}
        disabled={disabled}
      />,
      { reduxStore: store },
    );
  }

  it("shows current time and date", () => {
    mountBeginning();

    cy.get("input[value='11:30']");
    cy.get("input[value='11.6.2022']");
  });

  it("updates the date using date picker", () => {
    mountBeginning();

    cy.get("input[value='11.6.2022']").click();

    cy.contains("červen 2022");
    cy.get(".react-datepicker__day").contains("12").click();

    cy.get("@setDate").should("have.been.calledOnceWith", "12.6.2022");
    cy.contains("červen 2022").should("not.exist");
  });

  it("shows disabled input fields when set as disabled", () => {
    mountBeginning(true);

    cy.get("input[value='11:30']").should("have.attr", "disabled");
    cy.get("input[value='11.6.2022']").should("have.attr", "disabled");
  });

  it("works even when in tray", () => {
    mountBeginning(false, true);
    cy.get("input[value='(odkladiště)']");
  });
});
