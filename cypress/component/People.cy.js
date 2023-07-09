/// <reference types="cypress"/>

import { clientFactory } from "../../src/Client";
import People from "../../src/components/People";
import { getStore } from "../../src/store";
import { setTable } from "../../src/store/authSlice";
import { addPerson } from "../../src/store/peopleSlice";

describe("People", () => {
  let store;

  beforeEach(() => {
    store = getStore();
    store.dispatch(setTable("table1"));

    cy.stub(clientFactory, "getClient")
      .returns({
        addPerson: cy
          .spy(async (person) => ({ _id: "newperson", ...person }))
          .as("addPerson"),
        deletePerson: cy.spy(async (id) => {}).as("deletePerson"),
        updatePerson: cy.spy(async (person) => person).as("updatePerson"),
      })
      .log(false);
  });

  it("empty", () => {
    cy.mount(<People />, { reduxStore: store });
    cy.contains("Organizátor");
    cy.get("[data-test='people-new-name']");
    cy.get("[data-test='people-new-add']").click();
  });

  it("list of people", () => {
    store.dispatch(addPerson({ _id: "person1", name: "Person 1" }));
    store.dispatch(addPerson({ _id: "person2", name: "Person 2" }));

    cy.mount(<People />, { reduxStore: store });

    cy.contains("Organizátor");
    cy.contains("Person 1");
    cy.contains("Person 2");
  });

  it("add person", () => {
    cy.mount(<People />, { reduxStore: store });
    cy.get("[data-test='people-new-name']").clear().type("Person 1");
    cy.get("[data-test='people-new-add']").click();

    cy.get("@addPerson").should("be.calledOnceWith", { name: "Person 1" });

    cy.wrap(store)
      .invoke("getState")
      .its("people.people")
      .should("deep.include", {
        _id: "newperson",
        name: "Person 1",
      });

    cy.contains("Person 1");
  });

  it("remove person", () => {
    store.dispatch(addPerson({ _id: "person1", name: "Person 1" }));
    cy.mount(<People />, { reduxStore: store });

    cy.contains("Smazat").click();

    cy.get("@deletePerson").should("be.calledOnceWith", "person1");

    cy.wrap(store).invoke("getState").its("people.people").should("be.empty");

    cy.contains("Person 1").should("not.exist");
  });

  it("edit person", () => {
    store.dispatch(addPerson({ _id: "person1", name: "Person 1" }));
    cy.mount(<People />, { reduxStore: store });

    cy.contains("Upravit").click();
    cy.get("[data-test='people-edit-name']").clear().type("Person 2");
    cy.get("[data-test='people-edit-save']").click();

    cy.get("@updatePerson").should("be.calledOnceWith");

    cy.wrap(store)
      .invoke("getState")
      .its("people.people")
      .should("deep.include", {
        _id: "person1",
        name: "Person 2",
        absence: [],
      });

    cy.contains("Person 2");
    cy.contains("Upravit");
  });
});
