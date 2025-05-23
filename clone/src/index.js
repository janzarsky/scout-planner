import { http } from "@google-cloud/functions-framework";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { importData } from "@scout-planner/common/importer";
import { Client } from "./client";
import { level } from "@scout-planner/common/level";
import { isValidTimetableId } from "@scout-planner/common/timetableIdUtils";

http("clone-timetable", cloneTimetable);

initializeApp();

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

async function cloneTimetable(req, res) {
  // TODO: add specific origins
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  let email = null;
  try {
    email = await getIdentity(req);
    console.debug(`Got customer email: "${email}"`);
  } catch (error) {
    console.error(error);
    res.status(401).send({ message: "Unauthorized" });
    return;
  }

  let options = null;
  try {
    options = getOptions(req);
    console.debug(
      `Got source: "${options.source}" and destination: "${options.destination}"`,
    );
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Invalid parameters" });
    return;
  }

  try {
    const accessLevel = await getAccessLevel(db, options.source, email);
    console.debug(`Got access level to source table: ${accessLevel}`);
    if (accessLevel < level.VIEW) {
      res.status(403).send({ message: "Access to source table forbidden" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }

  try {
    const accessLevel = await getAccessLevel(db, options.destination, email);
    console.debug(`Got access level to destination table: ${accessLevel}`);
    if (accessLevel < level.ADMIN) {
      res
        .status(403)
        .send({ message: "Access to destination table forbidden" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }

  try {
    await cloneData(db, options.source, options.destination);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }

  console.debug("Successfully cloned");
  res.status(200).send({ message: "Successfullly cloned" });
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

  if (source === destination)
    throw new Error("Source and destination cannot be the same");

  if (!isValidTimetableId(source)) throw new Error("Invalid source ID");

  if (!isValidTimetableId(destination))
    throw new Error("Invalid destination ID");

  return { source, destination };
}

async function getAccessLevel(db, table, user) {
  const client = new Client(table, db);
  return await client.getAccessLevel(user);
}

async function cloneData(db, source, destination) {
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
