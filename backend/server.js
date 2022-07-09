var express = require("express");
var app = express();
var port = process.env.PORT || 4000;
var bodyParser = require("body-parser");
var cors = require("cors");

const { OAuth2Client } = require("google-auth-library");
const clientId =
  "684457012621-3g1skhe5pi3r6knlug7scfsn4iao8a79.apps.googleusercontent.com";
const client = new OAuth2Client(clientId);

var Firestore = require("@google-cloud/firestore");
var db = new Firestore();

app.use(cors());
app.options("*", cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/_ah/warmup", (req, res) => {
  db = new Firestore();
  res.send("");
});

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
    var ticket;

    try {
      ticket = await client.verifyIdToken({
        idToken: req.headers.authorization,
        audience: clientId,
      });
    } catch (err) {
      res.status(401).json({ error: err.message });
      return;
    }

    if (!ticket.getPayload().email_verified) {
      res.status(401).json({ error: "Email not verified." });
      return;
    }

    req.email = ticket.getPayload().email;
  }

  next();
});

["programs", "packages", "rules", "groups", "ranges"].forEach((collection) => {
  app
    .route(`/api/:table/${collection}`)
    .get(getAllItems(collection))
    .post(createItem(collection));

  app
    .route(`/api/:table/${collection}/:id`)
    .get(getItem(collection))
    .put(updateItem(collection))
    .delete(deleteItem(collection));
});

app.use((err, req, res, next) => res.status(500).json({ error: err.message }));

app.use(function (req, res) {
  res.status(404).send({ url: req.originalUrl + " not found" });
});

app.listen(port);

console.log("Server started at port: " + port);
