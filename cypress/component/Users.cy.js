/// <reference types="cypress"/>

import { clientFactory } from "../../src/Client";
import { firestoreClientFactory } from "../../src/FirestoreClient";
import Users from "../../src/components/Users";
import { level } from "../../src/helpers/Level";
import { getStore } from "../../src/store";
import { testing } from "../../src/store/authSlice";
import { addUser, setPublicLevel } from "../../src/store/usersSlice";

describe("Users", () => {
  let store;

  const config = require("../../src/config.json");
  var localConfig = {};

  try {
    localConfig = require("../../src/config.local.json");
  } catch {}

  const completeConfig = {
    ...config,
    ...localConfig,
  };

  beforeEach(() => {
    const client = {
      addUser: cy
        .spy(async (user) => ({ ...user, _id: "newuser" }))
        .as("addUser"),
      updateUser: cy.spy(async (user) => user).as("updateUser"),
      setPublicLevel: cy.spy(async (level) => level).as("setPublicLevel"),
    };
    if (completeConfig.firestore)
      cy.stub(firestoreClientFactory, "getClient").returns(client).log(false);
    else cy.stub(clientFactory, "getClient").returns(client).log(false);

    store = getStore();
  });

  function setPublicLevelOrUser(level) {
    if (completeConfig.firestore) store.dispatch(setPublicLevel(level));
    else
      store.dispatch(addUser({ _id: "public", email: "public", level: level }));
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

    !completeConfig.firestore &&
      it("displays warning when not logged in and there is an implicit public access", () => {
        store.dispatch(testing.setUserLevel(level.ADMIN));
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

    !completeConfig.firestore &&
      it("displays instructions when logged in and there is an implicit public access", () => {
        store.dispatch(testing.setUserLevel(level.ADMIN));
        cy.mount(<Users userEmail="test@email.com" />, { reduxStore: store });

        cy.contains("Kdokoliv");
        cy.contains("spravovat uživatele");
        cy.contains("Pro změnu veřejného přístupu nejdříve nastavte oprávnění");
        cy.contains("test@email.com");
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

      if (completeConfig.firestore)
        cy.get("@setPublicLevel").should(
          "have.been.calledOnceWith",
          level.VIEW
        );
      else
        cy.get("@updateUser").should("have.been.calledOnceWith", {
          _id: "public",
          email: "public",
          level: level.VIEW,
        });
    });

    !completeConfig.firestore &&
      it("adds public user when there is not one yet", () => {
        store.dispatch(testing.setUserLevel(level.ADMIN));
        store.dispatch(
          addUser({ _id: "user1", email: "test@email.com", level: level.ADMIN })
        );
        cy.mount(<Users userEmail="test@email.com" />, { reduxStore: store });

        cy.contains("Upravit").first().click();
        cy.get("select").first().select("zobrazovat");
        cy.contains("Uložit").click();

        cy.get("@addUser").should("have.been.calledOnceWith", {
          email: "public",
          level: level.VIEW,
        });
      });
  });

  describe("current user", () => {
    !completeConfig.firestore &&
      it("allows editing when there is an implicit public access", () => {
        store.dispatch(testing.setUserLevel(level.ADMIN));
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

    if (completeConfig.firestore)
      cy.get("@updateUser").should("have.been.calledOnceWith", {
        _id: "another@email.com",
        email: "another@email.com",
        level: level.VIEW,
      });
    else
      cy.get("@addUser").should("have.been.calledOnceWith", {
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