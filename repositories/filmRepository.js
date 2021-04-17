const FilmModel = require('../models/film');
const UserModel = require('../models/user');
// const fs = require('fs');
class FilmRepository {

    constructor() {

    }
    async addFilm(film) {

        const result = await new FilmModel(film).save();
        return result.toJSON()._id;

    }

    async getFilms() {

        const filmDocs = await FilmModel.find({});
        const filmsArr = filmDocs.map(i => i.toJSON());
        return filmsArr;

    }

    async getFilmsByName(name) {

        let items = await this.getFilms();
        items = items.filter(item => item.name.includes(name));
        return items;

    }

    async getFilmById(id) {

        const film = await FilmModel.findOne({ _id: id }).populate("actors_id", ["_id", "name_surname"]);
        return film;

    }

    async updateFilm(film_id, film) {

        const updateInfo = await FilmModel.updateOne({ _id: film_id }, { $set: { genre: film.genre, name: film.name, year: film.year, rate: film.rate } });


    }
    async updateFilmPhoto(film_id, media_path) {

        const updateInfo = await FilmModel.updateOne({ _id: film_id }, { $set: { media_path: media_path } });

    }
    async deleteFilm(film_id) {

        const updateInfo = await UserModel.updateMany({ films_id: film_id }, { '$pull': { 'films_id': film_id } });
        const result = await FilmModel.deleteOne({ _id: film_id });
        return result;

    }
    async addActorToList(film_id, actor_id) {

        const updateInfo = await FilmModel.updateOne({ _id: film_id }, { '$addToSet': { 'actors_id': actor_id } });

    }
    async deleteActorFromList(film_id, actor_id) {
        const updateInfo = await FilmModel.updateOne({ _id: film_id }, { '$pull': { 'actors_id': actor_id } });
    }
};

module.exports = FilmRepository;