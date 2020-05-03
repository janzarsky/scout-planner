'use strict';

var mongoose = require('mongoose'),
  Rule = mongoose.model('Rule');

exports.get_all_rules = function(req, res) {
  Rule.find({ table: req.params.table }, function(err, rules) {
    if (err)
      res.send(err);
    res.json(rules);
  });
};

exports.create_rule = function(req, res) {
  var new_rule = new Rule(req.body);
  new_rule.table = req.params.table;
  new_rule.save(function(err, rule) {
    if (err)
      res.send(err);
    res.json(rule);
  });
};

exports.delete_rule = function(req, res) {
  Rule.findOneAndDelete({ _id: req.params.id, table: req.params.table }, function(err, rule) {
    if (err)
      res.send(err);
    res.json({ message: 'Package successfully deleted' });
  });
};

exports.get_rule = function(req, res) {
  Rule.findOne({ _id: req.params.id, table: req.params.table }, function(err, rule) {
    if (err)
      res.send(err);
    res.json(rule);
  });
};

exports.update_rule = function(req, res) {
  Rule.findOneAndUpdate({ _id: req.params.id, table: req.params.table }, req.body, {new: true}, function(err, rule) {
    if (err)
      res.send(err);
    res.json(rule);
  });
};
