/// <reference types="cypress"/>

import { testing } from "../../src/components/App";
import { testing as authTesting } from "../../src/store/authSlice";
import { getStore } from "../../src/store";
import { level } from "../../src/helpers/Level";

describe("Navigation Bar", () => {
  let store;

  function mountNavBar(authValue) {
    cy.mount(<testing.NavBar />, {
      reduxStore: store,
      router: true,
      auth: true,
      authValue: authValue,
    });
  }

  beforeEach(() => {
    store = getStore();
  });

  it("displays no links when having no access", () => {
    store.dispatch(authTesting.setUserLevel(level.NONE));
    cy.viewport(1000, 200);
    mountNavBar();

    cy.contains("Harmonogram").should("have.class", "active");
  });
});

describe("Google login button", () => {
  let store;

  function mountGoogleLogin(authValue) {
    cy.mount(<testing.GoogleLogin />, {
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
