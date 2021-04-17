// routes/films.js
const router = require('express').Router();
const filmController = require('../controllers/films_controller_mst');

router
    .get("/", filmController.getFilms)
    .get("/new", filmController.newFilm)
    .get("/:id", filmController.getFilmById)
    .post("/", filmController.postFilm)
    .post("/delete/:id", filmController.deleteFilm)
    .get("/getupdate/:id", filmController.getupdateFilm)
    .post("/getupdate/:id", filmController.updateFilm)
    .get("/getupdatephoto/:id", filmController.getupdateFilmPhoto)
    .post("/getupdatephoto/:id", filmController.updateFilmPhoto)
    .get("/addactor/:id", filmController.addActor)
    .post("/addactor/:id", filmController.postAddActor)
    .get("/deleteactor/:id", filmController.deleteActor)
    .post("/deleteactor/:id", filmController.postDelActor);

module.exports = router;