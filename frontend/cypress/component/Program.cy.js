/// <reference types="cypress"/>

import Program from "../../src/components/Program";
import { level } from "../../src/helpers/Level";

describe("Program.cy.js", () => {
  const prog = {
    _id: "testprogramid",
    title: "Test program",
    url: "https://some.program.url",
    people: ["Alice", "Bob"],
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

  const viewSettings = {
    viewPkg: true,
    viewTime: true,
    viewPeople: true,
    viewViolations: true,
  };

  it("basic", () => {
    cy.mount(
      <Program
        program={prog}
        rect={rect}
        pkgs={[]}
        editProgramModal={cy.stub().as("edit")}
        viewSettings={viewSettings}
        clone={cy.stub().as("clone")}
        userLevel={level.ADMIN}
      />
    );

    cy.contains("Test program");
    cy.contains("8:00\u201312:30");
    cy.contains("Alice, Bob");
    cy.get(".program-url a").should(
      "have.attr",
      "href",
      "https://some.program.url"
    );

    // see https://docs.cypress.io/api/commands/hover
    cy.get(".program-edit").click({ force: true });
    cy.get("@edit").should("have.been.calledOnce");

    cy.get(".program-clone").click({ force: true });
    cy.get("@clone").should("have.been.calledOnce");
  });

  it("with package", () => {
    const pkg = {
      _id: "testpackageid",
      name: "Test package",
      color: "#eeeeee",
    };

    const progWithPackage = Cypress._.cloneDeep(prog);
    progWithPackage.pkg = pkg._id;

    cy.mount(
      <Program
        program={progWithPackage}
        rect={rect}
        pkgs={[pkg]}
        viewSettings={viewSettings}
        userLevel={level.ADMIN}
      />
    );

    cy.contains("Test package");
    cy.get(".program").should(
      "have.css",
      "background-color",
      "rgb(238, 238, 238)"
    );
  });

  it("with violations", () => {
    cy.mount(
      <Program
        program={prog}
        rect={rect}
        pkgs={[]}
        viewSettings={viewSettings}
        userLevel={level.ADMIN}
        violations={["First violation", "Second violation - Alice"]}
      />
    );

    cy.contains("First violation, Second violation - Alice");
    cy.get(".program")
      .should("have.css", "background-image")
      .should("match", /repeating-linear-gradient\(.*\)/);
    cy.get(".program-people")
      .contains("Alice")
      .should("have.css", "color", "rgb(183, 28, 28)");
  });

  describe("View settings", () => {
    it("no package", () => {
      const pkg = {
        _id: "testpackageid",
        name: "Test package",
        color: "#eeeeee",
      };

      const progWithPackage = Cypress._.cloneDeep(prog);
      progWithPackage.pkg = pkg._id;

      const customViewSettings = Cypress._.cloneDeep(viewSettings);
      customViewSettings.viewPkg = false;

      cy.mount(
        <Program
          program={progWithPackage}
          rect={rect}
          pkgs={[pkg]}
          viewSettings={customViewSettings}
          userLevel={level.ADMIN}
        />
      );

      cy.contains("Test package").should("not.exist");
      cy.get(".program").should(
        "have.css",
        "background-color",
        "rgb(238, 238, 238)"
      );
    });

    it("no time", () => {
      const customViewSettings = Cypress._.cloneDeep(viewSettings);
      customViewSettings.viewTime = false;

      cy.mount(
        <Program
          program={prog}
          rect={rect}
          pkgs={[]}
          viewSettings={customViewSettings}
          userLevel={level.ADMIN}
        />
      );

      cy.contains("8:00\u201312:30").should("not.exist");
    });

    it("no people", () => {
      const customViewSettings = Cypress._.cloneDeep(viewSettings);
      customViewSettings.viewPeople = false;

      cy.mount(
        <Program
          program={prog}
          rect={rect}
          pkgs={[]}
          viewSettings={customViewSettings}
          userLevel={level.ADMIN}
        />
      );

      cy.contains("Alice, Bob").should("not.exist");
    });

    it("no violations", () => {
      const customViewSettings = Cypress._.cloneDeep(viewSettings);
      customViewSettings.viewViolations = false;

      cy.mount(
        <Program
          program={prog}
          rect={rect}
          pkgs={[]}
          viewSettings={customViewSettings}
          userLevel={level.ADMIN}
          violations={["First violation", "Second violation - Alice"]}
        />
      );

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
});
