/// <reference types="cypress"/>

import React from "react";
import { firestoreClientFactory } from "../../src/FirestoreClient";
import Program from "../../src/components/Program";
import { level } from "../../src/helpers/Level";
import { getStore } from "../../src/store";
import { setTable, testing } from "../../src/store/authSlice";
import {
  toggleActivePerson,
  toggleHighlightedPackage,
  toggleHighlighting,
  togglePeopleEnabled,
  toggleViewPeople,
  toggleViewPkg,
  toggleViewTime,
  toggleViewViolations,
} from "../../src/store/viewSlice";

describe("Program", () => {
  const prog = {
    _id: "testprogramid",
    title: "Test program",
    url: "https://some.program.url",
    people: [{ person: "person1" }, { person: "person2" }, "Cecil"],
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
      <Program program={program} rect={rect} violations={violations} />,
      { dndProvider: true, reduxStore: store, router: true, command: true },
    );
  }

  beforeEach(() => {
    cy.viewport(400, 150);

    store = getStore();

    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        getPackages: cy
          .stub()
          .resolves([
            {
              _id: "pkg1",
              name: "Package 1",
              color: "#eeeeee",
            },
            {
              _id: "pkg2",
              name: "Package 2",
              color: "#dddddd",
            },
          ])
          .as("getPackages"),
        getPeople: cy
          .stub()
          .resolves([
            {
              _id: "person1",
              name: "Person 1",
            },
            {
              _id: "person2",
              name: "Person 2",
            },
          ])
          .as("getPeople"),
        getTimetable: cy.stub().resolves({}).as("getTimetable"),
        getPrograms: cy.stub().resolves([]).as("getPrograms"),
      })
      .log(false);

    // make time shown by default
    store.dispatch(toggleViewTime());

    store.dispatch(setTable("table1"));
  });

  it("basic", () => {
    mountProgram(prog);

    cy.contains("Test program");
    cy.contains("8:00\u201312:30");
    cy.contains("Person 1, Person 2");
    cy.get(".program-url a").should(
      "have.attr",
      "href",
      "https://some.program.url",
    );
  });

  it("with package", () => {
    const progWithPackage = Cypress._.cloneDeep(prog);
    progWithPackage.pkg = "pkg1";
    mountProgram(progWithPackage);

    cy.contains("Package 1");
    cy.get(".program").should(
      "have.css",
      "background-color",
      "rgb(238, 238, 238)",
    );
  });

  it("with violations", () => {
    const violations = [
      { msg: "First violation" },
      { msg: "Second violation" },
      { people: ["person1"] },
    ];
    mountProgram(prog, violations);

    cy.contains("First violation, Second violation");
    cy.get(".program")
      .should("have.css", "background-image")
      .should("match", /repeating-linear-gradient\(.*\)/);
    cy.get(".program-people")
      .contains("Person 1")
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
      const progWithPackage = Cypress._.cloneDeep(prog);
      progWithPackage.pkg = "pkg1";

      store.dispatch(toggleViewPkg());

      mountProgram(progWithPackage);

      cy.contains("Package 1").should("not.exist");
      cy.get(".program").should(
        "have.css",
        "background-color",
        "rgb(238, 238, 238)",
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

      cy.contains("Person 1, Person 2").should("not.exist");
    });

    it("no violations", () => {
      store.dispatch(toggleViewViolations());
      mountProgram(prog, ["First violation", "Second violation - Person 1"]);

      cy.contains("First violation, Second violation - Person 1").should(
        "not.exist",
      );
      cy.get(".program")
        .should("have.css", "background-image")
        .should("not.match", /repeating-linear-gradient\(.*\)/);
      cy.get(".program-people")
        .contains("Person 1")
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

  describe("Package highlighting", () => {
    it("is normal when highlighting disabled", () => {
      mountProgram(prog);
      cy.get(".program").should("not.have.class", "faded");
      cy.get(".program").should("not.have.class", "highlighted");
    });

    it("is faded when having no package", () => {
      store.dispatch(toggleHighlighting());
      store.dispatch(toggleHighlightedPackage("pkg1"));
      mountProgram({ ...prog, pkg: null });

      cy.get(".program").should("have.class", "faded");
    });

    it("is faded when having package that is not highlighted", () => {
      store.dispatch(toggleHighlighting());
      store.dispatch(toggleHighlightedPackage("pkg1"));
      mountProgram({ ...prog, pkg: "pkg2" });

      cy.get(".program").should("have.class", "faded");
    });

    it("is highlighted when having package that is highlighted", () => {
      store.dispatch(toggleHighlighting());
      store.dispatch(toggleHighlightedPackage("pkg1"));
      mountProgram({ ...prog, pkg: "pkg1" });

      cy.get(".program").should("have.class", "highlighted");
    });

    it("is faded when having package that is highlighted but the highlighting is turned off", () => {
      store.dispatch(toggleHighlightedPackage("pkg1"));
      mountProgram({ ...prog, pkg: "pkg1" });

      cy.get(".program").should("not.have.class", "highlighted");
    });
  });

  describe("People highlighting", () => {
    it("is normal when highlighting disabled", () => {
      mountProgram(prog);
      cy.get(".program").should("not.have.class", "faded");
      cy.get(".program").should("not.have.class", "highlighted");
    });

    it("is faded when having no person", () => {
      store.dispatch(togglePeopleEnabled());
      mountProgram({ ...prog, people: [] });

      cy.get(".program").should("have.class", "faded");
    });

    it("is faded when having person that is not highlighted", () => {
      store.dispatch(togglePeopleEnabled());
      store.dispatch(toggleActivePerson("person1"));
      mountProgram({ ...prog, people: [{ person: "person2" }] });

      cy.get(".program").should("have.class", "faded");
    });

    it("is highlighted when having person that is highlighted", () => {
      store.dispatch(togglePeopleEnabled());
      store.dispatch(toggleActivePerson("person1"));
      mountProgram({
        ...prog,
        people: [{ person: "person1" }, { person: "person2" }],
      });

      cy.get(".program").should("have.class", "highlighted");
    });
  });

  describe("People and package highlighting", () => {
    beforeEach(() => {
      store.dispatch(togglePeopleEnabled());
      store.dispatch(toggleHighlighting());
      store.dispatch(toggleHighlightedPackage("pkg1"));
      store.dispatch(toggleActivePerson("person1"));
    });

    it("is faded when not having people and package", () => {
      mountProgram({
        ...prog,
        people: [{ person: "person2" }],
        pkg: "pkg2",
      });
      cy.get(".program").should("have.class", "faded");
    });

    it("is highlighted when having package but not people", () => {
      mountProgram({
        ...prog,
        people: [{ person: "person2" }],
        pkg: "pkg1",
      });
      cy.get(".program").should("have.class", "highlighted");
    });

    it("is highlighted when having people but not package", () => {
      mountProgram({
        ...prog,
        people: [{ person: "person1" }],
        pkg: "pkg2",
      });
      cy.get(".program").should("have.class", "highlighted");
    });

    it("is highlighted when having both people and package", () => {
      mountProgram({
        ...prog,
        people: [{ person: "person1" }],
        pkg: "pkg1",
      });
      cy.get(".program").should("have.class", "highlighted");
    });
  });
});
