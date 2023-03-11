var express = require("express");
var app = express();
var port = process.env.PORT || 4000;
var bodyParser = require("body-parser");
var cors = require("cors");

const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
initializeApp();

var Firestore = require("@google-cloud/firestore");
var db = new Firestore();

app.use(cors());
app.options("*", cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/_ah/warmup", (_req, res) => {
  db = new Firestore();
  res.send("");
});

const NONE = 0;
const VIEW = 1;
const EDIT = 2;
const ADMIN = 3;

async function getUsers(table) {
  return db
    .collection("users")
    .where("table", "==", table)
    .get()
    .then((querySnapshot) =>
      querySnapshot.docs.map((docSnapshot) => docSnapshot.data())
    );
}

function getAllowedLevel(users, email) {
  const user = users.find((user) => user.email === email);

  if (user) return user.level;

  // this is required so that new tables can be created
  if (email === "public") return ADMIN;

  return NONE;
}

function authorize(level) {
  return async function (req, res, next) {
    const users = await getUsers(req.params.table);

    if (req.email && getAllowedLevel(users, req.email) >= level) {
      next();
    } else if (getAllowedLevel(users, "public") >= level) {
      next();
    } else {
      res
        .status(403)
        .json({ error: "You do not have sufficient permissions." });
    }
  };
}

function getAllItems(collection) {
  return function (req, res) {
    db.collection(collection)
      .where("table", "==", req.params.table)
      .get()
      .then((querySnapshot) =>
        res.json(
          querySnapshot.docs.map((docSnapshot) => ({
            ...docSnapshot.data(),
            _id: docSnapshot.id,
          }))
        )
      );
  };
}

function createItem(collection) {
  return function (req, res) {
    var item = {
      ...req.body,
      table: req.params.table,
    };
    db.collection(collection)
      .add(item)
      .then((doc) => res.json({ ...item, _id: doc.id }));
  };
}

function deleteItem(collection) {
  return function (req, res) {
    db.doc(`${collection}/${req.params.id}`)
      .delete()
      .then(() => res.json({}));
  };
}

function getItem(collection) {
  return function (req, res) {
    db.doc(`${collection}/${req.params.id}`)
      .get()
      .then((docSnapshot) =>
        res.json({ ...docSnapshot.data(), _id: docSnapshot.id })
      );
  };
}

function updateItem(collection) {
  return function (req, res) {
    var item = {
      ...req.body,
      table: req.params.table,
    };
    db.doc(`${collection}/${req.params.id}`)
      .update(item)
      .then(() => res.json({ ...item, _id: req.params.id }));
  };
}

app.use(async (req, res, next) => {
  if (req.headers.authorization) {
    var decodedToken;

    try {
      decodedToken = await getAuth().verifyIdToken(req.headers.authorization);
    } catch (err) {
      res.status(401).json({ error: err.message });
      return;
    }

    if (!decodedToken.email_verified) {
      res.status(401).json({ error: "Email not verified." });
      return;
    }

    req.email = decodedToken.email;
  }

  next();
});

["programs", "packages", "rules", "groups", "ranges", "people"].forEach(
  (collection) => {
    app
      .route(`/api/:table/${collection}`)
      .get(authorize(VIEW), getAllItems(collection))
      .post(authorize(EDIT), createItem(collection));

    app
      .route(`/api/:table/${collection}/:id`)
      .get(authorize(VIEW), getItem(collection))
      .put(authorize(EDIT), updateItem(collection))
      .delete(authorize(EDIT), deleteItem(collection));
  }
);

app
  .route(`/api/:table/users`)
  .get(authorize(ADMIN), getAllItems("users"))
  .post(authorize(ADMIN), createItem("users"));

app
  .route(`/api/:table/users/:id`)
  .get(authorize(ADMIN), getItem("users"))
  .put(authorize(ADMIN), updateItem("users"))
  .delete(authorize(ADMIN), deleteItem("users"));

app
  .route(`/api/:table/settings`)
  .get(authorize(VIEW), async (req, res) =>
    db
      .collection("settings")
      .where("table", "==", req.params.table)
      .limit(1)
      .get()
      .then((querySnapshot) =>
        res.json(querySnapshot.size > 0 ? querySnapshot.docs[0].data() : {})
      )
  )
  .put(authorize(EDIT), async (req, res) =>
    db
      .collection("settings")
      .where("table", "==", req.params.table)
      .limit(1)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.size > 0) {
          db.doc(`settings/${querySnapshot.docs[0].id}`)
            .update({ ...req.body, table: req.params.table })
            .then(() => res.send());
        } else {
          db.collection("settings")
            .add({ ...req.body, table: req.params.table })
            .then(() => res.send());
        }
      })
  );

app.get("/api/:table/permissions", async (req, res) => {
  const users = await getUsers(req.params.table);

  const userLevel = req.email ? getAllowedLevel(users, req.email) : NONE;
  const publicLevel = getAllowedLevel(users, "public");

  res.json({ level: userLevel > publicLevel ? userLevel : publicLevel });
});

app.use((err, _req, res) => res.status(500).json({ error: err.message }));

app.use(function (req, res) {
  res.status(404).send({ url: req.originalUrl + " not found" });
});

app.listen(port);

console.log("Server started at port: " + port);
