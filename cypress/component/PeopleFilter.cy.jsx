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
import { addPerson } from "../../src/store/peopleSlice";

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

  const person1 = { _id: "person1", name: "Person 1" };
  const person2 = { _id: "person2", name: "Person 2" };

  beforeEach(() => {
    store = getStore();
    store.dispatch(addPerson(person1));
    store.dispatch(addPerson(person2));
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
    cy.stub(store, "dispatch").as("dispatch");
    mountFilter();

    cy.contains("Person 1").click();
    cy.get("@dispatch").should(
      "have.been.calledOnceWith",
      toggleActivePerson(person1._id),
    );
  });

  it("reflects active people", () => {
    store.dispatch(togglePeopleEnabled());
    store.dispatch(toggleActivePerson(person1._id));
    mountFilter();

    cy.contains("Person 1").should("have.class", "btn-dark");
  });
});
