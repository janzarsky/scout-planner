import "./commands";
import { mount } from "cypress/react";
import "../../src/index.css";

Cypress.Commands.add("mount", mount);
