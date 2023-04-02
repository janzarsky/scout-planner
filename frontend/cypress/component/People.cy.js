/// <reference types="cypress"/>

import People from "../../src/components/People";
import { getStore } from "../../src/store";
import { addPerson } from "../../src/store/peopleSlice";

describe("People", () => {
  let store;

  beforeEach(() => {
    store = getStore();
  });

  it("empty", () => {
    cy.mount(<People />, { reduxStore: store });
    cy.contains("Organizátor");
  });

  it("list of people", () => {
    store.dispatch(addPerson({ _id: "person1", name: "Person 1" }));
    store.dispatch(addPerson({ _id: "person2", name: "Person 2" }));

    cy.mount(<People />, { reduxStore: store });

    cy.contains("Organizátor");
    cy.contains("Person 1");
    cy.contains("Person 2");
  });
});
