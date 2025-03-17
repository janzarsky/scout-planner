import { http } from "@google-cloud/functions-framework";
import admin from "firebase-admin";

admin.initializeApp();

http("clone-timetable", cloneTimetable);

async function cloneTimetable(req, res) {
  try {
    const email = await getIdentity(req);

    console.debug("Got customer email: " + email);

    throw new Error("Not implemented");
  } catch (error) {
    console.error(error);
    res.status(401).send("Unauthorized");
  }
}

async function getIdentity(req) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    console.log("throwing");
    throw new Error("Unauthorized");
  }
  const idToken = authorizationHeader.split("Bearer ")[1];

  const token = await admin.auth().verifyIdToken(idToken);

  return token.email;
}

export const testing = {
  getIdentity,
};
