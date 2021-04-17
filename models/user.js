// models/user.js
const mongoose = require('mongoose');

/**
 * @typedef User
 * @property {integer} id - user id
 * @property {string} login.required - login
 * @property {string} fullname.required - username
 * @property {integer} role - 0 user, 1 admin
 * @property {string} registeredAt - string ISO 8601
 * @property {string} avaUrl - URL
 * @property {integer} isEnabled - 0 activ 1 disactive
 */

const UserSchema = new mongoose.Schema({
    login: { type: String },
    fullname: { type: String },
    role: { type: Boolean },
    registeredAt: { type: Date, default: Date.now },
    avaUrl: { type: String },
    isEnabled: { type: Boolean },
    Bio: { type: String },
    films_id: [{ type: mongoose.mongo.ObjectId, ref: "films" }]
});

module.exports = mongoose.model('Users', UserSchema);