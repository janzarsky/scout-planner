/// <reference types="cypress"/>

import React from "react";
import { TimetableTitle } from "../../src/components/TimetableTitle";
import { getStore } from "../../src/store";
import { updateTitle } from "../../src/store/timetableSlice";
import { firestoreClientFactory } from "../../src/FirestoreClient";

describe("Timetable title", () => {
  let store;

  function mountTimetableTitle() {
    cy.mount(<TimetableTitle />, { reduxStore: store, command: true });
  }

  beforeEach(() => {
    store = getStore();

    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        updateTimetable: cy
          .spy(async (timetable) => timetable)
          .as("updateTimetable"),
      })
      .log(false);
  });

  it("shows empty title", () => {
    mountTimetableTitle();

    cy.contains("Název harmonogramu");
    cy.contains("(bez názvu)");
  });

  it("shows existing title", () => {
    store.dispatch(updateTitle("Test timetable"));
    mountTimetableTitle();

    cy.contains("Test timetable");
  });

  it("sets new title", () => {
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
    store.dispatch(updateTitle("Test timetable"));
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
    store.dispatch(updateTitle("Test timetable"));
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
