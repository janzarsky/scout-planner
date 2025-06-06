/// <reference types="cypress"/>

import React from "react";
import { testing as authTesting, setTable } from "../../src/store/authSlice";
import { getStore } from "../../src/store";
import { level } from "@scout-planner/common/level";
import {
  setActiveRange,
  toggleHighlightedPackage,
  toggleHighlighting,
  toggleRangesEnabled,
  toggleViewSettingsEnabled,
} from "../../src/store/viewSlice";
import { ViewSettings } from "../../src/components/ViewSettings";
import { RangesSettings } from "../../src/components/RangesSettings";
import { PackageFilter } from "../../src/components/PackageFilter";
import { GoogleLogin } from "../../src/components/GoogleLogin";
import { NavBar } from "../../src/components/NavBar";
import { firestoreClientFactory } from "../../src/FirestoreClient";

describe("Navigation Bar", () => {
  let store;

  function mountNavBar(authValue) {
    cy.mount(<NavBar />, {
      reduxStore: store,
      router: true,
      auth: true,
      authValue: authValue,
      initialEntries: ["/table1"],
    });
  }

  beforeEach(() => {
    store = getStore();

    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        getTimetable: cy.stub().resolves({}).as("getTimetable"),
        streamTimetable: cy
          .stub()
          .resolves(() => {})
          .as("streamTimetable"),
      })
      .log(false);

    store.dispatch(setTable("table1"));
  });

  it("displays no links when having no access", () => {
    store.dispatch(authTesting.setUserLevel(level.NONE));
    cy.viewport(1000, 200);
    mountNavBar();

    cy.contains("Harmonogram")
      .should("have.class", "active")
      .should("have.attr", "href", "/table1");
    cy.get("[data-test=navbar-toggle]").should("not.be.visible");
  });

  it("displays no links when having no access on mobile", () => {
    store.dispatch(authTesting.setUserLevel(level.NONE));
    cy.viewport(320, 200);
    mountNavBar();

    cy.contains("Harmonogram")
      .should("have.class", "active")
      .should("have.attr", "href", "/table1");
    cy.get("[data-test=auth-login-button]").should("not.be.visible");
    cy.get("[data-test=navbar-toggle]").click();
    cy.get("[data-test=auth-login-button]").should("be.visible");
  });

  it("displays set of links when having view access", () => {
    store.dispatch(authTesting.setUserLevel(level.VIEW));
    cy.viewport(1000, 200);
    mountNavBar();

    cy.contains("Harmonogram")
      .should("have.class", "active")
      .should("have.attr", "href", "/table1");
    cy.contains("Pravidla")
      .should("have.attr", "href", "/table1/rules")
      .should("be.visible");
    cy.contains("Statistiky")
      .should("have.attr", "href", "/table1/stats")
      .should("be.visible");
    cy.contains("Nastavení").click();
    cy.get("[href='/table1/settings']")
      .should("have.text", "Nastavení")
      .should("be.visible");
  });

  it("displays set of links when having view access on mobile", () => {
    store.dispatch(authTesting.setUserLevel(level.VIEW));
    cy.viewport(320, 600);
    mountNavBar();

    cy.contains("Harmonogram")
      .should("have.class", "active")
      .should("have.attr", "href", "/table1");

    cy.contains("Pravidla")
      .should("have.attr", "href", "/table1/rules")
      .should("not.be.visible");
    cy.contains("Statistiky")
      .should("have.attr", "href", "/table1/stats")
      .should("not.be.visible");

    cy.get("[data-test=navbar-toggle]").click();

    cy.contains("Pravidla").should("be.visible");
    cy.contains("Statistiky").should("be.visible");

    cy.contains("Nastavení").click();
    cy.get("[href='/table1/settings']")
      .should("have.text", "Nastavení")
      .should("be.visible");
  });

  it("displays everything except users when having edit access", () => {
    store.dispatch(authTesting.setUserLevel(level.EDIT));
    cy.viewport(1000, 400);
    mountNavBar();

    cy.contains("Harmonogram")
      .should("have.class", "active")
      .should("have.attr", "href", "/table1");
    cy.contains("Pravidla")
      .should("have.attr", "href", "/table1/rules")
      .should("be.visible");
    cy.contains("Statistiky")
      .should("have.attr", "href", "/table1/stats")
      .should("be.visible");
    cy.contains("Nastavení").click();

    cy.contains("Balíčky")
      .should("have.attr", "href", "/table1/packages")
      .should("be.visible");
    cy.contains("Skupiny")
      .should("have.attr", "href", "/table1/groups")
      .should("be.visible");
    cy.contains("Organizátoři")
      .should("have.attr", "href", "/table1/people")
      .should("be.visible");
    cy.contains("Linky")
      .should("have.attr", "href", "/table1/ranges")
      .should("be.visible");
    cy.get("[href='/table1/settings']")
      .should("have.text", "Nastavení")
      .should("be.visible");
  });

  it("displays everything when having admin access", () => {
    store.dispatch(authTesting.setUserLevel(level.ADMIN));
    cy.viewport(1000, 400);
    mountNavBar();

    cy.contains("Harmonogram")
      .should("have.class", "active")
      .should("have.attr", "href", "/table1");
    cy.contains("Pravidla")
      .should("have.attr", "href", "/table1/rules")
      .should("be.visible");
    cy.contains("Statistiky")
      .should("have.attr", "href", "/table1/stats")
      .should("be.visible");
    cy.contains("Nastavení").click();

    cy.contains("Balíčky")
      .should("have.attr", "href", "/table1/packages")
      .should("be.visible");
    cy.contains("Skupiny")
      .should("have.attr", "href", "/table1/groups")
      .should("be.visible");
    cy.contains("Organizátoři")
      .should("have.attr", "href", "/table1/people")
      .should("be.visible");
    cy.contains("Linky")
      .should("have.attr", "href", "/table1/ranges")
      .should("be.visible");
    cy.contains("Uživatelé")
      .should("have.attr", "href", "/table1/users")
      .should("be.visible");
    cy.get("[href='/table1/settings']")
      .should("have.text", "Nastavení")
      .should("be.visible");
  });
});

describe("Filters", () => {
  let store;

  function mountFilters() {
    cy.mount(<PackageFilter />, { reduxStore: store, router: true });
  }

  beforeEach(() => {
    store = getStore();
    store.dispatch(toggleHighlighting());

    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        getPackages: cy
          .stub()
          .resolves([
            { _id: "package1", name: "Package 1", color: "#c5e1a5" },
            { _id: "package2", name: "Package 2", color: "#c5cae9" },
          ])
          .as("getPackages"),
        streamPackages: cy
          .stub()
          .resolves(() => {})
          .as("streamPackages"),
      })
      .log(false);

    store.dispatch(setTable("table1"));
  });

  it("displays all packages", () => {
    cy.viewport(500, 200);
    mountFilters();

    cy.contains("Package 1").should(
      "have.css",
      "background-color",
      "rgb(197, 225, 165)",
    );
    cy.contains("Package 2").should(
      "have.css",
      "background-color",
      "rgb(197, 202, 233)",
    );
  });

  it("highlights selected package", () => {
    store.dispatch(toggleHighlightedPackage("package2"));
    cy.viewport(500, 200);
    mountFilters();

    cy.contains("Package 1").should(
      "have.css",
      "background-color",
      "rgb(197, 225, 165)",
    );
    cy.contains("Package 2")
      .should("have.class", "btn-dark")
      .should("not.have.css", "background-color", "rgb(197, 202, 233)");
  });
});

describe("View settings", () => {
  let store;

  function mountViewSettings() {
    cy.mount(<ViewSettings />, { reduxStore: store, router: true });
  }

  beforeEach(() => {
    store = getStore();
    store.dispatch(toggleViewSettingsEnabled());
  });

  it("displays settings", () => {
    cy.viewport(500, 200);
    mountViewSettings();

    cy.contains("Balíček").should("have.class", "btn-dark");
    cy.contains("Čas").should("have.class", "btn-light");
    cy.contains("Lidi").should("have.class", "btn-dark");
    cy.contains("Místo").should("have.class", "btn-dark");
    cy.contains("Porušení pravidel").should("have.class", "btn-dark");
  });
});

describe("Ranges settings", () => {
  let store;

  function mountRangesSettings() {
    cy.mount(<RangesSettings />, { reduxStore: store, router: true });
  }

  beforeEach(() => {
    store = getStore();
    store.dispatch(toggleRangesEnabled());
  });

  function stubClient(ranges) {
    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        getRanges: cy.stub().resolves(ranges).as("getRanges"),
        streamRanges: cy
          .stub()
          .resolves(() => {})
          .as("streamRanges"),
      })
      .log(false);
  }

  it("displays all ranges", () => {
    stubClient([
      { _id: "range1", name: "Range 1" },
      { _id: "range2", name: "Range 2" },
    ]);
    cy.viewport(500, 200);
    mountRangesSettings();

    cy.contains("Range 1").should("have.class", "btn-light");
    cy.contains("Range 2").should("have.class", "btn-light");
  });

  it("highlights active range", () => {
    stubClient([
      { _id: "range1", name: "Range 1" },
      { _id: "range2", name: "Range 2" },
    ]);
    store.dispatch(setActiveRange("range2"));
    cy.viewport(500, 200);
    mountRangesSettings();

    cy.contains("Range 1").should("have.class", "btn-light");
    cy.contains("Range 2").should("have.class", "btn-dark");
  });
});

describe("Google login button", () => {
  let store;

  function mountGoogleLogin(authValue) {
    cy.mount(<GoogleLogin />, {
      reduxStore: store,
      auth: true,
      authValue: authValue,
    });
  }

  beforeEach(() => {
    store = getStore();
  });

  it("calls login when not logged in", () => {
    mountGoogleLogin({
      user: null,
      login: cy.stub().resolves().as("login"),
    });
    cy.get("[data-test=auth-login-button]").click();
    cy.get("@login").should("have.been.calledOnce");
  });

  it("calls logout when logged in", () => {
    mountGoogleLogin({
      user: { displayName: "Test User" },
      logout: cy.stub().resolves().as("logout"),
    });
    cy.contains("Test User");
    cy.get("[data-test=auth-logout-button]").click();
    cy.get("@logout").should("have.been.calledOnce");
  });
});
