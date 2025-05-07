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
  db.settings({ ignoreUndefinedProperties: true });

  const sourceClient = new Client(source, db);
  const data = await loadData(sourceClient);

  const destinationClient = new Client(destination, db);
  await importData(data, destinationClient);
}

async function loadData(client) {
  const [groups, ranges, pkgs, rules, users, people, programs, timetable] =
    await Promise.all([
      client.getGroups(),
      client.getRanges(),
      client.getPackages(),
      client.getRules(),
      client.getUsers(),
      client.getPeople(),
      client.getPrograms(),
      client.getTimetable(),
    ]);

  return {
    groups,
    ranges,
    pkgs,
    rules,
    users,
    people,
    programs: programs.filter((p) => !p.deleted),
    settings: addSettingsDefaults(timetable),
    timetable: addTimetableDefaults(timetable),
  };
}

// TODO deduplicate these helper functions
function addTimetableDefaults(data) {
  return {
    title: null,
    layoutVersion: "v1",
    ...data,
  };
}

const DEFAULT_TIME_STEP = 15 * 60 * 1000;
const DEFAULT_WIDTH = 100;

function addSettingsDefaults(data) {
  return {
    timeStep: DEFAULT_TIME_STEP,
    width: DEFAULT_WIDTH,
    groupLock: false,
    ...(data && data.settings ? data.settings : {}),
  };
}

export const testing = {
  getIdentity,
  getOptions,
};
