'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PkgsSchema = new Schema({
  name: String,
  color: String,
});

module.exports = mongoose.model('Pkg', PkgsSchema);
