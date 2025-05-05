import { http } from "@google-cloud/functions-framework";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { level } from "@scout-planner/common/level";

http("clone-timetable", cloneTimetable);

initializeApp();

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
    await cloneData(options.source);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }

  res.status(200).send("Successfullly cloned");
}

async function getIdentity(req) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    console.log("throwing");
    throw new Error("Unauthorized");
  }
  const idToken = authorizationHeader.split("Bearer ")[1];

  const token = await getAuth().verifyIdToken(idToken);

  return token.email;
}

function getOptions(req) {
  const source = req.query.source;
  if (!source) throw new Error("Invalid parameters");

  const destination = req.query.destination;
  if (!destination) throw new Error("Invalid parameters");

  return { source, destination };
}

async function cloneData(source) {
  const db = getFirestore();
  const sourceTimetable = await db.doc("timetables/" + source).get();

  console.log(sourceTimetable);

  // FIXME: test of level
  console.log(level.ADMIN);

  throw new Error("Not implemented");
}

export const testing = {
  getIdentity,
  getOptions,
};
