import { http } from "@google-cloud/functions-framework";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { isValidTimetableId } from "@scout-planner/common/timetableIdUtils";
import { level } from "@scout-planner/common/level";
import { Client } from "./client";
import { corsMiddleware } from "@scout-planner/common/corsMiddleware";
import { authMiddleware } from "@scout-planner/common/authMiddleware";

http("shift-timetable", async (req, res) =>
  corsMiddleware(["POST"])(req, res, async () =>
    authMiddleware(req, res, async () => shiftTimetable(req, res)),
  ),
);

initializeApp();

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

async function shiftTimetable(req, res) {
  let options = null;
  try {
    options = getOptions(req);
    console.debug(
      "Got table: '%s' and offset: '%s'",
      options.table,
      options.offset,
    );
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Invalid parameters" });
    return;
  }

  try {
    const accessLevel = await getAccessLevel(db, options.source, req.email);
    console.debug("Got access level to table: %d", accessLevel);
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
    await shift(db, options.table, options.offset);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
    return;
  }

  console.debug("Successfully shifted");
  res.status(200).send({ message: "Successfullly shifted" });
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

async function shift(db, table, offset) {
  const client = new Client(table, db);
  const data = await loadData(client);

  const shifted = {
    programs: shiftPrograms(data.programs, offset),
    rules: shiftRules(data.rules, offset),
    people: shiftPeople(data.people, offset),
  };
  await updateData(client, shifted);
}

async function loadData(client) {
  const [programs, rules, people] = await Promise.all([
    client.getPrograms(),
    client.getRules(),
    client.getPeople(),
  ]);
  return { programs, rules, people };
}

function shiftPrograms(programs, offset) {
  return programs.flatMap((p) =>
    // programs without valid begin property should be exluded because we do
    // not want to update those
    Number.isFinite(p.begin) ? [{ _id: p._id, begin: p.begin + offset }] : [],
  );
}

function shiftRules(rules, offset) {
  return rules.flatMap((r) =>
    (r.condition === "is_after_date" || r.condition === "is_before_date") &&
    Number.isFinite(r.value)
      ? [{ _id: r._id, value: r.value + offset }]
      : [],
  );
}

function shiftPeople(people, offset) {
  return people.flatMap((person) =>
    person.absence?.length > 0
      ? [{ _id: person._id, absence: shiftAbsence(person.absence, offset) }]
      : [],
  );
}

function shiftAbsence(absence, offset) {
  return absence.flatMap((a) =>
    Number.isFinite(a.begin) && Number.isFinite(a.end)
      ? {
          ...a,
          begin: a.begin + offset,
          end: a.end + offset,
        }
      : [],
  );
}

async function updateData(client, data) {
  return Promise.all([
    ...data.programs.map((p) => client.patchProgram(p)),
    ...data.rules.map((r) => client.patchRule(r)),
    ...data.people.map((p) => client.patchPerson(p)),
  ]);
}

export const testing = {
  getOptions,
  loadData,
  shiftPrograms,
  shiftRules,
  shiftPeople,
  updateData,
};
