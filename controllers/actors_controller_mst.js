const path = require('path');
const { nextTick } = require('process');
const actorRepository = require(path.resolve(__dirname, '../repositories/actorRepository'));
const actorRepo = new actorRepository();
const Actor = require(path.resolve(__dirname, '../models/actor'));
const fs = require('fs');
require('dotenv').config();

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

function pagination(items, page, per_page) {
    const startInd = (page - 1) * per_page;
    const endInd = page * per_page;
    return (items.slice(startInd, endInd));
}

function ToUserFriendlyDate(Actors) {
    Actors.forEach(element => {
        date = new Date(element.birthday);
        element.birthday = date.toUTCString().replace('GMT', '');
        element.birthday = element.birthday.split(' ')[0] + " " + element.birthday.split(' ')[1] + " " + element.birthday.split(' ')[2] + " " + element.birthday.split(' ')[3];
    });
    return Actors;
}

async function uploadRaw(buffer) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ resource_type: 'raw' },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            .end(buffer);
    });
}

module.exports = {
    async getActors(req, res) {
        let page;

        if (req.query.page && isNaN(req.query.page)) {
            res.status(400).send({ mess: 'page and per_page should be a number' });
            return;
        }

        if (!req.query.page) {
            page = 1;
        } else {
            page = parseInt(req.query.page);
        }

        const per_page = 4;

        let Actors;

        let name = "";
        try {
            if (req.query.name) {
                Actors = await actorRepo.getActorsByName(req.query.name);
                name = req.query.name;
            } else {
                Actors = await actorRepo.getActors();
            }

            const Pag_actors = pagination(Actors, page, per_page);

            let class_prev;
            let class_next;

            if (page > 1) {
                class_prev = "";
            } else {
                class_prev = "disabled_link";
            }

            if (page * per_page < Actors.length) {
                class_next = "";
            } else {
                class_next = "disabled_link";
            }

            let max_page = Math.ceil(parseInt(Actors.length) / (per_page));
            if (max_page == 0) {
                max_page = 1;
            }
            const Actor_friendly = ToUserFriendlyDate(Pag_actors);
            res.render('actors', { actors: Actor_friendly, search_name: name, actor_current: 'current', next_page: page + 1, previous_page: page - 1, page, class_prev, class_next, max_page, actor_link: 'disabled_link' });
        } catch (err) {
            res.status(404).send({ error: 'Cannot get actors' })
        }
    },

    async getActorById(req, res) {
        try {
            const Actor = await actorRepo.getActorById(req.params.id);
            date = new Date(Actor.birthday);
            date = date.toUTCString().replace('GMT', '')
            date = date.split(' ')[0] + " " + date.split(' ')[1] + " " + date.split(' ')[2] + " " + date.split(' ')[3];
            res.render('actor', { actor: Actor, birthday: date, actor_current: 'current' });
        } catch (err) {
            res.status(404).send({ error: 'Cannot get actors by id' })
        }
    },

    newActor(req, res) {
        res.render('add_actor');
    },

    async postActor(req, res) {
        const gender = req.body.gender;
        const name_surname = req.body.name_surname;
        const height = parseFloat(req.body.height);
        const birthday = req.body.birthday;
        let media_path = "";
        try {
            if (req.files['photo']) {


                const o = await uploadRaw(req.files['photo'].data)
                media_path = o.url;

            }
        } catch (err) {
            res.status(500).send({ error: 'Cannot upload photo' })
        }
        const actor = {
            name_surname: name_surname,
            gender: gender,
            birthday: birthday,
            height: height,
            media_path: media_path
        };
        try {
            const id = await actorRepo.addActor(actor);

            res.redirect('/actors/' + id);
        } catch (err) {
            res.status(404).send({ error: 'Cannot get actors by id' })
        }
    },


    async deleteActor(req, res) {
        try {
            const result = await actorRepo.deleteActor(req.params.id);
            res.redirect('/actors');
        } catch (err) {
            res.status(404).send({ error: 'Cannot delete actor' })
        }
    },
    async getupdateActor(req, res) {
        try {
            const Actor = await actorRepo.getActorById(req.params.id);

            const srt = Actor.birthday.toISOString();
            res.render('update_actor', { actor: Actor, id: req.params.id, birthday: srt.split('T')[0] });
        } catch (err) {
            res.status(404).send({ error: 'Cannot get actors by id' })
        }
    },
    async updateActor(req, res) {
        const gender = req.body.gender;
        const name_surname = req.body.name_surname;
        const height = parseFloat(req.body.height);
        const birthday = req.body.birthday;
        const Actor = {
            name_surname: name_surname,
            gender: gender,
            birthday: birthday,
            height: height
        };
        try {
            const result = await actorRepo.updateActor(req.params.id, Actor);
            res.redirect('/actors/' + req.params.id);
        } catch (err) {
            res.status(404).send({ error: 'Cannot update actor' })
        }
    },
    async getupdateActorPhoto(req, res) {
        res.render('update_actor_photo', { id: req.params.id });
    },
    async updateActorPhoto(req, res) {
        let media_path = "";
        try {
            if (req.files['photo']) {
                const o = await uploadRaw(req.files['photo'].data)
                media_path = o.url;
            }
        } catch (err) {
            res.status(500).send({ error: 'Cannot upload photo' })
        }
        try {
            const updateinfo = await actorRepo.updateActorPhoto(req.params.id, media_path);
            res.redirect('/actors/' + req.params.id);
        } catch (err) {
            res.status(500).send({ error: 'Cannot update photo' })
        }
    }
}