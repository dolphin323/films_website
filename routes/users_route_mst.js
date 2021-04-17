const router = require('express').Router();

const userController = require('../controllers/users_controller_mst');

router
    .get("/:id", userController.getUserById)
    .get("/", userController.getUsers)
    .get("/addfilm/:id", userController.addFilm)
    .post("/addfilm/:id", userController.postFilm)
    .get("/deletefilm/:id", userController.deleteFilm)
    .post("/deletefilm/:id", userController.postDelFilm);


module.exports = router;