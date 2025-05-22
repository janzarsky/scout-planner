/// <reference types="cypress"/>

import React from "react";
import { Notifications } from "../../src/components/Notifications";
import { getStore } from "../../src/store";
import { addError } from "../../src/store/errorsSlice";

describe("Notifications", () => {
  let store;

  beforeEach(() => {
    store = getStore();
  });

  it("should be hidden when there are none", () => {
    cy.mount(<Notifications />, { reduxStore: store });
    cy.get(".notifications").should("not.exist");
  });

  it("should show single message", () => {
    store.dispatch(addError("Test error message"));
    cy.mount(<Notifications />, { reduxStore: store });
    cy.contains("Test error message");
  });

  it("should remove notification after closing", () => {
    store.dispatch(addError("Test error message"));
    cy.wrap(store).invoke("getState").its("errors").should("have.length", 1);

    cy.mount(<Notifications />, { reduxStore: store });

    cy.contains("Test error message");
    cy.get(".btn-close").click();

    cy.contains("Test error message").should("not.exist");
    cy.wrap(store).invoke("getState").its("errors").should("have.length", 0);
  });

  it("should show multiple messages", () => {
    store.dispatch(addError("First error message"));
    store.dispatch(addError("Second error message"));
    cy.wrap(store).invoke("getState").its("errors").should("have.length", 2);

    cy.mount(<Notifications />, { reduxStore: store });

    cy.contains("First error message");
    cy.contains("Second error message").should("not.exist");

    cy.get(".btn-close").click();

    cy.wrap(store).invoke("getState").its("errors").should("have.length", 1);
    cy.contains("First error message").should("not.exist");
    cy.contains("Second error message");

    cy.get(".btn-close").click();

    cy.wrap(store).invoke("getState").its("errors").should("have.length", 0);
  });
});
