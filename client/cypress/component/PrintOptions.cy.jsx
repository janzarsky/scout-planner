/// <reference types="cypress"/>

import React from "react";
import { PrintOptions } from "../../src/components/PrintOptions";

describe("Print options", () => {
  it("prints A4 version", () => {
    const callback = cy.stub().as("callback");

    cy.mount(<PrintOptions printCallback={callback} />);

    cy.contains("Tisk");
    cy.contains("A4").click();

    cy.get("@callback").should("have.been.calledOnceWith", "a4");
  });
});
