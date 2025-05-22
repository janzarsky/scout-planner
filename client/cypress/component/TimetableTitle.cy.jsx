/// <reference types="cypress"/>

import React from "react";
import { TimetableTitle } from "../../src/components/TimetableTitle";
import { getStore } from "../../src/store";
import { firestoreClientFactory } from "../../src/FirestoreClient";
import { setTable } from "../../src/store/authSlice";

describe("Timetable title", () => {
  let store;

  function mountTimetableTitle() {
    cy.mount(<TimetableTitle />, { reduxStore: store });
  }

  function stubClient(title, secondTitle) {
    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        updateTimetable: cy
          .spy(async (timetable) => timetable)
          .as("updateTimetable"),
        getTimetable: cy
          .stub()
          .onFirstCall()
          .resolves({ title })
          .onSecondCall()
          .resolves({ title: secondTitle })
          .as("getTimetable"),
        streamTimetable: cy
          .stub()
          .resolves(() => {})
          .as("streamTimetable"),
      })
      .log(false);
  }

  beforeEach(() => {
    store = getStore();
    store.dispatch(setTable("table1"));
  });

  it("shows empty title", () => {
    stubClient(null);
    mountTimetableTitle();

    cy.contains("Název harmonogramu");
    cy.contains("(bez názvu)");
  });

  it("shows existing title", () => {
    stubClient("Test timetable");
    mountTimetableTitle();

    cy.contains("Test timetable");
  });

  it("sets new title", () => {
    stubClient(null, "New title");
    mountTimetableTitle();
    cy.get("button").click();
    cy.get("input").type("New title");
    cy.get("button").click();

    cy.contains("New title");
    cy.get("@updateTimetable").should("have.been.calledOnceWith", {
      title: "New title",
    });
  });

  it("updates existing title", () => {
    stubClient("Test timetable", "New title");
    mountTimetableTitle();
    cy.get("button").click();
    cy.get("input").clear();
    cy.get("input").type("New title");
    cy.get("button").click();

    cy.contains("New title");
    cy.get("@updateTimetable").should("have.been.calledOnceWith", {
      title: "New title",
    });
  });

  it("clears existing title", () => {
    stubClient("Test timetable", null);
    mountTimetableTitle();
    cy.get("button").click();
    cy.get("input").clear();
    cy.get("button").click();

    cy.contains("(bez názvu)");
    cy.get("@updateTimetable").should("have.been.calledOnceWith", {
      title: null,
    });
  });
});
