/// <reference types="cypress"/>

import Program from "../../src/components/Program";
import { level } from "../../src/helpers/Level";
import { getStore } from "../../src/store";
import { testing } from "../../src/store/authSlice";
import { addPackage } from "../../src/store/packagesSlice";
import { addPerson, setLegacyPeople } from "../../src/store/peopleSlice";
import {
  toggleViewPeople,
  toggleViewPkg,
  toggleViewTime,
  toggleViewViolations,
} from "../../src/store/viewSlice";

describe("Program", () => {
  const alice = {
    _id: "testuseralice",
    name: "Alice",
  };
  const bob = {
    _id: "testuserbob",
    name: "Bob",
  };

  const prog = {
    _id: "testprogramid",
    title: "Test program",
    url: "https://some.program.url",
    people: [{ person: alice._id }, { person: bob._id }, "Cecil"],
    notes: "Test program notes",
    locked: false,
    duration: 16200000,
    begin: 1660636800000,
    groups: [],
    ranges: {},
  };

  const rect = {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  };

  let store;

  function mountProgram(program, violations) {
    cy.mount(
      <Program
        program={program}
        rect={rect}
        violations={violations}
        onEdit={cy.stub().as("edit")}
        clone={cy.stub().as("clone")}
      />,
      { dndProvider: true, reduxStore: store }
    );
  }

  beforeEach(() => {
    cy.viewport(400, 150);

    store = getStore();

    // make time shown by default
    store.dispatch(toggleViewTime());

    store.dispatch(setLegacyPeople(["Cecil"]));

    store.dispatch(addPerson(alice));
    store.dispatch(addPerson(bob));
  });

  it("basic", () => {
    mountProgram(prog);

    cy.contains("Test program");
    cy.contains("8:00\u201312:30");
    cy.contains("Alice, Bob, Cecil");
    cy.get(".program-url a").should(
      "have.attr",
      "href",
      "https://some.program.url"
    );

    // see https://docs.cypress.io/api/commands/hover
    cy.get(".program-edit").click({ force: true });
    cy.get("@edit").should("have.been.calledOnce");
  });

  it("with package", () => {
    const pkg = {
      _id: "testpackageid",
      name: "Test package",
      color: "#eeeeee",
    };
    store.dispatch(addPackage(pkg));

    const progWithPackage = Cypress._.cloneDeep(prog);
    progWithPackage.pkg = pkg._id;

    mountProgram(progWithPackage);

    cy.contains("Test package");
    cy.get(".program").should(
      "have.css",
      "background-color",
      "rgb(238, 238, 238)"
    );
  });

  it("with violations", () => {
    const violations = [
      { msg: "First violation" },
      { msg: "Second violation" },
      { people: [alice._id] },
    ];
    mountProgram(prog, violations);

    cy.contains("First violation, Second violation");
    cy.get(".program")
      .should("have.css", "background-image")
      .should("match", /repeating-linear-gradient\(.*\)/);
    cy.get(".program-people")
      .contains("Alice")
      .should("have.css", "color", "rgb(183, 28, 28)");
  });

  it("without URL", () => {
    const progWithoutUrl = Cypress._.cloneDeep(prog);
    delete progWithoutUrl.url;
    mountProgram(progWithoutUrl);

    cy.get(".program-url").should("not.exist");
  });

  describe("View settings", () => {
    it("no package", () => {
      const pkg = {
        _id: "testpackageid",
        name: "Test package",
        color: "#eeeeee",
      };
      store.dispatch(addPackage(pkg));

      const progWithPackage = Cypress._.cloneDeep(prog);
      progWithPackage.pkg = pkg._id;

      store.dispatch(toggleViewPkg());

      mountProgram(progWithPackage);

      cy.contains("Test package").should("not.exist");
      cy.get(".program").should(
        "have.css",
        "background-color",
        "rgb(238, 238, 238)"
      );
    });

    it("no time", () => {
      store.dispatch(toggleViewTime());
      mountProgram(prog);

      cy.contains("8:00\u201312:30").should("not.exist");
    });

    it("no people", () => {
      store.dispatch(toggleViewPeople());
      mountProgram(prog);

      cy.contains("Alice, Bob").should("not.exist");
    });

    it("no violations", () => {
      store.dispatch(toggleViewViolations());
      mountProgram(prog, ["First violation", "Second violation - Alice"]);

      cy.contains("First violation, Second violation - Alice").should(
        "not.exist"
      );
      cy.get(".program")
        .should("have.css", "background-image")
        .should("not.match", /repeating-linear-gradient\(.*\)/);
      cy.get(".program-people")
        .contains("Alice")
        .should("not.have.css", "color", "rgb(183, 28, 28)");
    });
  });

  describe("Permissions", () => {
    it(`able to edit (admin)`, () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      mountProgram(prog);

      cy.get(".program-move");
      cy.get(".program-clone");
    });

    it(`able to edit (edit)`, () => {
      store.dispatch(testing.setUserLevel(level.EDIT));
      mountProgram(prog);

      cy.get(".program-move");
      cy.get(".program-clone");
    });

    it(`unable to edit (view)`, () => {
      store.dispatch(testing.setUserLevel(level.VIEW));
      mountProgram(prog);

      cy.get(".program-move").should("not.exist");
      cy.get(".program-clone").should("not.exist");
    });
  });
});
