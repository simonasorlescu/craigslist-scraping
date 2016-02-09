var mongoose = require('mongoose');
var config = require('../config');

console.log(config);

// create a job model
var jobSchema = new mongoose.Schema({
  title: String,
  url: String,
});

module.exports = mongoose.model('Job', jobSchema);
