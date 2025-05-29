import { http } from "@google-cloud/functions-framework";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { importData } from "@scout-planner/common/importer";
import { Client } from "./client";
import { level } from "@scout-planner/common/level";
import { isValidTimetableId } from "@scout-planner/common/timetableIdUtils";
import { corsMiddleware } from "@scout-planner/common/corsMiddleware";
import { authMiddleware } from "@scout-planner/common/authMiddleware";

http("clone-timetable", async (req, res) =>
  corsMiddleware(["POST"])(req, res, async () =>
    authMiddleware(req, res, async () => cloneTimetable(req, res)),
  ),
);

initializeApp();

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

async function cloneTimetable(req, res) {
  let options = null;
  try {
    options = getOptions(req);
    console.debug(
      "Got source: '%s' and destination: '%s'",
      options.source,
      options.destination,
    );
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Invalid parameters" });
    return;
  }

  try {
    const accessLevel = await getAccessLevel(db, options.source, req.email);
    console.debug("Got access level to source table: %d", accessLevel);
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
    const accessLevel = await getAccessLevel(
      db,
      options.destination,
      req.email,
    );
    console.debug("Got access level to destination table: %d", accessLevel);
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
  cloneTimetable,
  getOptions,
};
