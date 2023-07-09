/// <reference types="cypress"/>

import { firestoreClientFactory } from "../../src/FirestoreClient";
import Packages from "../../src/components/Packages";
import { getStore } from "../../src/store";

describe("Packages", () => {
  let store;

  beforeEach(() => {
    store = getStore();

    cy.stub(firestoreClientFactory, "getClient").log(false);
  });

  it("empty", () => {
    cy.mount(<Packages />, { reduxStore: store });

    cy.get("[value='Nový balíček']");
    cy.get("[data-test=pkgs-new-color]");
    cy.contains("Přidat");
  });

  it("select color from list", () => {
    cy.mount(<Packages />, { reduxStore: store });

    cy.get("[data-test='pkgs-new-color']").should(
      "have.css",
      "background-color",
      "rgb(129, 212, 250)"
    );
    cy.get("[data-test=pkgs-new-color]").select("#f48fb1");
    cy.get("[data-test=pkgs-new-color]").should(
      "have.css",
      "background-color",
      "rgb(244, 143, 177)"
    );
  });
});
