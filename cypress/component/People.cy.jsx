/// <reference types="cypress"/>

import React from "react";
import { firestoreClientFactory } from "../../src/FirestoreClient";
import People from "../../src/components/People";
import { getStore } from "../../src/store";
import { setTable } from "../../src/store/authSlice";

describe("People", () => {
  let store;

  function stubClient(peopleBefore, peopleAfter) {
    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        getPeople: cy
          .stub()
          .onFirstCall()
          .resolves(peopleBefore)
          .onSecondCall()
          .resolves(peopleAfter)
          .as("getPeople"),
        addPerson: cy
          .spy(async (person) => ({ _id: "newperson", ...person }))
          .as("addPerson"),
        deletePerson: cy.spy(async () => {}).as("deletePerson"),
        updatePerson: cy.spy(async (person) => person).as("updatePerson"),
      })
      .log(false);
  }

  beforeEach(() => {
    store = getStore();
    store.dispatch(setTable("table1"));
  });

  it("empty", () => {
    stubClient([]);
    cy.mount(<People />, { reduxStore: store, command: true });
    cy.contains("Organizátor");
    cy.get("[data-test='people-new-name']");
    cy.get("[data-test='people-new-add']").click();
  });

  it("list of people", () => {
    stubClient([
      { _id: "person1", name: "Person 1" },
      { _id: "person2", name: "Person 2" },
    ]);
    cy.mount(<People />, { reduxStore: store, command: true });

    cy.contains("Organizátor");
    cy.contains("Person 1");
    cy.contains("Person 2");
  });

  it("add person", () => {
    stubClient(
      [],
      [
        {
          _id: "newperson",
          name: "Person 1",
        },
      ],
    );
    cy.mount(<People />, { reduxStore: store, command: true });
    cy.get("[data-test='people-new-name']").clear();
    cy.get("[data-test='people-new-name']").type("Person 1");
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
    stubClient([{ _id: "person1", name: "Person 1" }], []);
    cy.mount(<People />, { reduxStore: store, command: true });

    cy.contains("Smazat").click();

    cy.get("@deletePerson").should("be.calledOnceWith", "person1");

    cy.wrap(store).invoke("getState").its("people.people").should("be.empty");

    cy.contains("Person 1").should("not.exist");
  });

  it("edit person", () => {
    stubClient(
      [{ _id: "person1", name: "Person 1" }],
      [{ _id: "person1", name: "Person 2" }],
    );
    cy.mount(<People />, { reduxStore: store, command: true });

    cy.contains("Upravit").click();
    cy.get("[data-test='people-edit-name']").clear();
    cy.get("[data-test='people-edit-name']").type("Person 2");
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
