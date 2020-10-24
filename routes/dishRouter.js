const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());


dishRouter.route('/')
    .options(cors.corsWhithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        Dishes.find({})
            .populate('comments.author') //Reference documents in other collections
            .then((dishes) => {
                res.status = 200;
                res.setHeader('Content-Typer', 'application/json');
                res.json(dishes);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        Dishes.create(req.body)
            .then((dish) => {
                console.log('Dish created ', dish);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        res.statusCode = 403;
        res.end('PUT operation is not supported on /dishes by the server');
    })
    .delete(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        Dishes.remove({})
            .then((resp) => {
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

dishRouter.route('/:dishId')
    .options(cors.corsWhithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                res.status = 200;
                res.setHeader('Content-Typer', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId);
    })
    .put(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        Dishes.findByIdAndUpdate(req.params.dishId, {
                $set: req.body
            }, { new: true })
            .then((dish) => {
                res.status = 200;
                res.setHeader('Content-Typer', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        Dishes.findByIdAndRemove(req.params.dishId)
            .then((resp) => {
                res.status = 200;
                res.setHeader('Content-Typer', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

dishRouter.route('/:dishId/comments')
    .options(cors.corsWhithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish != null) {
                    res.status = 200;
                    res.setHeader('Content-Typer', 'application/json');
                    res.json(dish.comments);
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' is not found.')
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWhithOptions, authenticate.verifyUser, (req, res, next) => { //First verify that the user is logined
        Dishes.findById(req.params.dishId)
            .then((dish) => {

                if (dish != null) {
                    req.body.author = req.user._id;
                    //res.status = 200;
                    //res.setHeader('Content-Typer', 'application/json');
                    dish.comments.push(req.body);
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish) => {
                                    res.status = 200;
                                    res.setHeader('Content-Typer', 'application/json');
                                    res.json(dish)
                                })
                        }, (err) => next(err));
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' is not found.')
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        res.statusCode = 403;
        res.end('PUT operation is not supported on /dishes/' + req.params.dishId + '/comments by the server');
    })
    .delete(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    for (var i = (dish.comments.length - 1); i >= 0; i--) {
                        dish.comments.id(dish.comments[i]._id).remove();
                    }
                    dish.save()
                        .then((dish) => {
                            res.status = 201;
                            res.setHeader('Content-Typer', 'application/json');
                            res.json(dish)
                        }, (err) => next(err));
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' is not found.')
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

dishRouter.route('/:dishId/comments/:commentsId')
    .options(cors.corsWhithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish != null && dish.comments.id(req.params.commentsId) != null) {
                    res.status = 200;
                    res.setHeader('Content-Typer', 'application/json');
                    res.json(dish.comments.id(req.params.commentsId));
                } else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' is not found.')
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error('Comment ' + req.params.commentsId + ' is not found in the dish: ' + req.params.dishId)
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWhithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId + '/comments/' + req.params.commentsId);
    })
    .put(cors.corsWhithOptions, authenticate.verifyUser, (req, res, next) => { //First verify that the user is logined 
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                var VerifyUserID = dish.comment.id(req.params.commentsId).author._id;
                if (VerifyUserID.equals(req.user._id)) {
                    if (dish != null && dish.comments.id(req.params.commentsId) != null) {
                        if (req.body.rating) {
                            dish.comments.id(req.params.commentsId).rating = req.body.rating;
                        }
                        if (req.body.comment) {
                            dish.comments.id(req.params.commentsId).comment = req.body.comment;
                        }
                        dish.save()
                            .then((dish) => {
                                Dishes.findById(dish._id)
                                    .populate('comments.author')
                                    .then((dish) => {
                                        res.status = 200;
                                        res.setHeader('Content-Typer', 'application/json');
                                        res.json(dish)
                                    })
                            }, (err) => next(err));
                    } else if (dish == null) {
                        err = new Error('Dish ' + req.params.dishId + ' is not found.')
                        err.status = 404;
                        return next(err);
                    } else {
                        err = new Error('Comment ' + req.params.commentsId + ' is not found in the dish: ' + req.params.dishId)
                        err.status = 404;
                        return next(err);
                    }
                } else {
                    var err = new Error('The user: ' + req.user.username + 'is not the author of the comment: ' + req.params.commentsId)
                    err.status = 403;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWhithOptions, authenticate.verifyUser, (req, res, next) => { //First verify that the user is logined  
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                var VerifyUserID = dish.comments.id(req.params.commentsId).author._id;
                if (VerifyUserID.equals(req.user._id)) {
                    if (dish != null && dish.comments.id(req.params.commentsId) != null) {
                        dish.comments.id(req.params.commentsId).remove();
                        dish.save()
                            .then((dish) => {
                                Dishes.findById(dish._id)
                                    .populate('comments.author')
                                    .then((dish) => {
                                        res.status = 200;
                                        res.setHeader('Content-Typer', 'application/json');
                                        res.json(dish)
                                    })
                            }, (err) => next(err));
                    } else if (dish == null) {
                        err = new Error('Dish ' + req.params.dishId + ' is not found.')
                        err.status = 404;
                        return next(err);
                    } else {
                        err = new Error('Comment ' + req.params.commentsId + ' is not found in the dish: ' + req.params.dishId)
                        err.status = 404;
                        return next(err);
                    }
                } else {
                    var err = new Error('You are not autorized to delete this comment: ' + req.params.commentsId)
                    err.status = 403;
                    return next(err);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = dishRouter;