/// <reference types="cypress"/>

import React from "react";
import Timetable from "../../src/components/Timetable";
import { getStore } from "../../src/store";
import { parseDuration } from "../../src/helpers/DateUtils";
import { firestoreClientFactory } from "../../src/FirestoreClient";
import { setTable } from "../../src/store/authSlice";
import { overrideConfig } from "../../src/store/configSlice";

describe("Timetable", () => {
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

  function stubClient(programs) {
    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        getGroups: cy
          .stub()
          .resolves([
            {
              _id: "group1",
              name: "G1",
              order: 0,
            },
            {
              _id: "group2",
              name: "G2",
              order: 1,
            },
          ])
          .as("getGroups"),
        streamGroups: cy
          .stub()
          .resolves(() => {})
          .as("streamGroups"),
        getPackages: cy.stub().resolves([]).as("getPackages"),
        streamPackages: cy
          .stub()
          .resolves(() => {})
          .as("streamPackages"),
        getTimetable: cy.stub().resolves({}).as("getTimetable"),
        streamTimetable: cy
          .stub()
          .resolves(() => {})
          .as("streamTimetable"),
        getPrograms: cy.stub().resolves(programs).as("getPrograms"),
        streamPrograms: cy
          .stub()
          .resolves(() => {})
          .as("streamPrograms"),
      })
      .log(false);
  }

  beforeEach(() => {
    store = getStore();
    store.dispatch(setTable("table1"));
    store.dispatch(overrideConfig({ rtkQueryPrograms: true }));
  });

  it("empty", () => {
    stubClient([]);
    mountTimetable();

    cy.contains("Ne");
    cy.contains("Po");
    cy.contains("Út");
    ["10", "11", "12", "13", "14", "15"].forEach((hour) => cy.contains(hour));
  });

  it("with program", () => {
    stubClient([
      {
        _id: "testprogramid",
        title: "Test program",
        duration: parseDuration("2:00"),
        begin: now - parseDuration("3:00"),
        groups: [],
        people: [],
      },
    ]);
    mountTimetable();

    cy.get(".block")
      .first()
      .should("have.css", "grid-area", "2 / 3 / span 2 / span 8")
      .within(() => {
        cy.get(".program-wrapper").should(
          "have.css",
          "grid-area",
          "1 / 1 / span 1 / span 8",
        );
      });
  });

  it("with programs and groups", () => {
    stubClient([
      {
        _id: "testprogramid",
        title: "Test program",
        duration: 16200000,
        begin: now - parseDuration("3:00"),
        groups: ["group2"],
        people: [],
      },
    ]);
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
    stubClient([]);
    mountTimetable(false);
    cy.get(".tray");
  });

  it("tray is hidden when printing", () => {
    stubClient([]);
    mountTimetable(true);
    cy.get(".tray").should("not.exist");
  });
});
