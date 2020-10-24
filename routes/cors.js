const express = require('express');
const cors = require('cors');
const app = express();

//whitelist contains all the origins that the server is willing to accept  
const whitelist = ['http://localhost:3000', 'https://localhost:3443'];

//Funtion 
var corsOptionsDelegate = (req, callback) => {
    var corsOpions;
    console.log(req.header('Origin'));
    if (whitelist.indexOf(req.header('Origin')) !== -1) { //Si el encabezado de solicitud entrante contiene un feed de origin se revisa la lista whitelist y si es diferente de -1 
        corsOpions = {
            origin: true
        };
    } else { //Otherwise, the origin is no in the whitelist
        corsOpions = {
            origin: false
        };
    }
    callback(null, corsOpions);
};

exports.cors = cors();
exports.corsWhithOptions = cors(corsOptionsDelegate);