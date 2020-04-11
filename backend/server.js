var config = require('./config.json');

var express = require('express'),
  app = express(),
  port = process.env.PORT || 4000,
  mongoose = require('mongoose'),
  Program = require('./api/models/programModel'),
  Pkg = require('./api/models/pkgModel'),
  Rule = require('./api/models/ruleModel'),
  bodyParser = require('body-parser'),
  cors = require('cors');

mongoose.Promise = global.Promise;
mongoose.connect(config.host, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.options('*', cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/routes');
routes(app);

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(port);

console.log('Server started at port: ' + port);
