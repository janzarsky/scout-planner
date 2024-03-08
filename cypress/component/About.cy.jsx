/// <reference types="cypress"/>

import React from "react";
import About from "../../src/components/About";

describe("About", () => {
  it("shows basic info", () => {
    cy.mount(<About />);
    cy.contains("Harmáč.cz");
    cy.contains("Jan Žárský");
  });
});
