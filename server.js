// imports

var express = require('express');
var bodyParser = require('body-parser');
var apiRouter = require('./apiRouter').router;


// Instanciation de notre Serveur

var server=express();

// configuration de body-parser

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());


// Configurer les routes

server.get('/', function(req,res){
    res.setHeader('Content-Type','text/html');
    res.status(200).send('<h1>Bonjour et bienvenue sur mon serveur');
});

server.use('/api/',apiRouter);

// lancer notre serveur

server.listen(8080,function(){
    console.log('notre serveur est en écoute');
});

