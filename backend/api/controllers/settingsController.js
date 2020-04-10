'use strict';

var mongoose = require('mongoose'),
  Settings = mongoose.model('Settings');

exports.get_settings = function(req, res) {
  Settings.findOne({}, function(err, settings) {
    if (err)
      res.send(err);

    if (settings) {
      res.json(settings);
    } else {
      var newSettings = new Settings({
        days: [],
        dayStart: Date.UTC(1970, 0, 1, 0, 0),
        dayEnd: Date.UTC(1970, 0, 1, 23, 59, 59),
        timeStep: 15*60*1000,
      });
      newSettings.save(function(err, settings) {
        if (err)
          res.send(err);
        res.json(settings);
      });
    }
  });
};

exports.update_settings = function(req, res) {
  Settings.findOneAndUpdate({}, req.body, {new: true}, function(err, settings) {
    if (err)
      res.send(err);
    res.json(settings);
  });
};

exports.delete_settings = function(req, res) {
  Settings.findOneAndRemove({}, function(err, settings) {
    if (err)
      res.send(err);
    res.json({ message: 'Settings successfully deleted' });
  });
};
