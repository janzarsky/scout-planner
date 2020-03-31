'use strict';

var mongoose = require('mongoose'),
  Program = mongoose.model('Programs');

exports.get_all_programs = function(req, res) {
  Program.find({}, function(err, programs) {
    if (err)
      res.send(err);
    res.json(programs);
  });
};

exports.create_program = function(req, res) {
  var new_prog = new Program(req.body);
  new_prog.save(function(err, program) {
    if (err)
      res.send(err);
    res.json(program);
  });
};

exports.delete_program = function(req, res) {
  Program.remove({ _id: req.params.id }, function(err, program) {
    if (err)
      res.send(err);
    res.json({ message: 'Program successfully deleted' });
  });
};

exports.get_program = function(req, res) {
  Program.findById(req.params.id, function(err, program) {
    if (err)
      res.send(err);
    res.json(program);
  });
};

exports.update_program = function(req, res) {
  Program.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, function(err, program) {
    if (err)
      res.send(err);
    res.json(program);
  });
};
