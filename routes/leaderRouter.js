const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Leaders = require('../models/leaders');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
    .options(cors.corsWhithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        Leaders.find({})
            .then((lead) => {
                if (lead != null) {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(lead);
                } else {
                    err = new Error('There is no leaders in the datanbase.');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        Leaders.create(req.body)
            .then((lead) => {
                console.log('Promotion created ', lead);
                res.status = 201;
                res.setHeader('Content-Type', 'application/json');
                res.json(lead);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        res.statusCode = 403;
        res.end('PUT operation is not supported on /leaders by the server');
    })
    .delete(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        Leaders.remove({})
            .then((lead) => {
                res.status = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(lead);
            }, (err) => next(err))
            .catch((err) => next(err));
    });



leaderRouter.route('/:leaderId')
    .options(cors.corsWhithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        Leaders.findById(req.params.leaderId)
            .then((lead) => {
                if (lead != null) {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(lead);
                } else {
                    err = new Error('The Leader ' + req.params.leaderId + ' is not found in leaders database.');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        res.statusCode = 403;
        res.end('POST operation not supported on /leaders/' + req.params.leaderId);
    })
    .put(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        Leaders.findById(req.params.leaderId)
            .then((lead) => {
                if (lead != null) {
                    if (req.body.name) {
                        lead.name = req.body.name;
                    }
                    if (req.body.image) {
                        lead.image = req.body.image;
                    }
                    if (req.body.designation) {
                        lead.designation = req.body.designation;
                    }
                    if (req.body.abbr) {
                        lead.abbr = req.body.abbr;
                    }
                    if (req.body.description) {
                        lead.description = req.body.description;
                    }
                    lead.save()
                        .then((lead) => {
                            res.status = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(lead);
                        }, (err) => next(err));
                } else {
                    err = new Error('The Leader ' + req.params.leaderId + ' is not found in leaders database.');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //First verify that the user is logined and after verify that the user is admin 
        Leaders.findById(req.params.leaderId)
            .then((lead) => {
                if (lead != null) {
                    lead.remove();
                    promo.save()
                        .then((lead) => {
                            res.status = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.end('The Leader ' + req.params.leaderId + ' is not found in leaders database.');
                        }, (err) => next(err));
                } else {
                    err = new Error('The Leader ' + req.params.leaderId + ' is not found in leaders database.');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = leaderRouter;