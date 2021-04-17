const path = require('path');
const { nextTick } = require('process');
const filmRepository = require(path.resolve(__dirname, '../repositories/filmRepository'));
const filmRepo = new filmRepository();

const actorRepository = require(path.resolve(__dirname, '../repositories/actorRepository'));
const actorRepo = new actorRepository();
const Film = require(path.resolve(__dirname, '../models/film'));
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
        console.log(element.birthday);
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
    async getFilms(req, res) {
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

        let Films;

        let name = "";
        try {
            if (req.query.name) {
                Films = await filmRepo.getFilmsByName(req.query.name);
                name = req.query.name;
            } else {
                Films = await filmRepo.getFilms();
            }
            const Pag_films = pagination(Films, page, per_page);

            let class_prev;
            let class_next;

            if (page > 1) {
                class_prev = "";
            } else {
                class_prev = "disabled_link";
            }

            if (page * per_page < Films.length) {
                class_next = "";
            } else {
                class_next = "disabled_link";
            }

            let max_page = Math.ceil(parseInt(Films.length) / (per_page));
            if (max_page == 0) {
                max_page = 1;
            }

            res.render('films', { films: Pag_films, search_name: name, film_current: 'current', next_page: page + 1, previous_page: page - 1, page, class_prev, class_next, max_page, film_link: 'disabled_link' });

        } catch (err) {
            res.status(404).send({ error: 'Cannot get films' })
        }
    },

    async getFilmById(req, res) {
        try {
            const Film = await filmRepo.getFilmById(req.params.id);

            res.render('film', { film: Film, actors: Film.actors_id, film_current: 'current' });
        } catch (err) {
            res.status(404).send({ error: 'Cannot get films by id' })
        }
    },
    newFilm(req, res) {
        res.render('add_film');
    },

    async postFilm(req, res) {
        let time = new Date();
        const genre = req.body.genre;
        const name = req.body.name;
        const year = req.body.year;
        const rate = req.body.rate;
        let media_path = "";
        try {
            if (req.files['photo']) {

                const o = await uploadRaw(req.files['photo'].data)
                media_path = o.url;

            }
        } catch (err) {
            res.status(500).send({ error: 'Cannot upload photo' })
        }
        const film = { genre: genre, name: name, timeDownload: time.toISOString(), year: year, rate: rate, media_path: media_path };
        try {
            const id = await filmRepo.addFilm(film);
            res.redirect('/films/' + id);
        } catch (err) {
            res.status(500).send({ error: 'Cannot add film' })
        }
    },


    async deleteFilm(req, res) {
        filmRepo.deleteFilm(req.params.id);
        res.redirect('/films');
    },
    async getupdateFilm(req, res) {
        try {
            const Film = await filmRepo.getFilmById(req.params.id);
            res.render('update_film', { film: Film, id: req.params.id });
        } catch (err) {
            res.status(404).send({ error: 'Cannot get film by id' })
        }
    },
    async updateFilm(req, res) {
        const genre = req.body.genre;
        const name = req.body.name;
        const year = req.body.year;
        const rate = req.body.rate;
        const film = { genre: genre, name: name, year: year, rate: rate };

        filmRepo.updateFilm(req.params.id, film);
        res.redirect('/films/' + req.params.id);
    },
    async getupdateFilmPhoto(req, res) {
        res.render('update_film_photo', { id: req.params.id });
    },
    async updateFilmPhoto(req, res) {
        let media_path = "";
        try {
            if (req.files['photo']) {

                const o = await uploadRaw(req.files['photo'].data)
                media_path = o.url;

            }
        } catch (err) {
            res.status(500).send({ error: 'Cannot upload photo' })
        }
        filmRepo.updateFilmPhoto(req.params.id, media_path);
        res.redirect('/films/' + req.params.id);
    },
    async addActor(req, res) {
        try {
            Actors = await actorRepo.getActors();
        } catch (err) {
            res.status(404).send({ error: 'Cannot get actors' })
        }
        res.render('add_actor_to_film', { film_id: req.params.id, actors: Actors });
    },
    async postAddActor(req, res) {
        const actor_id = req.body.actors;
        const film_id = req.params.id;
        await filmRepo.addActorToList(film_id, actor_id);
        res.redirect('/films/' + film_id);
    },
    async deleteActor(req, res) {
        try {
            const Film = await filmRepo.getFilmById(req.params.id);
            res.render('delete_actor_from_film', { film_id: req.params.id, actors: Film.actors_id });
        } catch (err) {
            res.status(404).send({ error: 'Cannot get film by id' })
        }
    },
    async postDelActor(req, res) {
        const actor_id = req.body.actors;
        const film_id = req.params.id;
        await filmRepo.deleteActorFromList(film_id, actor_id);
        res.redirect('/films/' + film_id);
    }
}