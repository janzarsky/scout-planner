/// <reference types="cypress"/>

import Packages from "../../src/components/Packages";
import { getStore } from "../../src/store";

describe("Packages", () => {
  let store;

  beforeEach(() => {
    store = getStore();
  });

  it("empty", () => {
    cy.mount(<Packages />, { reduxStore: store });

    cy.get("input[value='Nový balíček']");
    cy.get("input[value='#81d4fa']");
    cy.contains("Přidat");
  });
});
