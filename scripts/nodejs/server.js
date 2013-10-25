/**
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 */
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var http = require('http');
var ejs = require('ejs');
var express = require('express');
var httpProxy = require('http-proxy');
var tupai = require(__dirname);

var tupaijsPath = path.join(__dirname, '..', '..', 'bin', 'tupaijs');
function execute(args, callback) {
    var cp = spawn(tupaijsPath, args);

    cp.stderr.pipe(process.stderr);
    if(callback) {
        var result='';
        cp.stdout.on('data', function(data) {
            result += data.toString();
        });
        cp.on('close', function(code) {
            callback(result);
        });
    } else {
        if(mConfig.logTupai) {
            cp.stdout.pipe(process.stdout);
        }
    }
    return cp;
}

function genConfigs() {
    console.log('gen configs:');
    tupai.compileConfigSync(mConfig.configs, mConfig.genConfigs, 'Config');
}

function genTemplates(callback) {
    console.log('gen template files:');
    console.log('    ' + mConfig.templates + ' -> ' + mConfig.genTemplates);
    execute(['templates', mConfig.templates, mConfig.genTemplates, '-m', 'no'])
    .on('exit', function() {
        callback();
    });
}

function genTemplate(filePath, packageName, callback) {
    console.log('gen template file:' + filePath);
    execute(['template', filePath, mConfig.genTemplates, packageName, '-m', 'no'])
    .on('exit', function() {
        callback();
    });
}

function listClass(callback) {
    var classPath = mConfig.genTemplates + ';' + mConfig.sources;
    execute(['list', '--classPath', classPath, '--ignoreNotFound'], function(output) {
        var classList;
        try {
            classList = JSON.parse(output);
        } catch(e) {
            console.log("can't parse classlist. ");
            console.log(output);
        }

        if(classList) {
            callback(classList);
        }
    });
}

var URL = require('url');
function createProxyHttpHandler(config) {
    return (function(req, res, next) {
        req.url = config.basePathName + req.url;
        config.proxy.proxyRequest(req, res)
    });
}

function useProxyRequest(app) {

    var serverConfig = mConfig.server;
    if(!serverConfig.proxies) return;
    if(typeof serverConfig.proxies !== 'object') return;

    var proxies = serverConfig.proxies;
    console.log('proxies: ');
    for(var name in proxies) {
        var u = URL.parse(proxies[name]);
        var config = {
            proxy: new httpProxy.HttpProxy({
                target: {
                    host: u.hostname,
                    port: u.port,
                    https: u.protocol === 'https:'
                }
            }),
            basePathName: (u.pathname.length > 1 ? u.pathname : '')
        };

        console.log('    ' + name + ' -> ' + u.protocol + '//' +
                    u.hostname + ':' + (u.port?u.port:80) + u.pathname);
        app.use(name, createProxyHttpHandler(config));
    }
}

function sendFile(router) {
    return function(req, res) {

        var filename;
        var renderTemplate;
        if(typeof router === 'string') {
            filename = router;
            renderTemplate = false;
        } else if(typeof router === 'object'){
            filename = router.path;
            renderTemplate = router.template;
        }

        if(!filename) {
            res.send(404);
            return;
        }

        if(req.params.length > 0) {
            filename = tupai.format(filename, req.params);
            if(!fs.existsSync(filename)) {
                res.send(404);
                return;
            }
            var stat = fs.statSync(filename);
            if(stat.isDirectory()) {
                // TODO  to serve files, providing a full-featured file browser
            }
        }

        if(renderTemplate) {
            var params = {};
            [
                'params', 'query', 'body', 'cookies',
                'ip', 'path', 'host', 'protocol', 'originalUrl'
            ].forEach(function(name) {
                params[name] = req[name];
            })
            ejs.renderFile(filename, params, function(err, data) {
                if(err) {
                    res.send(500, err);
                } else {
                    res.send(data);
                }
            });
        } else {
            res.sendfile(filename);
        }
    };
}

function useRouters(app) {

    var serverConfig = mConfig.server;
    var routers = serverConfig.routers;
    if(!routers) return;
    if(typeof routers !== 'object') return;

    console.log('routers: ');
    for(var name in routers) {
        var router = routers[name];

        console.log('    ' + name + ' -> ' + router);
        app.get(name, sendFile(router));
    }
}

function configDebugMode(app) {
    var serverConfig = mConfig.server;
    var webDir = path.join(__dirname, '..', '..', 'releases', mConfig.web);
    //console.log(mConfig);

    useProxyRequest(app);
    app.use('/__js', express.static(mConfig.sources));
    app.use('/__js', express.static(mConfig.genTemplates));
    app.use('/__js', express.static(mConfig.genConfigs));
    app.use('/', function(req, res, next) {
        var p = req.path;
        if(p === '/') p = '/index.html';
        if(p.match(/^\/.*\.html$/)) {
            var filePath = path.join(mConfig.web, p);
            if(!fs.existsSync(filePath)) {
                next();
            } else {
                var content = fs.readFileSync(filePath).toString();
                res.send(content.replace(/<!--[ ]*__js_files__[ ]*-->[\s\S]*<!--[ ]*__js_files__[ ]*-->/, classListHtml));
            }
        } else {
            next();
        }
    });
    app.use('/tupai', express.static(webDir));
    app.use('/tupai', express.directory(webDir));
    app.use('/templates', express.static(mConfig.templates));
    app.use('/templates', express.directory(mConfig.templates));
}

function startHttpServer(releaseMode, printLog) {
    var app = express();
    app.use(express.favicon(path.join(__dirname, '..', '..', 'favicon.ico')));
    if(printLog) {
        app.use(express.logger());
    }

    var serverConfig = mConfig.server;
    useRouters(app);
    if(!releaseMode) {
        configDebugMode(app, serverConfig);
    }
    app.use('/', express.static(mConfig.web));

    var port = serverConfig.port;
    http.createServer(app).listen(port, function() {
        console.log('\nopen below url in your browser.');
        console.log('http://localhost:' + port);
    });
}


var classListHtml;
function renderClassListHtml(callback) {
    listClass(function(cl) {
        classListHtml = '<script src="__js/Config.js"></script>';
        cl.forEach(function(classzz) {
            classListHtml += '\n<script src="__js/' + classzz.name.split('.').join('/') + '.js"></script>';
        });
        callback && callback();
    });
}

var chokidar = require('chokidar');
function watchFs() {
    console.log('start watching files:');

    var paths = [mConfig.sources, mConfig.templates, mConfig.configs];
    paths.forEach(function(path) {
        console.log('    watching ' + path);
    });

    var renderClassListHtmlFn = function(changeType) {
        if(changeType !== 'change') {
            renderClassListHtml();
        }
    };
    var rules = [
        {
            regexp: new RegExp(mConfig.sources + "\/.*\.js$"),
            fn: function(changeType, filePath) {
                renderClassListHtmlFn(changeType);
            }
        },
        {
            regexp: new RegExp(mConfig.templates + "\/.*\.html"),
            fn: function(changeType, filePath) {
                if(changeType === 'unlink') {
                    fs.unlinkSync(path.join('gen', filePath.replace(/\.html$/, '.js')));
                    renderClassListHtmlFn(changeType);
                } else {
                    var classPath = path.relative(mConfig.templates, filePath).replace(/\.html$/, '');
                    genTemplate(filePath, classPath.split('/').join('.'), function() {
                        renderClassListHtmlFn(changeType);
                    });
                }
            }
        },
        {
            regexp: new RegExp(mConfig.configs + "\/.*\.json"),
            fn: function(changeType, filePath) {
                try {
                    genConfigs();
                } catch(e) {
                    console.error('can\'t generate configs', e);
                }
            }
        }
    ];

    var changeFn = function(changeType, filePath) {
        console.log(changeType + ':' + filePath);
        rules.forEach(function(rule) {
            if(filePath.match(rule.regexp)) {
                rule.fn(changeType, filePath);
            }
        });
    };
    var watcher = chokidar.watch(paths, {ignored: /\/\./, persistent: true, ignoreInitial: true});
    ['add', 'change', 'unlink'].forEach(function(changeType) {
        watcher.on(changeType, function(filePath) {
            changeFn(changeType, filePath);
        });
    });
    watcher.on('error', function(error) {
        console.error('Error happened', error);
    });
}

var mConfig;
exports.start = function(options) {
    if(!tupai.isTupaiProjectDir()) {
        console.error('current dir is not a tupai project dir.');
        return;
    }
    mConfig = tupai.getConfig();
    var target = (options && options.target) || 'debug';
    var releaseMode = ('release' === target);
    if(releaseMode) {
        startHttpServer(releaseMode, options.printLog);
    } else {
        tupai.rmdirSync('gen');
        fs.mkdirSync('gen');
        genConfigs();
        genTemplates(function() {
            renderClassListHtml(function() {
                watchFs();
                startHttpServer(releaseMode, options.printLog);
            });
        });
    }
}

