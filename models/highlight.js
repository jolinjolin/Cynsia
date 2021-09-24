const mongoose = require('mongoose');

var highlightSchema = new mongoose.Schema({
   name: String,
   image: String,
   releaseDate: String,
});

module.exports = mongoose.model("highlight", highlightSchema);