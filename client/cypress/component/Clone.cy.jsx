/// <reference types="cypress"/>

import React from "react";
import Clone from "../../src/components/Clone";
import { getStore } from "../../src/store";
import { setTable } from "../../src/store/authSlice";

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

  it("validates destination ID length", () => {
    cy.mount(<Clone />, { auth: true, authValue: { user: "test@user.com" } });

    cy.get("input").type("a");

    cy.get("button").should("be.disabled");
    cy.get("input").should("have.class", "is-invalid");
    cy.contains("tři znaky");
  });

  it("validates destination ID characters", () => {
    cy.mount(<Clone />, { auth: true, authValue: { user: "test@user.com" } });

    cy.get("input").type("abc%^&");

    cy.get("button").should("be.disabled");
    cy.get("input").should("have.class", "is-invalid");
    cy.contains("speciální znaky");
  });

  it("validates destination is different than source", () => {
    const store = getStore();
    store.dispatch(setTable("source"));
    cy.mount(<Clone />, {
      auth: true,
      authValue: { user: "test@user.com" },
      reduxStore: store,
    });

    cy.get("input").type("source");

    cy.get("button").should("be.disabled");
    cy.get("input").should("have.class", "is-invalid");
    cy.contains("nesmí být stejné");
  });

  it("if empty, the destination ID is not highlighted as valid", () => {
    cy.mount(<Clone />, { auth: true, authValue: { user: "test@user.com" } });
    cy.get("input").should("not.have.class", "is-invalid");
  });
});
