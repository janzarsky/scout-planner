import { http } from "@google-cloud/functions-framework";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { corsMiddleware } from "@scout-planner/common/corsMiddleware";
import { createAuthMiddleware } from "@scout-planner/common/authMiddleware";

const app = initializeApp();
const auth = getAuth(app);

const authMiddleware = createAuthMiddleware(auth);

http("create-timetable", async (req, res) =>
  corsMiddleware(["POST"])(req, res, async () =>
    authMiddleware(req, res, async () => createTimetable(req, res)),
  ),
);

async function createTimetable(req, res) {
  console.error("Not implemented");
  res.status(500).send({ message: "Internal server error" });
}
