const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Promotions = require('../models/promotions');

const promotionsRouter = express.Router();

promotionsRouter.use(bodyParser.json());

promotionsRouter.route('/')
    .options(cors.corsWhithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        Promotions.find({})
            .then((promo) => {
                if (promo != null) {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(promo);
                } else {
                    err = new Error('There is no still pomotion in the data base.');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        Promotions.create(req.body)
            .then((promo) => {
                console.log('Promotion created ', promo);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.json(promo);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        res.statusCode = 403;
        res.end('PUT operation is not supported on /promotions by the server');
    })
    .delete(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        Promotions.remove({})
            .then((promo) => {
                res.status = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promo);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

promotionsRouter.route('/:promotionId')
    .options(cors.corsWhithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        Promotions.findById(req.params.promotionId)
            .then((promo) => {
                if (promo != null) {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(promo);
                } else {
                    err = new Error('The promotion ' + req.params.promotionId + ' is not found in the promotion data base');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /promotions/' + req.params.promotionId);
    })
    .put(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promotions.findById(req.params.promotionId)
            .then((promo) => {
                if (promo != null) {
                    if (req.body.name) {
                        promo.name = req.body.name;
                    }
                    if (req.body.image) {
                        promo.image = req.body.image;
                    }
                    if (req.body.label) {
                        promo.label = req.body.label;
                    }
                    if (req.body.price) {
                        promo.price = req.body.price;
                    }
                    if (req.body.description) {
                        promo.description = req.body.description;
                    }
                    promo.save()
                        .then((promo) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(promo);
                        }, (err) => next(err));
                } else {
                    err = new Error('The promotion ' + req.params.promotionId + ' is not found in the promotion data base');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promotions.findById(req.params.promotionId)
            .then((promo) => {
                if (promo != null) {
                    promo.remove();
                    promo.save()
                        .then((promo) => {
                            res.status = 200;
                            res.setHeader('Content-Typer', 'application/json');
                            res.send('The promotion ' + req.params.promotionId + ' was deleted from the promotion data base');
                        }, (err) => next(err));
                } else {
                    err = new Error('The promotion ' + req.params.promotionId + ' is not found in the promotion data base');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = promotionsRouter;