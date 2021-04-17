const userRouter = require('./users_route_mst');
const filmRouter = require('./films_route_mst');
const actorRouter = require('./actors_route_mst');
const mstRouter = require('express').Router();

mstRouter
    .use('/users', userRouter)
    .use('/films', filmRouter)
    .use('/actors', actorRouter);


module.exports = mstRouter;