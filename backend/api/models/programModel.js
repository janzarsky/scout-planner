'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProgramSchema = new Schema({
  table: String,
  title: String,
  begin: Number,
  duration: Number,
  pkg: String,
  groups: [String],
  people: [String],
  url: String,
  notes: String,
});

module.exports = mongoose.model('Programs', ProgramSchema);
