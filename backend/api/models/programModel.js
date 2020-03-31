'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProgramSchema = new Schema({
  title: String,
  begin: Number,
  duration: Number,
  pkg: String,
  people: [String],
});

module.exports = mongoose.model('Programs', ProgramSchema);
