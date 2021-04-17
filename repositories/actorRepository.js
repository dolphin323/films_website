const ActorModel = require('../models/actor');
const FilmModel = require('../models/film');
// const fs = require('fs');
class ActorRepository {

    constructor() {

    }
    async addActor(actor) {
        const result = await new ActorModel(actor).save();
        return result.toJSON()._id;
    }

    async getActors() {
        const actorDocs = await ActorModel.find({});
        const actorsArr = actorDocs.map(i => i.toJSON());
        return actorsArr;
    }

    async getActorsByName(name) {
        let items = await this.getActors();
        items = items.filter(item => item.name_surname.includes(name));
        return items;
    }

    async getActorById(id) {
        const actor = await ActorModel.findOne({ _id: id });
        return actor;
    }

    async updateActor(actor_id, actor) {
        const updateInfo = await ActorModel.updateOne({ _id: actor_id }, {
            $set: {
                name_surname: actor.name_surname,
                gender: actor.gender,
                birthday: actor.birthday,
                height: actor.height
            }
        });
    }
    async updateActorPhoto(film_id, media_path) {
        const updateInfo = await ActorModel.updateOne({ _id: film_id }, { $set: { media_path: media_path } });
        return updateInfo;
    }
    async deleteActor(actor_id) {
        try {
            const updateInfo = await FilmModel.updateMany({ actors_id: actor_id }, { '$pull': { 'actors_id': actor_id } });
            const result = await ActorModel.deleteOne({ _id: actor_id });
            return result;
        } catch (err) {
            throw err
        }
    }
};

module.exports = ActorRepository;