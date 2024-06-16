import React from "react";
import { Navbar } from "react-bootstrap";
import {
  PeopleFilter,
  PeopleFilterToggle,
} from "../../src/components/PeopleFilter";
import { getStore } from "../../src/store";
import {
  toggleActivePerson,
  togglePeopleEnabled,
} from "../../src/store/viewSlice";
import { firestoreClientFactory } from "../../src/FirestoreClient";
import { setTable } from "../../src/store/authSlice";

describe("People filter toggle", () => {
  let store;

  beforeEach(() => {
    store = getStore();
  });

  function mountToggle() {
    cy.mount(
      <Navbar className="control-panel">
        <PeopleFilterToggle />
      </Navbar>,
      { reduxStore: store },
    );
  }

  it("toggles people highlighting", () => {
    cy.stub(store, "dispatch").as("dispatch");
    mountToggle();
    cy.get("a").click();

    cy.get("@dispatch").should(
      "have.been.calledOnceWith",
      togglePeopleEnabled(),
    );
  });

  it("is highlighted when highlighting is on", () => {
    store.dispatch(togglePeopleEnabled());
    mountToggle();

    cy.get("a").should("have.class", "dark");
  });
});

describe("People filter", () => {
  let store;

  beforeEach(() => {
    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        getPeople: cy
          .stub()
          .resolves([
            { _id: "person1", name: "Person 1" },
            { _id: "person2", name: "Person 2" },
          ])
          .as("getPeople"),
      })
      .log(false);

    store = getStore();
    store.dispatch(setTable("table1"));
  });

  function mountFilter() {
    cy.mount(<PeopleFilter />, { reduxStore: store });
  }

  it("is hidden when people filtering is disabled", () => {
    mountFilter();
    cy.get("button").should("not.exist");
  });

  it("is shown when people filtering is enabled", () => {
    store.dispatch(togglePeopleEnabled());
    mountFilter();

    cy.contains("Person 1");
    cy.contains("Person 2");
  });

  it("toggles people", () => {
    store.dispatch(togglePeopleEnabled());
    mountFilter();
    cy.spy(store, "dispatch").as("dispatch");

    cy.contains("Person 1").click();
    cy.get("@dispatch").should(
      "have.been.calledWith",
      toggleActivePerson("person1"),
    );
  });

  it("reflects active people", () => {
    store.dispatch(togglePeopleEnabled());
    store.dispatch(toggleActivePerson("person1"));
    mountFilter();

    cy.contains("Person 1").should("have.class", "btn-dark");
  });
});
