const path = require('path');
const User = require('../models/user');
const userRepository = require(path.resolve(__dirname, '../repositories/userRepository'));
const userRepo = new userRepository();

const filmRepository = require(path.resolve(__dirname, '../repositories/filmRepository'));
const filmRepo = new filmRepository();


function pagination(items, page, per_page) {
    const startInd = (page - 1) * per_page;
    const endInd = page * per_page;
    return (items.slice(startInd, endInd));

}

function ToUserFriendlyDate(Users) {
    Users.forEach(element => {
        date = new Date(element.registeredAt);
        element.registeredAt = date.toUTCString().replace('GMT', '');
    });
    return Users;

}

module.exports = {
    async getUsers(req, res) {
        let page, per_page;
        if (req.query.per_page && isNaN(req.query.per_page)) {
            res.status(400).send({ mess: 'per_page and page should be a number' });
            return;
        }

        if (req.query.page && isNaN(req.query.page)) {
            res.status(400).send({ mess: 'page and per_page should be a number' });
            return;
        }
        if (!req.query.per_page) {
            per_page = 4;
        } else if (parseInt(req.query.per_page) > 10 || parseInt(req.query.per_page) < 1) {
            res.status(400).send({ mess: 'per_page should`n be more than 10 and less then 1' });
            return;
        } else {
            per_page = parseInt(req.query.per_page);
        }

        if (!req.query.page) {
            page = 1;
        } else if (parseInt(req.query.page) < 0) {
            res.status(400).send({ mess: 'page should`n be less then 0' });
            return;
        } else {
            page = parseInt(req.query.page);
        }
        try {
            const Users = await userRepo.getUsers();
            const Pag_Users = pagination(Users, page, per_page);
            const User_friendly = ToUserFriendlyDate(Pag_Users);
            res.status(200).render('users', { users: User_friendly, user_current: 'current', user_link: 'disabled_link' });
        } catch (err) {

            res.status(404).send({ error: 'Cannot get users' })
        }
    },

    async getUserById(req, res) {
        try {
            const User = await userRepo.getUserById(req.params.id);
            date = new Date(User.registeredAt);
            res.status(200).render('user', { user: User, films: User.films_id, registeredAt: date.toUTCString().replace('GMT', ''), user_current: 'current' });
        } catch (err) {
            res.status(404).send({ error: 'Cannot get users by id' })
        }
    },
    async addFilm(req, res) {
        try {
            Films = await filmRepo.getFilms();

            res.render('add_film_to_user', { user_id: req.params.id, films: Films });
        } catch (err) {
            res.status(404).send({ error: 'Cannot get films' })
        }
    },
    async postFilm(req, res) {
        const film_id = req.body.films;
        const user_id = req.params.id;
        try {
            await userRepo.addFilmToList(user_id, film_id);

            res.redirect('/users/' + user_id);
        } catch (err) {
            res.status(404).send({ error: 'Cannot add film to list' })
        }
    },
    async deleteFilm(req, res) {
        try {
            const User = await userRepo.getUserById(req.params.id);

            res.render('delete_film_from_user', { user_id: req.params.id, films: User.films_id });
        } catch (err) {
            res.status(404).send({ error: 'Cannot get user by id' })
        }
    },
    async postDelFilm(req, res) {
        const film_id = req.body.films;
        const user_id = req.params.id;
        try {
            await userRepo.deleteFilmFromList(user_id, film_id);
            res.redirect('/users/' + user_id);
        } catch (err) {
            res.status(404).send({ error: 'Cannot delete film from list' })
        }
    }
};