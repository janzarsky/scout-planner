'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SettingsSchema = new Schema({
  days: [Number],
  dayStart: Number,
  dayEnd: Number,
  timeStep: Number,
});

module.exports = mongoose.model('Settings', SettingsSchema);
