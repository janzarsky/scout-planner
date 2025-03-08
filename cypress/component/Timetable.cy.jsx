/// <reference types="cypress"/>

import React from "react";
import Timetable from "../../src/components/Timetable";
import { getStore } from "../../src/store";
import { parseDuration } from "../../src/helpers/DateUtils";
import { firestoreClientFactory } from "../../src/FirestoreClient";
import { setTable } from "../../src/store/authSlice";

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

  it("empty days are shown when not printing", () => {
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
    mountTimetable(false);
    cy.contains("Ne");
    cy.contains("Po");
    cy.contains("Út");
  });

  it("empty days are hidden when printing", () => {
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
    mountTimetable(true);
    cy.contains("Ne");
    cy.contains("Po").should("not.exist");
    cy.contains("Út").should("not.exist");
  });

  describe("date header", () => {
    beforeEach(() => {
      cy.viewport(100, 500);
    });

    it("is shown on the left", () => {
      stubClient([]);
      mountTimetable();
      cy.get(".dateheader").then((el) =>
        expect(el[0].getBoundingClientRect().left).to.equal(0),
      );
    });

    it("is shown on the left after scrolling", () => {
      stubClient([]);
      mountTimetable();
      cy.get(".timetable").scrollTo(100, 0);
      // needed to ensure that scrolling has finished
      cy.get(".timetable").invoke("scrollLeft").should("equal", 100);

      cy.get(".timeheader").then((el) =>
        expect(el[0].getBoundingClientRect().top).to.equal(0),
      );
    });
  });

  describe("time header", () => {
    beforeEach(() => {
      cy.viewport(500, 100);
    });

    it("is shown at the top", () => {
      stubClient([]);
      mountTimetable();
      cy.get(".timeheader").then((el) =>
        expect(el[0].getBoundingClientRect().top).to.equal(0),
      );
    });

    it("is shown at the top after scrolling", () => {
      stubClient([]);
      mountTimetable();
      cy.scrollTo(0, 100);
      // needed to ensure that scrolling has finished
      cy.window().its("scrollY").should("equal", 100);

      cy.get(".timeheader").then((el) =>
        expect(el[0].getBoundingClientRect().top).to.equal(0),
      );
    });
  });
});
