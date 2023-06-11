import "./commands";
import { mount } from "cypress/react18";
import { Provider } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { getStore } from "../../src/store";
import "../../src/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { MemoryRouter } from "react-router-dom";

Cypress.Commands.add("mount", (component, options = {}) => {
  const {
    reduxStore = getStore(),
    dndProvider = false,
    router = false,
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

  return mount(routerWrapped, mountOptions);
});
