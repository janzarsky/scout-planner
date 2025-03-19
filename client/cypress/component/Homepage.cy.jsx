/// <reference types="cypress"/>

import React from "react";
import Homepage from "../../src/components/Homepage";

describe("Homepage", () => {
  it("contains app name", () => {
    cy.mount(<Homepage />, { router: true });
    cy.contains("Skautský plánovač");
  });

  it("allows creating a new timetable", () => {
    cy.mount(<Homepage />, { router: true });
    cy.contains("Nový harmonogram").click();
    // TODO: add proper tests using router
  });

  it("opens timetable", () => {
    cy.mount(<Homepage />, { router: true });
    cy.get("input").type("asdf");
    cy.contains("Otevřít").click();
    // TODO: add proper tests using router
  });
});
