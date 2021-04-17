// models/film.js
const mongoose = require('mongoose');
/**
 * @typedef Film
 * @property {integer} id - film id
 * @property {string} genre.required - genre of film 
 * @property {string} name.required - name of film
 * @property {string} timeDownload - string ISO 8601
 * @property {integer} year.required - year of film
 * @property {numeric} rate.required - rate of film
 */
const FilmSchema = new mongoose.Schema({
    actors_id: { type: mongoose.mongo.ObjectId, ref: "Actors" },
    genre: { type: String },
    name: { type: String },
    timeDownload: { type: Date, default: Date.now },
    year: { type: String },
    rate: { type: Number },
    media_path: { type: String },
    actors_id: [{ type: mongoose.mongo.ObjectId, ref: "actors" }]
});

module.exports = mongoose.model('films', FilmSchema);