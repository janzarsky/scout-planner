/// <reference types="cypress"/>

import React from "react";
import { firestoreClientFactory } from "../../src/FirestoreClient";
import Ranges from "../../src/components/Ranges";
import { getStore } from "../../src/store";

describe("Ranges", () => {
  let store;

  beforeEach(() => {
    store = getStore();
  });

  function stubClient(ranges, rangesSecond) {
    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        getRanges: cy
          .stub()
          .onFirstCall()
          .resolves(ranges)
          .onSecondCall()
          .resolves(rangesSecond)
          .as("getRanges"),
        deleteRange: cy.stub().resolves().as("deleteRange"),
        addRange: cy.stub().resolves().as("addRange"),
        updateRange: cy.stub().resolves().as("updateRange"),
        streamRanges: cy
          .stub()
          .resolves(() => {})
          .as("streamRanges"),
      })
      .log(false);
  }

  it("is empty when there are no ranges", () => {
    stubClient([]);
    cy.mount(<Ranges />, { reduxStore: store });
    cy.get("@getRanges").should("have.been.calledOnce");

    cy.get("[value='Nová linka']");
    cy.contains("Přidat");
  });

  it("shows ranges", () => {
    stubClient([
      { _id: "range1", name: "Range 1" },
      { _id: "range2", name: "Range 2" },
    ]);
    cy.mount(<Ranges />, { reduxStore: store });
    cy.get("@getRanges").should("have.been.calledOnce");

    cy.contains("Range 1");
    cy.contains("Range 2");
    cy.contains("Upravit");
    cy.contains("Smazat");
  });

  it("allows deleting a range", () => {
    stubClient([{ _id: "range1", name: "Range 1" }], []);
    cy.mount(<Ranges />, { reduxStore: store });
    cy.get("@getRanges").should("have.been.calledOnce");

    cy.contains("Range 1");
    cy.contains("Smazat").click();
    cy.get("@deleteRange").should("have.been.calledOnce");
    cy.contains("Range 1").should("not.exist");
  });

  it("adds new range", () => {
    stubClient([], [{ _id: "range1", name: "Range 1" }]);
    cy.mount(<Ranges />, { reduxStore: store });
    cy.get("@getRanges").should("have.been.calledOnce");

    cy.get("input").clear();
    cy.get("input").type("Range 1");
    cy.contains("Přidat").click();

    cy.get("@addRange").should("have.been.calledOnce");
    cy.contains("Range 1");
  });

  it("updates range", () => {
    stubClient(
      [{ _id: "range1", name: "Range 1" }],
      [{ _id: "range1", name: "Range 2" }],
    );
    cy.mount(<Ranges />, { reduxStore: store });
    cy.get("@getRanges").should("have.been.calledOnce");

    cy.contains("Upravit").click();
    cy.get("input:first").clear();
    cy.get("input:first").type("Range 2");
    cy.contains("Uložit").click();

    cy.get("@updateRange").should("have.been.calledOnce");
    cy.contains("Range 2");
  });
});
