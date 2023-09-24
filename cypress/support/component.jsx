import "./commands";
import React from "react";
import { mount } from "cypress/react18";
import { Provider } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { getStore } from "../../src/store";
import "bootstrap/dist/css/bootstrap.min.css";
import { MemoryRouter } from "react-router-dom";
import { testing } from "../../src/components/AuthProvider";

// the order is important for CSS
import "../../src/index.css";

Cypress.Commands.add("mount", (component, options = {}) => {
  const {
    reduxStore = getStore(),
    dndProvider = false,
    router = false,
    auth = false,
    authValue = {},
    initialEntries = ["/"],
    ...mountOptions
  } = options;

  const storeWrapped = <Provider store={reduxStore}>{component}</Provider>;

  const dndWrapped = dndProvider ? (
    <DndProvider backend={HTML5Backend}>{storeWrapped}</DndProvider>
  ) : (
    storeWrapped
  );

  const routerWrapped = router ? (
    <MemoryRouter initialEntries={initialEntries}>{dndWrapped}</MemoryRouter>
  ) : (
    dndWrapped
  );

  const authWrapped = auth ? (
    <testing.AuthContext.Provider value={authValue}>
      {routerWrapped}
    </testing.AuthContext.Provider>
  ) : (
    routerWrapped
  );

  return mount(authWrapped, mountOptions);
});
