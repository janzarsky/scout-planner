import { http } from "@google-cloud/functions-framework";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { isValidTimetableId } from "@scout-planner/common/timetableIdUtils";
import { getAuth } from "firebase-admin/auth";
import { level } from "@scout-planner/common/level";
import { Client } from "./client";

http("shift-timetable", shiftTimetable);

initializeApp();

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

async function shiftTimetable(req, res) {
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
      `Got table: "${options.table}" and offset: "${options.offset}"`,
    );
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Invalid parameters" });
    return;
  }

  try {
    const accessLevel = await getAccessLevel(db, options.source, email);
    console.debug(`Got access level to table: ${accessLevel}`);
    if (accessLevel < level.EDIT) {
      res.status(403).send({ message: "Access to table forbidden" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }

  try {
    await shiftData(db, options.table, options.offset);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }

  console.debug("Successfully shifted");
  res.status(200).send({ message: "Successfullly shifted" });
}

// TODO: unify across functions
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
  const table = req.query.table;
  if (!table) throw new Error("Invalid parameters");

  const offset = parseInt(req.query.offset);
  if (isNaN(offset)) throw new Error("Invalid parameters");

  if (!isValidTimetableId(table)) throw new Error("Invalid source ID");

  return { table, offset };
}

async function getAccessLevel(db, table, user) {
  const client = new Client(table, db);
  return await client.getAccessLevel(user);
}

async function shiftData(db, table, offset) {
  console.debug(`Shifting: ${db}, ${table}, ${offset}`);
  throw new Error("Not implemented");
}

export const testing = { getOptions };
