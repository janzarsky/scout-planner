export const corsMiddleware = (allowedMethods) => async (req, res, next) => {
  // TODO: add specific origins
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", allowedMethods.join(", "));
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  if (!allowedMethods.includes(req.method)) {
    console.error("Method not allowed: " + req.method);
    res.set("Allow", allowedMethods.join(", "));
    res.status(405).send({ message: "Method not allowed" });
    return;
  }

  await next();
};
