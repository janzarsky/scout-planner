/// <reference types="cypress"/>

import React from "react";
import Shift from "../../src/components/Shift";
import { getStore } from "../../src/store";
import { firestoreClientFactory } from "../../src/FirestoreClient";

describe("Shift", () => {
  it("is able to mount", () => {
    cy.mount(<Shift />, { auth: true });
    cy.contains("Posunout datum");
  });

  it("is unavailable without sign-in", () => {
    cy.mount(<Shift />, { auth: true });
    cy.get("button").should("be.disabled");
    cy.contains("Pro posun data se prosím přihlaste");
  });

  it("is available with sign-in", () => {
    cy.mount(<Shift />, { auth: true, authValue: { user: "test@user.com" } });
    cy.get("button").should("not.be.disabled");
    cy.contains("Pro posun data se prosím přihlaste").should("not.exist");
  });

  it("shows current begin date", () => {
    const store = getStore();
    const programs = [{ _id: "prog1", begin: 1748592000000 }];
    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        getPrograms: cy.stub().resolves(programs).as("getPrograms"),
        streamPrograms: cy
          .stub()
          .resolves(() => {})
          .as("streamPrograms"),
      })
      .log(false);

    cy.mount(<Shift />, {
      auth: true,
      authValue: { user: "test@user.com" },
      reduxStore: store,
    });

    cy.contains("Začátek harmonogramu: 30.5.2025");
  });

  it("pre-fills the current date as new date", () => {
    const store = getStore();
    const programs = [{ _id: "prog1", begin: 1748592000000 }];
    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        getPrograms: cy.stub().resolves(programs).as("getPrograms"),
        streamPrograms: cy
          .stub()
          .resolves(() => {})
          .as("streamPrograms"),
      })
      .log(false);

    cy.mount(<Shift />, {
      auth: true,
      authValue: { user: "test@user.com" },
      reduxStore: store,
    });

    cy.get("input").should("have.value", "30.5.2025");
  });
});
