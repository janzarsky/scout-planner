import { Navbar } from "react-bootstrap";
import { PeopleFilterToggle } from "../../src/components/PeopleFilter";
import { getStore } from "../../src/store";
import { togglePeopleEnabled } from "../../src/store/viewSlice";

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
