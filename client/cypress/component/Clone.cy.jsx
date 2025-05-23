/// <reference types="cypress"/>

import React from "react";
import Clone from "../../src/components/Clone";

describe("Clone", () => {
  it("is able to mount", () => {
    cy.mount(<Clone />, { auth: true });
    cy.contains("Vytvořit kopii");
  });

  it("is unavailable without sign-in", () => {
    cy.mount(<Clone />, { auth: true });
    cy.get("button").should("be.disabled");
    cy.contains("Pro kopírování se prosím přihlaste");
  });

  it("is available with sign-in", () => {
    cy.mount(<Clone />, { auth: true, authValue: { user: "test@user.com" } });
    cy.get("button").should("not.be.disabled");
    cy.contains("Pro kopírování se prosím přihlaste").should("not.exist");
  });
});
