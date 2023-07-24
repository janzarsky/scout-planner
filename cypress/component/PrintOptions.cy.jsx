/// <reference types="cypress"/>

import PrintOptions from "../../src/components/PrintOptions";

describe("Print options", () => {
  it("default", () => {
    cy.mount(<PrintOptions />);
    cy.contains("Tisk");
  });
});
