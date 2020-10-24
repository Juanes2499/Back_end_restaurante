const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

//Route to storage the image and name 
const storage = multer.diskStorage({
    destination: (req, file, cb) => { //cb callback function
        cb(null, 'public/images'); //callback function has two parameters, the first is the error is gona be null and the second one is gona be the destination where the images will be stored
    },
    filename: (req, file, cb) => { //cb callback function
        cb(null, file.originalname) //callback function has two parameters, the first is the error is gona be null and the second one is the name that it will be set, if we don't set the name, multer will set a random name
    }
});

//Filter fot the image
const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { //Regular expression to verify that the name of the image uploaded is .jpg, .jpeg....
        return cb(new Error('You can upload only image files.'), false);
    }
    cb(null, true); //Otherwise, the image match with the filer, the image will be uploaded
};

//upload of the image, we need to put the function storage and imageFileFilter
const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter
});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
    .options(cors.corsWhithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation is not supported on /imageUpload by the server');
    })
    .post(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.file);
    })
    .put(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /imageUpload by the server');
    })
    .delete(cors.corsWhithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE operation is not supported on /imageUpload by the server');
    });

module.exports = uploadRouter;