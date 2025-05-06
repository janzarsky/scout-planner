import { http } from "@google-cloud/functions-framework";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { importData } from "@scout-planner/common/importer";
import { Client } from "./client";

http("clone-timetable", cloneTimetable);

initializeApp();

async function cloneTimetable(req, res) {
  let email = null;
  try {
    email = await getIdentity(req);
    console.debug(`Got customer email: "${email}"`);
  } catch (error) {
    console.error(error);
    res.status(401).send("Unauthorized");
  }

  let options = null;
  try {
    options = getOptions(req);
    console.debug(
      `Got source: "${options.source}" and destination: "${options.destination}"`,
    );
  } catch (error) {
    console.error(error);
    res.status(400).send("Invalid parameters");
  }

  try {
    await cloneData(options.source, options.destination);
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

async function cloneData(source, destination) {
  const db = getFirestore();

  const sourceClient = new Client(source, db);
  const data = await loadData(source, sourceClient);

  const destinationClient = new Client(destination, db);
  await importData(data, destinationClient);
}

async function loadData(client) {
  // TODO
  return {
    programs: [],
    pkgs: [],
    groups: [],
    rules: [],
    ranges: [],
    users: [],
    people: [],
    settings: { title: "importTest" },
  };
}

export const testing = {
  getIdentity,
  getOptions,
};
