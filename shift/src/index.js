import { http } from "@google-cloud/functions-framework";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { isValidTimetableId } from "@scout-planner/common/timetableIdValidator";

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

  let options = null;
  try {
    options = getOptions(req);
    console.debug(
      `Got source: "${options.source}" and offset: "${options.offset}"`,
    );
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Invalid parameters" });
    return;
  }

  res.status(500).send({ message: "Not implemented" });
}

function getOptions(req) {
  const source = req.query.source;
  if (!source) throw new Error("Invalid parameters");

  const offset = parseInt(req.query.offset);
  if (isNaN(offset)) throw new Error("Invalid parameters");

  if (!isValidTimetableId(source)) throw new Error("Invalid source ID");

  return { source, offset };
}

export const testing = { getOptions };
