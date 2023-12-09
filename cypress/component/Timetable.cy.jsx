/// <reference types="cypress"/>

import React from "react";
import Timetable from "../../src/components/Timetable";
import { getStore } from "../../src/store";
import { addProgram } from "../../src/store/programsSlice";
import { parseDuration } from "../../src/helpers/DateUtils";
import { addGroup } from "../../src/store/groupsSlice";
import { addPerson } from "../../src/store/peopleSlice";
import { firestoreClientFactory } from "../../src/FirestoreClient";

describe("Timetable", () => {
  const alice = {
    _id: "testuseralice",
    name: "Alice",
  };
  const bob = {
    _id: "testuserbob",
    name: "Bob",
  };

  const now = Date.parse("Sun Mar 05 11:00:00 2023 UTC");

  let store;

  function mountTimetable(printView) {
    cy.mount(
      <Timetable
        addProgramModal={cy.stub().as("addProgram")}
        onEdit={cy.stub().as("onEdit")}
        timeProvider={() => now}
        violations={new Map()}
        printView={printView}
      />,
      { reduxStore: store, router: true, command: true },
    );
  }

  beforeEach(() => {
    cy.stub(firestoreClientFactory, "getClient").log(false);

    store = getStore();

    store.dispatch(addPerson(alice));
    store.dispatch(addPerson(bob));
  });

  it("empty", () => {
    mountTimetable();

    cy.contains("Ne");
    cy.contains("Po");
    cy.contains("Út");
    ["10", "11", "12", "13", "14", "15"].forEach((hour) => cy.contains(hour));
  });

  it("with program", () => {
    const prog = {
      _id: "testprogramid",
      title: "Test program",
      duration: parseDuration("2:00"),
      begin: now - parseDuration("3:00"),
      groups: [],
      people: [],
    };
    store.dispatch(addProgram(prog));
    mountTimetable();

    cy.get(".block")
      .first()
      .should("have.css", "grid-area", "2 / 3 / span 1 / span 8")
      .within(() => {
        cy.get(".program-wrapper").should(
          "have.css",
          "grid-area",
          "1 / 1 / span 1 / span 8",
        );
      });
  });

  it("with programs and groups", () => {
    const group1 = {
      _id: "group1",
      name: "G1",
      order: 0,
    };
    store.dispatch(addGroup(group1));
    const group2 = {
      _id: "group2",
      name: "G2",
      order: 1,
    };
    store.dispatch(addGroup(group2));

    const prog = {
      _id: "testprogramid",
      title: "Test program",
      duration: 16200000,
      begin: now - parseDuration("3:00"),
      groups: ["group2"],
      people: [],
    };
    store.dispatch(addProgram(prog));

    mountTimetable();

    cy.contains("G1");
    cy.contains("G2");

    cy.get(".block")
      .first()
      .should("have.css", "grid-area", "3 / 3 / span 1 / span 18")
      .within(() => {
        cy.get(".program-wrapper").should(
          "have.css",
          "grid-area",
          "1 / 1 / span 1 / span 18",
        );
      });
  });

  it("tray is shown when not printing", () => {
    mountTimetable(false);
    cy.get(".tray");
  });

  it("tray is hidden when printing", () => {
    mountTimetable(true);
    cy.get(".tray").should("not.exist");
  });
});
