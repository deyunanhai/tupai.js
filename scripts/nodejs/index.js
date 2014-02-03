/**
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 */
var fs = require('fs');
var spawn = require('child_process').spawn;
var path = require('path');
var baseDir = path.resolve(__dirname, '..', '..');

var format = function(str, args) {

    if(typeof str !== 'string' || !args || !args.length) return str;
    var i, safe, arg;

    for (i=0, len=args.length+1; i < len; arg = args[i++]) {
        safe = typeof arg === 'object' ? JSON.stringify(arg) : arg;
        str = str.replace(RegExp('\\{'+(i-1)+'\\}', 'g'), safe);
    }
    return str;
}

var execute = function(cmd, args, options) {
    var cp = spawn(cmd, args);

    var needStdin;
    if(options && options.needStdin) {
        process.stdin.pipe(cp.stdin);
        needStdin = true;
    }

    if(options && options.onStdoutData) {
        cp.stdout.on('data', function(data) {
            options.onStdoutData(data);
        });
    } else {
        cp.stdout.pipe(process.stdout);
    }

    if(options && options.onStderrData) {
        cp.stderr.on('data', function(data) {
            options.onStderrData(data);
        });
    } else {
        cp.stderr.pipe(process.stderr);
    }

    cp.on('error', function(err) {
        console.error(err);
    });

    var closeFunc = function() {
        if(cp) cp.kill('SIGTERM');
        options && options.end && options.end();
        process.exit(1);
    };
    process.on('SIGTERM', closeFunc);

    //exit
    cp.on('close', function(code) {
        process.removeListener('SIGTERM', closeFunc);
        if(needStdin) {
            process.stdin.end();
        }
        options && options.end && process.nextTick(function() {
            options.end(code);
        });
    });

};

var _rmdirSync = function(dir) {
    var list = fs.readdirSync(dir);
    for(var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if(filename == "." || filename == "..") {
            // pass these files
        } else if(stat.isDirectory()) {
            // rmdir recursively
            rmdirSync(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
};

var rmdirSync = function(dir) {
    if(!fs.existsSync(dir)) return false;
    _rmdirSync(dir);
    return true;
};

exports.getBinPath = function(name) {
    return path.join(baseDir, 'node_modules', '.bin', name);
};
exports.baseDir = baseDir;
exports.format = format;
exports.execute = execute;
exports.rmdirSync = rmdirSync;

var mDefaultConfig = {
    name: 'unnamed',
    version: '0.0.1',
    package: undefined,
    web: 'web',
    templates: 'templates',
    configs: 'configs',
    sources: 'src',
    gen: 'gen',
    server: {
        port: 9800
    }
};
var copy = function(dist, src) {
    if(!dist) return src;
    for(var name in src) {
        if(typeof src[name] === 'object') {
            dist[name] = copy(dist[name], src[name]);
        } else {
            dist[name] = src[name];
        }
    }
    return dist;
}
var tupaiConfFileName = 'tupai.conf.json'
var readConfig = function() {
    if(!fs.existsSync(tupaiConfFileName)) {
        return mDefaultConfig;
    }
    var configData = fs.readFileSync(tupaiConfFileName);
    var config = JSON.parse(configData.toString());
    return copy(copy({}, mDefaultConfig), config);
};
var mConfig;
exports.isTupaiProjectDir = function(dir) {

    var confFilePath;
    if(dir) {
        confFilePath = path.join(dir, tupaiConfFileName);
    } else {
        confFilePath = tupaiConfFileName;
    }
    return fs.existsSync(confFilePath);
};
exports.resetConfig = function() {
    mConfig = undefined;
};
exports.getConfig = function() {
    if(!mConfig) {
        try {
            mConfig = readConfig();
        } catch(e) {
            console.error('can\'t read tupai.conf.json', e);
            throw e;
        }
        mConfig.genTemplates = path.join(mConfig.gen, mConfig.templates);
        mConfig.genConfigs = path.join(mConfig.gen, mConfig.configs);
    }
    return mConfig;
};

var templates = require(path.join(__dirname, 'templates'));
exports.compileTemplate = templates.compileTemplate;
exports.compileTemplates = templates.compileTemplates;

var configs = require(path.join(__dirname, 'configs'));
exports.compileConfigSync = configs.compileConfigSync;

var autoMerge = require('./auto_merge.js');
exports.merge = function(action, options, end) {
    options = options || {};
    options['action'] = action;
    autoMerge.run(options, end);
};

exports.compress = function(file, options, execOptions) {
    options = options || {};
    var type = options.type || 'js';
    var jarPath = require('yuicompressor').jar;
    var pargs = ['-jar', jarPath, '--type', type];
    if(options.output) {
        pargs.push('-o', options.output);
    }

    if(file) {
        pargs.push(file);
    } else {
        // need stdin
        execOptions = execOptions || {};
        if(!execOptions.hasOwnProperty('needStdin')) {
            execOptions['needStdin'] = true;
        }
    }
    //if(args) { pargs = pargs.concat(args); }
    execute('java', pargs, execOptions);
};

var server = require(path.join(__dirname, 'server'));
exports.startServer = server.start;

var generator = require(path.join(__dirname, 'generator'));
exports.generators = generator.generators;
exports.createProject = generator.createProject;

var make = require(path.join(__dirname, 'make'));
exports.make = make.make;
