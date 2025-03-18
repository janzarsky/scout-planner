import { http } from "@google-cloud/functions-framework";
import admin from "firebase-admin";

admin.initializeApp();

http("clone-timetable", cloneTimetable);

async function cloneTimetable(req, res) {
  let email = null;
  try {
    email = await getIdentity(req);
    console.debug("Got customer email: " + email);
  } catch (error) {
    console.error(error);
    res.status(401).send("Unauthorized");
  }

  let options = null;
  try {
    options = getOptions(req);
    console.debug("Got options: " + options);
  } catch (error) {
    console.error(error);
    res.status(400).send("Invalid parameters");
  }

  try {
    throw new Error("Not implemented");
  } catch (error) {
    console.error(error);
    res.status(500).send("Not implemented");
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

function getOptions(req) {
  const source = req.query.source;
  if (!source) throw new Error("Invalid parameters");

  const destination = req.query.destination;
  if (!destination) throw new Error("Invalid parameters");

  return { source, destination };
}

export const testing = {
  getIdentity,
  getOptions,
};
