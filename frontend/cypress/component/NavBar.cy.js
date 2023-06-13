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
  });
});
