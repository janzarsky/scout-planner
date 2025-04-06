/// <reference types="cypress"/>

import React from "react";
import Timetable from "../../src/components/Timetable";
import { getStore } from "../../src/store";
import { parseDuration } from "../../src/helpers/DateUtils";
import { firestoreClientFactory } from "../../src/FirestoreClient";
import { setTable, testing } from "../../src/store/authSlice";
import { level } from "../../src/helpers/Level";

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

  function stubClient(programs, programsSecond, timetable = {}) {
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
            {
              _id: "group3",
              name: "G3",
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
        getTimetable: cy.stub().resolves(timetable).as("getTimetable"),
        streamTimetable: cy
          .stub()
          .resolves(() => {})
          .as("streamTimetable"),
        getPrograms: cy
          .stub()
          .onFirstCall()
          .resolves(programs)
          .onSecondCall()
          .resolves(programsSecond)
          .as("getPrograms"),
        streamPrograms: cy
          .stub()
          .resolves(() => {})
          .as("streamPrograms"),
        updateProgram: cy.spy(async (program) => program).as("updateProgram"),
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
      .should("have.css", "grid-area", "2 / 3 / span 3 / span 8")
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

  describe("drag and drop", () => {
    beforeEach(() => {
      store.dispatch(testing.setUserLevel(level.EDIT));
    });

    it("programs can be dragged to new time", () => {
      const prog = {
        _id: "testprogramid",
        title: "Test program",
        duration: parseDuration("2:00"),
        begin: now - parseDuration("3:00"),
        groups: ["group1"],
        people: [],
        blockOrder: 0,
      };
      const updatedProg = {
        ...prog,
        begin: prog.begin + parseDuration("2:00"),
      };
      stubClient([prog], [updatedProg]);
      mountTimetable();

      cy.contains("Test program").drag(
        "[style='grid-column-start: 11; grid-row-start: 2;']",
        { force: true },
      );

      cy.get("@updateProgram").should("have.been.calledOnceWith", updatedProg);
    });

    it("programs can be dragged to new group", () => {
      const prog = {
        _id: "testprogramid",
        title: "Test program",
        duration: parseDuration("2:00"),
        begin: now - parseDuration("3:00"),
        groups: ["group1"],
        people: [],
        blockOrder: 0,
      };
      const updatedProg = {
        ...prog,
        groups: ["group2"],
      };
      stubClient([prog], [updatedProg]);
      mountTimetable();

      cy.contains("Test program").drag(
        "[style='grid-column-start: 3; grid-row-start: 3;']",
        { force: true },
      );

      cy.get("@updateProgram").should("have.been.calledOnceWith", updatedProg);
    });

    it("single-group programs can be dragged to the same group with group lock", () => {
      const prog = {
        _id: "testprogramid",
        title: "Test program",
        duration: parseDuration("2:00"),
        begin: now - parseDuration("3:00"),
        groups: ["group1"],
        people: [],
        blockOrder: 0,
      };
      stubClient([prog], [prog], { settings: { groupLock: true } });
      mountTimetable();

      cy.contains("Test program").drag(
        "[style='grid-column-start: 3; grid-row-start: 2;']",
        { force: true },
      );

      cy.get("@updateProgram").should("have.been.calledOnceWith", prog);
    });

    it("single-group programs cannot be dragged to a different group with group lock", () => {
      const prog = {
        _id: "testprogramid",
        title: "Test program",
        duration: parseDuration("2:00"),
        begin: now - parseDuration("3:00"),
        groups: ["group1"],
        people: [],
        blockOrder: 0,
      };
      const updatedProg = {
        ...prog,
        groups: ["group2"],
      };
      stubClient([prog], [updatedProg], { settings: { groupLock: true } });
      mountTimetable();

      cy.contains("Test program").drag(
        "[style='grid-column-start: 3; grid-row-start: 3;']",
        { force: true },
      );

      cy.get("@updateProgram").should("have.not.been.called");
    });

    it("dragging multi-group program to an existing group preserves groups", () => {
      const prog = {
        _id: "testprogramid",
        title: "Test program",
        duration: parseDuration("2:00"),
        begin: now - parseDuration("3:00"),
        groups: ["group1", "group2"],
        people: [],
        blockOrder: 0,
      };
      stubClient([prog], [prog]);
      mountTimetable();

      cy.contains("Test program").drag(
        "[style='grid-column-start: 3; grid-row-start: 3;']",
        { force: true },
      );

      cy.get("@updateProgram").should("have.been.calledOnceWith", prog);
    });

    it("multi-group programs can be dragged to the same group with group lock", () => {
      const prog = {
        _id: "testprogramid",
        title: "Test program",
        duration: parseDuration("2:00"),
        begin: now - parseDuration("3:00"),
        groups: ["group1", "group2"],
        people: [],
        blockOrder: 0,
      };
      stubClient([prog], [prog], { settings: { groupLock: true } });
      mountTimetable();

      cy.contains("Test program").drag(
        "[style='grid-column-start: 3; grid-row-start: 3;']",
        { force: true },
      );

      cy.get("@updateProgram").should("have.been.calledOnceWith", prog);
    });

    it("dragging multi-group program to a new group discards existing groups", () => {
      const prog = {
        _id: "testprogramid",
        title: "Test program",
        duration: parseDuration("2:00"),
        begin: now - parseDuration("3:00"),
        groups: ["group1", "group2"],
        people: [],
        blockOrder: 0,
      };
      const updatedProg = {
        ...prog,
        groups: ["group3"],
      };
      stubClient([prog], [updatedProg]);
      mountTimetable();

      cy.contains("Test program").drag(
        "[style='grid-column-start: 3; grid-row-start: 4;']",
        { force: true },
      );

      cy.get("@updateProgram").should("have.been.calledOnceWith", updatedProg);
    });

    it("multi-group programs cannot be dragged to a new group with group lock", () => {
      const prog = {
        _id: "testprogramid",
        title: "Test program",
        duration: parseDuration("2:00"),
        begin: now - parseDuration("3:00"),
        groups: ["group1", "group2"],
        people: [],
        blockOrder: 0,
      };
      stubClient([prog], [prog], { settings: { groupLock: true } });
      mountTimetable();

      cy.contains("Test program").drag(
        "[style='grid-column-start: 3; grid-row-start: 4;']",
        { force: true },
      );

      cy.get("@updateProgram").should("have.not.been.called");
    });

    it("programs can be dragged to new day", () => {
      const prog = {
        _id: "testprogramid",
        title: "Test program",
        duration: parseDuration("2:00"),
        begin: now - parseDuration("3:00"),
        groups: ["group1"],
        people: [],
        blockOrder: 0,
      };
      const updatedProg = {
        ...prog,
        begin: prog.begin + parseDuration("24:00"),
      };
      stubClient([prog], [updatedProg]);
      mountTimetable();

      cy.contains("Test program").drag(
        "[style='grid-column-start: 3; grid-row-start: 5;']",
        { force: true },
      );

      cy.get("@updateProgram").should("have.been.calledOnceWith", updatedProg);
    });

    it("dragging programs will reset their block order", () => {
      const prog = {
        _id: "testprogramid",
        title: "Test program",
        duration: parseDuration("2:00"),
        begin: now - parseDuration("3:00"),
        groups: ["group1"],
        people: [],
        blockOrder: 3,
      };
      const updatedProg = {
        ...prog,
        begin: prog.begin + parseDuration("2:00"),
        blockOrder: 0,
      };
      stubClient([prog], [updatedProg]);
      mountTimetable();

      cy.contains("Test program").drag(
        "[style='grid-column-start: 11; grid-row-start: 2;']",
        { force: true },
      );

      cy.get("@updateProgram").should("have.been.calledOnceWith", updatedProg);
    });

    // TODO: this test is not working with the drag and drop library
    if (import.meta.env.VITE_REACT_APP_DROP_INTO_BLOCK != "true")
      it("programs can be swapped", () => {
        const prog1 = {
          _id: "prog1",
          title: "Test program 1",
          duration: parseDuration("2:00"),
          begin: now - parseDuration("3:00"),
          groups: ["group1"],
          people: [],
        };
        const prog2 = {
          _id: "prog2",
          title: "Test program 2",
          duration: parseDuration("2:00"),
          begin: now - parseDuration("1:00"),
          groups: ["group2"],
          people: [],
        };
        const updatedProg1 = {
          ...prog1,
          begin: prog2.begin,
          groups: [...prog2.groups],
        };
        const updatedProg2 = {
          ...prog2,
          begin: prog1.begin,
          groups: [...prog1.groups],
        };
        stubClient([prog1, prog2], [updatedProg1, updatedProg2]);
        mountTimetable();

        cy.get(".program:first").drag(".program:last", { force: true });

        cy.get("@updateProgram").should("have.been.calledTwice");
        cy.get("@updateProgram").should("have.been.calledWith", updatedProg1);
        cy.get("@updateProgram").should("have.been.calledWith", updatedProg2);
      });
  });
});
