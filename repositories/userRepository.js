const UserModel = require('../models/user');
class UserRepository {

    constructor() {

    }

    async getUsers() {
        const userDocs = await UserModel.find({});
        const usersArr = userDocs.map(i => i.toJSON());
        return usersArr;
    }

    async getUserById(id) {

        const user = await UserModel.findById(id).populate("films_id", ["_id", "name", "genre"]);
        return user;

    }
    async addFilmToList(user_id, film_id) {

        const updateInfo = await UserModel.updateOne({ _id: user_id }, { '$addToSet': { 'films_id': film_id } });

    }
    async deleteFilmFromList(user_id, film_id) {

        const updateInfo = await UserModel.updateOne({ _id: user_id }, { '$pull': { 'films_id': film_id } });

    }
};

module.exports = UserRepository;