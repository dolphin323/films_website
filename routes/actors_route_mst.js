// routes/actors.js
const router = require('express').Router();
const actorController = require('../controllers/actors_controller_mst');

router
    .get("/", actorController.getActors)
    .get("/new", actorController.newActor)
    .get("/:id", actorController.getActorById)
    .post("/", actorController.postActor)
    .post("/:id", actorController.deleteActor)
    .get("/getupdate/:id", actorController.getupdateActor)
    .post("/getupdate/:id", actorController.updateActor)
    .get("/getupdatephoto/:id", actorController.getupdateActorPhoto)
    .post("/getupdatephoto/:id", actorController.updateActorPhoto);

module.exports = router;