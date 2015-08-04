#!/usr/bin/env node

var path = require('path');
var spawn = require('child_process').spawn;
var http = require('http');
var express = require('express');
var twitter = require('twitter');
var config = require('./config.js').twitter;

console.log(config);
[
    'consumer_key',
    'consumer_secret',
    'access_token_key',
    'access_token_secret'
].forEach(function(name) {
    if(!config[name]) {
        console.error('can\'t get ' + name + ' from config.js');
        process.exit(1);
    }
});
var twit = new twitter(config);

function startHttpServer(port, next) {
    var app = express();
    app.use(express.favicon());

    app.use(function(req, res, next) {
        //console.log(req.query);
        twit.get('search/tweets.json', req.query, function(error, tweets){
          if (!error) {
            //console.log(tweets);
            res.send(tweets);
          }
        });
    });

    http.createServer(app).listen(port, function() {
        console.log('http://localhost:' + port);
        next();
    });
}

startHttpServer(9801, function() {

    var cp = spawn('tupaijs', ['server']);

    cp.stderr.pipe(process.stderr);
    cp.stdout.pipe(process.stdout);
});
