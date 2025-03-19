/// <reference types="cypress"/>

import React from "react";
import { firestoreClientFactory } from "../../src/FirestoreClient";
import { getStore } from "../../src/store";
import { Tray } from "../../src/components/Tray";
import {
  parseDate,
  parseDateTime,
  parseDuration,
  parseTime,
} from "../../src/helpers/DateUtils";

describe("Tray", () => {
  let store;

  const prog = {
    _id: "testprogramid",
    title: "Test program",
    people: [],
    duration: parseDuration("1:30"),
    begin: null,
    groups: [],
  };

  const settings = {
    days: [
      parseDate("11.06.2022"),
      parseDate("12.06.2022"),
      parseDate("13.06.2022"),
    ],
    dayStart: parseTime("10:00"),
    dayEnd: parseTime("16:00"),
    groupCnt: 1,
    groups: [],
    timeSpan: 4,
    timeStep: parseDuration("0:15"),
    timeHeaders: [
      parseTime("10:00"),
      parseTime("11:00"),
      parseTime("12:00"),
      parseTime("13:00"),
      parseTime("14:00"),
      parseTime("15:00"),
    ],
  };

  function stubClient(programs) {
    cy.stub(firestoreClientFactory, "getClient")
      .returns({
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
        getPackages: cy.stub().resolves([]).as("getPackages"),
        streamPackages: cy
          .stub()
          .resolves(() => {})
          .as("streamPackages"),
      })
      .log(false);
  }

  beforeEach(() => {
    store = getStore();
  });

  it("should show header without programs", () => {
    stubClient([]);
    cy.mount(<Tray settings={settings} />, {
      dndProvider: true,
      reduxStore: store,
      router: true,
    });
    cy.get(".tray-header").should("exist");
  });

  it("should not show a program with set beginning", () => {
    stubClient([{ ...prog, begin: parseDateTime("12:00 12.06.2022") }]);
    cy.mount(<Tray settings={settings} />, {
      dndProvider: true,
      reduxStore: store,
      router: true,
    });
    cy.contains("Test program").should("not.exist");
  });

  it("should show a program without begin", () => {
    stubClient([prog]);
    cy.mount(<Tray settings={settings} />, {
      dndProvider: true,
      reduxStore: store,
      router: true,
    });
    cy.contains("Test program").should("exist");
  });

  it("should show multiple programs", () => {
    stubClient(generatePrograms(3));
    cy.mount(<Tray settings={settings} />, {
      dndProvider: true,
      reduxStore: store,
      router: true,
    });
    cy.contains("Test program 0").should("exist");
    cy.contains("Test program 1").should("exist");
    cy.contains("Test program 2").should("exist");
  });

  it("should put programs on new line", () => {
    stubClient(generatePrograms(7));
    cy.mount(<Tray settings={settings} />, {
      dndProvider: true,
      reduxStore: store,
      router: true,
    });
    cy.contains("Test program 6").then((el) =>
      expect(el[0].getBoundingClientRect().top).to.be.greaterThan(20),
    );
  });

  function generatePrograms(count) {
    return Array.from({ length: count }, (_, i) => i).map((num) => ({
      ...prog,
      _id: "prog" + num,
      title: "Test program " + num,
    }));
  }
});
