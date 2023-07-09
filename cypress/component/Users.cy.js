/// <reference types="cypress"/>

import { firestoreClientFactory } from "../../src/FirestoreClient";
import Users from "../../src/components/Users";
import { level } from "../../src/helpers/Level";
import { getStore } from "../../src/store";
import { testing } from "../../src/store/authSlice";
import { addUser, setPublicLevel } from "../../src/store/usersSlice";

describe("Users", () => {
  let store;

  beforeEach(() => {
    const client = {
      addUser: cy
        .spy(async (user) => ({ ...user, _id: "newuser" }))
        .as("addUser"),
      updateUser: cy.spy(async (user) => user).as("updateUser"),
      setPublicLevel: cy.spy(async (level) => level).as("setPublicLevel"),
    };
    cy.stub(firestoreClientFactory, "getClient").returns(client).log(false);

    store = getStore();
  });

  function setPublicLevelOrUser(level) {
    store.dispatch(setPublicLevel(level));
  }

  describe("public user", () => {
    it("displays warning when not logged in and there is no public access", () => {
      store.dispatch(testing.setUserLevel(level.EDIT));
      setPublicLevelOrUser(level.EDIT);
      cy.mount(<Users />, { reduxStore: store });

      cy.contains("Kdokoliv");
      cy.contains("spravovat uživatele");
      cy.contains("Pro změnu veřejného přístupu se přihlaste");
    });

    it("displays warning when not logged in and there is an explicit public access", () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      setPublicLevelOrUser(level.ADMIN);
      cy.mount(<Users />, { reduxStore: store });

      cy.contains("Kdokoliv");
      cy.contains("spravovat uživatele");
      cy.contains("Pro změnu veřejného přístupu se přihlaste");
    });

    it("displays instructions when logged in and there is an explicit public access", () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      setPublicLevelOrUser(level.ADMIN);
      cy.mount(<Users userEmail="test@email.com" />, { reduxStore: store });

      cy.contains("Kdokoliv");
      cy.contains("spravovat uživatele");
      cy.contains("Pro změnu veřejného přístupu nejdříve nastavte oprávnění");
      cy.contains("test@email.com");
    });

    it("allows editing when logged in and there is user access", () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      setPublicLevelOrUser(level.ADMIN);
      store.dispatch(
        addUser({ _id: "user1", email: "test@email.com", level: level.ADMIN })
      );
      cy.mount(<Users userEmail="test@email.com" />, { reduxStore: store });

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
      setPublicLevelOrUser(level.ADMIN);
      store.dispatch(
        addUser({ _id: "user1", email: "test@email.com", level: level.ADMIN })
      );
      cy.mount(<Users userEmail="test@email.com" />, { reduxStore: store });

      cy.contains("Upravit").first().click();
      cy.get("select").first().select("zobrazovat");
      cy.contains("Uložit").click();

      cy.get("@setPublicLevel").should("have.been.calledOnceWith", level.VIEW);
    });
  });

  describe("current user", () => {
    it("allows editing when there is an explicit public access", () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      setPublicLevelOrUser(level.ADMIN);
      store.dispatch(
        addUser({ _id: "user1", email: "test@email.com", level: level.NONE })
      );
      cy.mount(<Users userEmail="test@email.com" />, { reduxStore: store });

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
      setPublicLevelOrUser(level.NONE);
      store.dispatch(
        addUser({ _id: "user1", email: "test@email.com", level: level.ADMIN })
      );
      cy.mount(<Users userEmail="test@email.com" />, { reduxStore: store });

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
        setPublicLevelOrUser(level.NONE);
        store.dispatch(
          addUser({ _id: "user1", email: "test@email.com", level: level.ADMIN })
        );
        store.dispatch(
          addUser({
            _id: "user2",
            email: "another@user.com",
            level: level.ADMIN,
          })
        );
        cy.mount(<Users userEmail="test@email.com" />, { reduxStore: store });

        cy.get("tbody tr")
          .eq(2)
          .within(() => {
            cy.contains("test@email.com");
            cy.contains("spravovat uživatele");
            cy.contains("Upravit");
            cy.contains("Upozornění: pokud změníte vlastní oprávnění");
          });
      }
    );

    it("updates current user", () => {
      store.dispatch(testing.setUserLevel(level.ADMIN));
      setPublicLevelOrUser(level.ADMIN);
      store.dispatch(
        addUser({
          _id: "test@email.com",
          email: "test@email.com",
          level: level.ADMIN,
        })
      );
      cy.mount(<Users userEmail="test@email.com" />, { reduxStore: store });

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
    setPublicLevelOrUser(level.ADMIN);
    cy.mount(<Users />, { reduxStore: store });

    cy.get("input").clear().type("another@email.com");
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
