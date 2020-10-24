const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWhithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favs) => {
                if (err) {
                    err = new Error('There is a problem finding the favorite dishes of the user: ', +req.user._id);
                    err.status = 404;
                    return next(err);
                }
                if (!favs) {
                    res.status = 404;
                    res.end('The user: ' + req.user._id + ' does not have favorite dishes');
                }
            })
            .populate('user')
            .populate('dishes')
            .then((favs) => {
                res.status = 200;
                res.setHeader('Content-Typer', 'application/json');
                res.json(favs);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWhithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favs) => {
            if (err) {
                err = new Error('There is a problem posting the favorite dishes of the user: ', +req.user._id);
                err.status = 404;
                return next(err);
            }
            //Si no hay ningun dish lo agrega por primera vez
            if (!favs) {
                Favorites.create({ user: req.user._id })
                    .then((favs) => {
                        for (var dish = 0; dish < req.body.length; dish++) {
                            favs.dishes.push(req.body[dish]);
                        }
                        favs.save()
                            .then((favs) => {
                                console.log('favorite Created ', favs);
                                res.status = 200;
                                res.setHeader('Content-Typer', 'application/json');
                                res.json(favs);
                            })
                    }, (err) => next(err))
                    .catch((err) => next(err));
            } else { // si ya existe algun dish ingresado, lo verifica o lo agrega.
                var favoriteAlreadyExist = false;
                for (var dish = 0; dish < req.body.length; dish++) {
                    //Se verefica que el Dish ingresado como favorito exista, si exite regresa error
                    if (favs.dishes.indexOf(req.body[dish]._id) > -1) {
                        err = new Error('The dish: ' + req.body[dish]._id + ' has already been added to the list of favorite dishes of the user: ' + req.user._id);
                        err.status = 403;
                        return next(err);
                    } else {
                        //Si el dish ingresado como favorito no existe, lo agrega
                        favs.dishes.push(req.body[dish]);
                        favs.save()
                            .then((favs) => {
                                console.log('favorite added ', favs);
                                res.status = 200;
                                res.setHeader('Content-Typer', 'application/json');
                                res.json(favs);
                            }, (err) => next(err))
                            .catch((err) => next(err));
                    }
                }
            }
        });
    })
    .put(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favorites/ by the server');
    })
    .delete(cors.corsWhithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.remove({ user: req.user._id })
            .then((resp) => {
                res.status = 200;
                res.setHeader('Content-Typer', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

favoriteRouter.route('/:dishId')
    .options(cors.corsWhithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favs) => {
                if (err) {
                    err = new Error('There is a problem finding the favorite dishes of the user: ', +req.user._id);
                    err.status = 404;
                    return next(err);
                }
                if (!favs) {
                    res.status = 404;
                    res.end('The user: ' + req.user._id + ' does not have favorite dishes');
                }
                if (favs.dishes.indexOf(req.params.dishId) > -1) {
                    console.log('hola');
                    //Dishes.findById(req.params.dishId)
                } else {
                    console.log('adios');
                }
            })
            //{ path: 'dishes', match: { _id: { $gte: req.params.dishId } } }
            .populate('user')
            .populate({ path: 'dishes', match: { _id: { $gte: req.params.dishId } } })
            .then((favs) => {
                res.status = 200;
                res.setHeader('Content-Typer', 'application/json');
                res.json(favs);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWhithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favs) => {
            if (err) {
                err = new Error('There is a problem posting the favorite dishes of the user: ', +req.user._id);
                err.status = 404;
                return next(err);
            }
            //Si no hay ningun dish lo agrega por primera vez
            if (!favs) {
                Favorites.create({ user: req.user._id })
                    .then((favs) => {
                        favs.dishes.push(req.params.dishId);
                        favs.save()
                            .then((resp) => {
                                console.log('favorite Created ', resp);
                                res.status = 201;
                                res.setHeader('Content-Typer', 'application/json');
                                res.json(resp);
                            });
                    }, (err) => next(err))
                    .catch((err) => next(err));
            } else { // si ya existe algun dish ingresado, lo verifica o lo agrega.
                var favoriteAlreadyExist = false;
                if (favs.dishes.indexOf(req.params.dishId) > -1) {
                    err = new Error('The dish: ' + req.params.dishId + ' has already been added to the list of favorite dishes of the user: ' + req.user._id);
                    err.status = 404;
                    return next(err);
                } else {
                    favs.dishes.push(req.params.dishId);
                    favs.save()
                        .then((resp) => {
                            console.log('favorite Created ', resp);
                            res.status = 201;
                            res.setHeader('Content-Typer', 'application/json');
                            res.json(resp);
                        });
                }
            }
        });
    })
    .put(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favorites/ by the server');
    })
    .delete(cors.corsWhithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favs) => {
            if (err) {
                err = new Error('There is a problem finding the favorite dishes of the user: ', +req.user._id);
                err.status = 404;
                return next(err);
            }
            if (!favs) {
                res.statusCode = 200;
                res.end("The user: " + req.user._id + ' does not have favorite dishes to delete');
            }
            var index = favs.dishes.indexOf(req.params.dishId);
            if (index > -1) {
                favs.dishes.splice(index, 1);
                favs.save()
                    .then((resp) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }
        });
    });

module.exports = favoriteRouter;