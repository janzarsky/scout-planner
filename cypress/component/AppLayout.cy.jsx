/// <reference types="cypress"/>

import React from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";

describe("App layout", () => {
  const navbar = (
    <Navbar
      className="control-panel"
      expand="lg"
      style={{ backgroundColor: "red" }}
    >
      <Container fluid className="ps-0 pe-0">
        <Nav.Link>Menu item</Nav.Link>
      </Container>
    </Navbar>
  );
  const filters = (
    <Container
      fluid
      className="ms-0 me-0 mb-1 filter-container"
      style={{ backgroundColor: "blue" }}
    >
      <Button>Filters</Button>
    </Container>
  );
  function getTimetable(children = null) {
    return (
      <Container
        fluid
        className="ms-0 me-0 ps-0 pe-0 main-container"
        style={{ backgroundColor: "green" }}
      >
        Timetable
        {children}
      </Container>
    );
  }

  Cypress.Commands.add(
    "shouldBePlacedAt",
    { prevSubject: "element" },
    (el, left, top, width, height) => {
      cy.wrap(el).invoke("offset").should("deep.equal", { top, left });
      cy.wrap(el).invoke("outerWidth").should("equal", width);
      cy.wrap(el).invoke("outerHeight").should("equal", height);
    },
  );

  Cypress.Commands.add(
    "shouldScroll",
    { prevSubject: "element" },
    (el, horizontally, vertically) => {
      if (horizontally)
        expect(el[0].scrollWidth).to.be.greaterThan(el[0].clientWidth);
      else expect(el[0].scrollWidth).to.equal(el[0].clientWidth);

      if (vertically)
        expect(el[0].scrollHeight).to.be.greaterThan(el[0].clientHeight);
      else expect(el[0].scrollHeight).to.equal(el[0].clientHeight);
    },
  );

  it("contains menu and timetable by default", () => {
    cy.mount(
      <div className="app">
        {navbar}
        {getTimetable()}
      </div>,
    );
    cy.get(".app").shouldScroll(false, false);
    cy.get(".control-panel").shouldBePlacedAt(0, 0, 500, 40);
    cy.get(".main-container").shouldBePlacedAt(0, 44, 500, 456);
    cy.get(".main-container").shouldScroll(false, false);
  });

  it("includes filters when enabled", () => {
    cy.mount(
      <div className="app">
        {navbar}
        {filters}
        {getTimetable()}
      </div>,
    );
    cy.get(".app").shouldScroll(false, false);
    cy.get(".control-panel").shouldBePlacedAt(0, 0, 500, 40);
    cy.get(".filter-container").shouldBePlacedAt(0, 44, 500, 38);
    cy.get(".main-container").shouldBePlacedAt(0, 86, 500, 414);
    cy.get(".main-container").shouldScroll(false, false);
  });

  it("scrolls timetable horizontally", () => {
    cy.mount(
      <div className="app">
        {navbar}
        {filters}
        {getTimetable(
          <div style={{ backgroundColor: "purple", width: "800px" }}>
            Long horizontal content
          </div>,
        )}
      </div>,
    );
    cy.get(".app").shouldScroll(false, false);
    cy.get(".control-panel").shouldBePlacedAt(0, 0, 500, 40);
    cy.get(".filter-container").shouldBePlacedAt(0, 44, 500, 38);
    cy.get(".main-container").shouldBePlacedAt(0, 86, 500, 414);
    cy.get(".main-container").shouldScroll(true, false);
  });

  it("scrolls timetable vertically", () => {
    cy.mount(
      <div className="app">
        {navbar}
        {filters}
        {getTimetable(
          <div style={{ backgroundColor: "purple", height: "800px" }}>
            Long vertical content
          </div>,
        )}
      </div>,
    );
    cy.get(".app").shouldScroll(false, false);
    cy.get(".control-panel").shouldBePlacedAt(0, 0, 500, 40);
    cy.get(".filter-container").shouldBePlacedAt(0, 44, 500, 38);
    cy.get(".main-container").shouldBePlacedAt(0, 86, 500, 414);
    cy.get(".main-container").shouldScroll(false, true);
  });

  it("scrolls timetable in both directions", () => {
    cy.mount(
      <div className="app">
        {navbar}
        {filters}
        {getTimetable(
          <div
            style={{
              backgroundColor: "purple",
              width: "800px",
              height: "800px",
            }}
          >
            Long horizontal and vertical content
          </div>,
        )}
      </div>,
    );
    cy.get(".app").shouldScroll(false, false);
    cy.get(".control-panel").shouldBePlacedAt(0, 0, 500, 40);
    cy.get(".filter-container").shouldBePlacedAt(0, 44, 500, 38);
    cy.get(".main-container").shouldBePlacedAt(0, 86, 500, 414);
    cy.get(".main-container").shouldScroll(true, true);
  });
});
