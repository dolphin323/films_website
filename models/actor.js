// models/actor.js
const mongoose = require('mongoose');

const ActorSchema = new mongoose.Schema({
    name_surname: { type: String },
    gender: { type: String },
    birthday: { type: Date },
    height: { type: Number },
    media_path: { type: String }
});

module.exports = mongoose.model('actors', ActorSchema);