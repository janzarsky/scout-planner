import { http } from "@google-cloud/functions-framework";
import { initializeApp } from "firebase-admin/app";
import { corsMiddleware } from "@scout-planner/common/corsMiddleware";
import { authMiddleware } from "@scout-planner/common/authMiddleware";

http("create-timetable", async (req, res) =>
  corsMiddleware(["POST"])(req, res, async () =>
    authMiddleware(req, res, async () => createTimetable(req, res)),
  ),
);

initializeApp();

async function createTimetable(req, res) {
  console.error("Not implemented");
  res.status(500).send({ message: "Internal server error" });
}
