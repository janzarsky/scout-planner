import { http } from "@google-cloud/functions-framework";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

  res.status(500).send({ message: "Not implemented" });
}
