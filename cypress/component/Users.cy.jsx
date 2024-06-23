/// <reference types="cypress"/>

import React from "react";
import { firestoreClientFactory } from "../../src/FirestoreClient";
import Users from "../../src/components/Users";
import { level } from "../../src/helpers/Level";
import { getStore } from "../../src/store";
import { setTable, testing } from "../../src/store/authSlice";

describe("Users", () => {
  let store;

  function stubClient(publicLevel, users, secondUsers) {
    cy.stub(firestoreClientFactory, "getClient")
      .returns({
        getUsers: cy
          .stub()
          .onFirstCall()
          .resolves(users)
          .onSecondCall()
          .resolves(secondUsers)
          .as("getUsers"),
        addUser: cy
          .spy(async (user) => ({ ...user, _id: "newuser" }))
          .as("addUser"),
        updateUser: cy.spy(async (user) => user).as("updateUser"),
        getPublicLevel: cy.stub().resolves(publicLevel).as("getPublicLevel"),
        setPublicLevel: cy.spy(async (level) => level).as("setPublicLevel"),
      })
      .log(false);
  }

  beforeEach(() => {
    store = getStore();
    store.dispatch(setTable("table1"));
  });

  describe("public user", () => {
    it("displays warning when not logged in and there is no public access", () => {
      store.dispatch(testing.setUserLevel(level.EDIT));
      stubClient(level.EDIT, []);
      cy.mount(<Users />, { reduxStore: store, command: true });

      cy.contains("Kdokoliv");
      cy.contains("spravovat uživatele");
      cy.contains("Pro změnu veřejného přístupu se přihlaste");
    });

    it("displays warning when not logged in and there is an explicit public access", () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      stubClient(level.ADMIN, []);
      cy.mount(<Users />, { reduxStore: store, command: true });

      cy.contains("Kdokoliv");
      cy.contains("spravovat uživatele");
      cy.contains("Pro změnu veřejného přístupu se přihlaste");
    });

    it("displays instructions when logged in and there is an explicit public access", () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      stubClient(level.ADMIN, []);
      cy.mount(<Users userEmail="test@email.com" />, {
        reduxStore: store,
        command: true,
      });

      cy.contains("Kdokoliv");
      cy.contains("spravovat uživatele");
      cy.contains("Pro změnu veřejného přístupu nejdříve nastavte oprávnění");
      cy.contains("test@email.com");
    });

    it("allows editing when logged in and there is user access", () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      stubClient(level.ADMIN, [
        { _id: "user1", email: "test@email.com", level: level.ADMIN },
      ]);
      cy.mount(<Users userEmail="test@email.com" />, {
        reduxStore: store,
        command: true,
      });

      cy.get("tbody tr")
        .eq(0)
        .within(() => {
          cy.contains("Kdokoliv");
          cy.contains("spravovat uživatele");
          cy.contains("Upravit");
        });
    });

    it("updates public user", () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      stubClient(level.ADMIN, [
        { _id: "user1", email: "test@email.com", level: level.ADMIN },
      ]);
      cy.mount(<Users userEmail="test@email.com" />, {
        reduxStore: store,
        command: true,
      });

      cy.contains("Upravit").first().click();
      cy.get("select").first().select("zobrazovat");
      cy.contains("Uložit").click();

      cy.get("@setPublicLevel").should("have.been.calledOnceWith", level.VIEW);
    });
  });

  describe("current user", () => {
    it("allows editing when there is an explicit public access", () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      stubClient(level.ADMIN, [
        { _id: "user1", email: "test@email.com", level: level.NONE },
      ]);
      cy.mount(<Users userEmail="test@email.com" />, {
        reduxStore: store,
        command: true,
      });

      cy.get("tbody tr")
        .eq(1)
        .within(() => {
          cy.contains("test@email.com");
          cy.contains("žádné");
          cy.contains("Upravit");
        });
    });

    it("displays warning when there is no public access and no other admins", () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      stubClient(level.NONE, [
        { _id: "user1", email: "test@email.com", level: level.ADMIN },
      ]);
      cy.mount(<Users userEmail="test@email.com" />, {
        reduxStore: store,
        command: true,
      });

      cy.get("tbody tr")
        .eq(1)
        .within(() => {
          cy.contains("test@email.com");
          cy.contains("spravovat uživatele");
          cy.contains("Pro úpravu přidejte alespoň jednoho dalšího uživatele");
        });
    });

    it(
      "allows editing with warning message when there is no public access " +
        "and there are other admins",
      () => {
        store.dispatch(testing.setUserLevel(level.ADMIN));
        stubClient(level.NONE, [
          {
            _id: "user1",
            email: "test@email.com",
            level: level.ADMIN,
          },
          {
            _id: "user2",
            email: "another@user.com",
            level: level.ADMIN,
          },
        ]);
        cy.mount(<Users userEmail="test@email.com" />, {
          reduxStore: store,
          command: true,
        });

        cy.get("tbody tr")
          .eq(2)
          .within(() => {
            cy.contains("test@email.com");
            cy.contains("spravovat uživatele");
            cy.contains("Upravit");
            cy.contains("Upozornění: pokud změníte vlastní oprávnění");
          });
      },
    );

    it("updates current user", () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      stubClient(level.ADMIN, [
        {
          _id: "test@email.com",
          email: "test@email.com",
          level: level.ADMIN,
        },
      ]);
      cy.mount(<Users userEmail="test@email.com" />, {
        reduxStore: store,
        command: true,
      });

      cy.get("tbody tr").eq(1).contains("Upravit").click();
      cy.get("select").first().select("zobrazovat");
      cy.contains("Uložit").click();

      cy.get("@updateUser").should("have.been.calledOnceWith", {
        _id: "test@email.com",
        email: "test@email.com",
        level: level.VIEW,
      });
    });
  });

  it("adds new user", () => {
    store.dispatch(testing.setUserLevel(level.ADMIN));
    stubClient(
      level.ADMIN,
      [],
      [
        {
          _id: "another@email.com",
          email: "another@email.com",
          level: level.VIEW,
        },
      ],
    );
    cy.mount(<Users />, { reduxStore: store, command: true });

    cy.get("input").clear();
    cy.get("input").type("another@email.com");
    cy.get("select").select("zobrazovat");
    cy.contains("Přidat").click();

    cy.get("@updateUser").should("have.been.calledOnceWith", {
      _id: "another@email.com",
      email: "another@email.com",
      level: level.VIEW,
    });

    cy.get("tbody tr")
      .eq(1)
      .within(() => {
        cy.contains("another@email.com");
        cy.contains("zobrazovat");
      });
  });
});
