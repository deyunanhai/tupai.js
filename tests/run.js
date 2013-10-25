#!/usr/bin/env node
/**
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 */

var path = require('path');
var spawn = require('child_process').spawn;
var http = require('http');
var express = require('express');

var baseDir = __dirname;

function startHttpServer(dir, port, next) {
    var app = express()
        .use(express.favicon())
        .use('/', express.static(path.join(baseDir, dir)))
        .use('/releases', express.static(path.join(baseDir, 'releases')))
        .use(express.cookieParser())
        .use(express.cookieSession({secret:'tupai'}));

    http.createServer(app).listen(port, function() {
        console.log('server listening on port ' + port);
        next();
    });
}

startHttpServer('static', 9877, function() {
    process.env['PHANTOMJS_BIN'] = path.join(
        baseDir,
        '..',
        'node_modules',
        '.bin',
        'phantomjs'
    );
    var karmaBin = path.join(
        baseDir,
        '..',
        'node_modules',
        '.bin',
        'karma'
    );

    var karmaConfFilePath = path.join(baseDir, 'karma.conf.js');
    var cp = spawn(karmaBin, ['start', karmaConfFilePath]);

    cp.stderr.pipe(process.stderr);
    cp.stdout.pipe(process.stdout);
});
