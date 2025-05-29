import { getAuth } from "firebase-admin/auth";

export const authMiddleware = async (req, res, next) => {
  try {
    req.email = await getIdentity(req);
    console.debug("Got customer email: '%s'", req.email);
  } catch (error) {
    console.error(error);
    res.status(401).send({ message: "Unauthorized" });
    return;
  }

  await next();
};

async function getIdentity(req) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const idToken = authorizationHeader.split("Bearer ")[1];

  const token = await getAuth().verifyIdToken(idToken);

  return token.email;
}

export const testing = {
  getIdentity,
};
