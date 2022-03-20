var express = require('express');
var app = express();
var port = process.env.PORT || 4000;
var bodyParser = require('body-parser');
var cors = require('cors');

var Firestore = require('@google-cloud/firestore');
var db = new Firestore()

app.use(cors());
app.options('*', cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/_ah/warmup', (req, res) => {
  db = new Firestore()
  res.send('')
});

var get_all_programs = function(req, res) {
  db.collection('programs')
    .where('table', '==', req.params.table)
    .get()
    .then(querySnapshot =>
      res.json(querySnapshot.docs.map(docSnapshot => ({ ...docSnapshot.data(), _id: docSnapshot.id })))
    )
    .catch(err => res.send(err))
};

var create_program = function(req, res) {
  var prog = {
    ...req.body,
    table: req.params.table
  };
  db.collection('programs')
    .add(prog)
    .then(doc => res.send({ ...prog, _id: doc.id }))
    .catch(err => res.send(err))
};

var delete_program = function(req, res) {
  db.doc(`programs/${req.params.id}`)
    .delete()
    .then(() => res.json({ message: 'Program successfully deleted' }))
    .catch(err => res.send(err))
};

var get_program = function(req, res) {
  db.doc(`programs/${req.params.id}`)
    .get()
    .then(docSnapshot => res.json({ ...docSnapshot.data(), _id: docSnapshot.id }))
    .catch(err => res.send(err))
};

var update_program = function(req, res) {
  var prog = {
    ...req.body,
    table: req.params.table,
  };
  db.doc(`programs/${req.params.id}`)
    .update(prog)
    .then(() => res.json({ ...prog, _id: req.params.id }))
    .catch(err => res.send(err))
};

app.route('/api/:table/programs')
  .get(get_all_programs)
  .post(create_program);

app.route('/api/:table/programs/:id')
  .get(get_program)
  .put(update_program)
  .delete(delete_program);

var get_all_pkgs = function(req, res) {
  db.collection('packages')
    .where('table', '==', req.params.table)
    .get()
    .then(querySnapshot =>
      res.json(querySnapshot.docs.map(docSnapshot => ({ ...docSnapshot.data(), _id: docSnapshot.id })))
    )
    .catch(err => res.send(err))
};

var create_pkg = function(req, res) {
  var pkg = {
    ...req.body,
    table: req.params.table
  };
  db.collection('packages')
    .add(pkg)
    .then(doc => res.send({ ...pkg, _id: doc.id }))
    .catch(err => res.send(err))
};

var delete_pkg = function(req, res) {
  db.doc(`packages/${req.params.id}`)
    .delete()
    .then(() => res.json({ message: 'Package successfully deleted' }))
    .catch(err => res.send(err))
};

var get_pkg = function(req, res) {
  db.doc(`packages/${req.params.id}`)
    .get()
    .then(docSnapshot => res.json({ ...docSnapshot.data(), _id: docSnapshot.id }))
    .catch(err => res.send(err))
};

var update_pkg = function(req, res) {
  var pkg = {
    ...req.body,
    table: req.params.table,
  };
  db.doc(`packages/${req.params.id}`)
    .update(pkg)
    .then(() => res.json({ ...pkg, _id: req.params.id }))
    .catch(err => res.send(err))
};

app.route('/api/:table/pkgs')
  .get(get_all_pkgs)
  .post(create_pkg);

app.route('/api/:table/pkgs/:id')
  .get(get_pkg)
  .put(update_pkg)
  .delete(delete_pkg);

var get_all_rules = function(req, res) {
  db.collection('rules')
    .where('table', '==', req.params.table)
    .get()
    .then(querySnapshot =>
      res.json(querySnapshot.docs.map(docSnapshot => ({ ...docSnapshot.data(), _id: docSnapshot.id })))
    )
    .catch(err => res.send(err))
};

var create_rule = function(req, res) {
  var rule = {
    ...req.body,
    table: req.params.table
  };
  db.collection('rules')
    .add(rule)
    .then(doc => res.send({ ...rule, _id: doc.id }))
    .catch(err => res.send(err))
};

var delete_rule = function(req, res) {
  db.doc(`rules/${req.params.id}`)
    .delete()
    .then(() => res.json({ message: 'Rule successfully deleted' }))
    .catch(err => res.send(err))
};

var get_rule = function(req, res) {
  db.doc(`rules/${req.params.id}`)
    .get()
    .then(docSnapshot => res.json({ ...docSnapshot.data(), _id: docSnapshot.id }))
    .catch(err => res.send(err))
};

var update_rule = function(req, res) {
  var rule = {
    ...req.body,
    table: req.params.table,
  };
  db.doc(`rules/${req.params.id}`)
    .update(rule)
    .then(() => res.json({ ...rule, _id: req.params.id }))
    .catch(err => res.send(err))
};

app.route('/api/:table/rules')
  .get(get_all_rules)
  .post(create_rule);

app.route('/api/:table/rules/:id')
  .get(get_rule)
  .put(update_rule)
  .delete(delete_rule);

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(port);

console.log('Server started at port: ' + port);
