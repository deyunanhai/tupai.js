/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var util = require('util');

var mClassPath;
var mClassList;
var mIsTupaiCore;
var mIgnoreNotFound;

var logger = {
    errorCount: 0,
    log: function() {
        console.log.apply(console, arguments);
    },
    error: function() {
        logger.errorCount++;
        console.error.apply(console, arguments);
    }
};

function getClassFromClassName(className, arr) {

    var classPath = mClassPath;
    for(var i=0, n=classPath.length; i<n; i++) {
        var p = path.join(classPath[i], className.split('.').join(path.sep) + '.js');
        if(fs.existsSync(p)) {
            arr.push({
                className: className,
                filePath: p
            });
            return true;
        } else {
            // use a package
            var p = path.join(classPath[i], className.split('.').join(path.sep));
            if(fs.existsSync(p)) {
                var stats = fs.statSync(p);
                if(stats.isDirectory()) {
                    var files = fs.readdirSync();
                    for(var i=0,n=files.length; i<n; i++) {
                        var name = files[i];
                        var filePath = path.join(p, name);
                        if(!name.match(/\.js$/)) continue;
                        stats = fs.statSync(filePath);
                        if(!stats.isFile()) continue;

                        name = name.replace(/\.js$/, '');
                        var c = {
                            className: className+'.'+name,
                            filePath:  filePath
                        };
                        arr.push(c);
                    }
                    return true;
                }
            }
        }
    }
    return false;
}

function getFunctionParameter(node, funcName) {

    if(node.arity != NodeArity.PN_LIST) return null;
    if(!node.list || node.list.length < 2) return null;

    var dotNode = node.list[0];
    if(dotNode.arity != NodeArity.PN_NAME) return null;
    if(dotNode.name != funcName) return null;

    return node.list[1].value;
}

function createClass(prototype, properties) {
    var definition = function() {
        this.initialize && this.initialize.apply(this, arguments);
    };
    definition.prototype = prototype || {};
    if(properties) {
        copy(definition, properties);
    }
    return definition;
};
var packageClass = createClass({
    initialize: function(packageName) {
        this.packageName = packageName || '';
        this.useList=[];
        this.defineNames=[];
    },
    use: function(packageName) {
        this.useList.push(packageName);
        return this;
    },
    // define(className, callback);
    // define(callback);
    define: function(arg1, arg2) {
        if(typeof arg1 === 'string') {
            this.defineNames.push(arg1);
        }
        return this;
    },
    run: function(callback) {
        return this;
    }
});

function getClassInfo(classzz) {
    var sandbox = {
        packages: [],
        window: {},
        Package: function(name) {
            var ret = new packageClass(name);
            sandbox.packages.push(ret);
            return ret;
        }
    };
    var code = fs.readFileSync(classzz.filePath);
    try {
        vm.runInNewContext(code, sandbox, classzz.filePath);
    } catch(e) {
        logger.error('can\'t parse ' + classzz.filePath + '\n' + e);
        return undefined;
    }
    //console.log(sandbox);
    var ret = {};
    var packages = sandbox.packages;
    if(packages.length !== 1) {
        logger.error('no or duplicate packages. (' +
                      classzz.filePath + ')');
        return undefined;
    }
    var package = packages[packages.length-1];
    var className;
    package.defineNames.forEach(function(name) {
        if(name && !className) {
            className = name;
        }
    });
    return {
        packageName: package.packageName,
        useList: package.useList,
        className: className
    };
}

function parseDirtyUseList(classzz, map) {
    var arr = [];
    var classInfo = getClassInfo(classzz);
    if(!classInfo) return;
    classInfo.useList.forEach(function(name) {
       if(!name) return;
       if(!mIsTupaiCore) {
           if(name.match(/^tupai\./)) return;
       }
       if(!getClassFromClassName(name, arr)) {
           if(!mIgnoreNotFound) {
               logger.error('cannot found ' + name + ' in ' + classzz.className);
           //} else {
               //console.log('cannot found ' + className + ' in ' + classzz.className);
           }
       }
    });
    map[classzz.className] = {useList: arr, classzz: classzz};
    for(var i=0, n=arr.length; i<n; i++) {
        parseDirtyUseList(arr[i], map);
    }
}

function hasClass(arr, classzz) {
    for(var i=0, n=arr.length; i<n; i++) {
        if(arr[i].className === classzz.className) return true;
    }
    return false;
}

function solveDependencyUseList(classList) {

    var classMap = {};
    for(var i=0, n=classList.length; i<n; i++) {
        var c = classList[i];
        //newClassList.push(c);
        parseDirtyUseList(c, classMap);
    }

    var newClassList = [];
    do {
        var solveCount = 0;
        var count = 0;
        for(var name in classMap) {
            count++;
            var list = classMap[name].useList;
            var dirty = false;
            for(var i=0, n=list.length; i<n; i++) {
                if(!hasClass(newClassList, list[i])) {
                    dirty = true;
                    break;
                }
            }
            if(!dirty) {
                newClassList.push(classMap[name].classzz);
                delete classMap[name];
                solveCount++;
            }
        }
        if(count === 0) break;
        if(solveCount === 0) {
            logger.error('cannot solve classzz dependency.');
            for(var name in classMap) {
                logger.error(name);
            }
            break;
        }
    } while(true);

    return newClassList;
    /*
    var newList = [];

    var n=newClassList.length;
    for(var i=n-1;i>=0;i--) {
        var found = false;
        for(var j=i+1;j<n;j++) {
            if(newClassList[i].className == newClassList[j].className) {
                found = true;
                break;
            }
        }
        if(!found) {
            newList.push(newClassList[i]);
        }
    }
    return newList;
    */
}

function writeClassListToOutput(classList, outputFileName, append) {

    var outputFunc=undefined;
    var outputFd=undefined;
    if(outputFileName) {
        outputFd = fs.openSync(outputFileName, (append?'a':'w'));
        outputFunc = function(str) {
            fs.writeSync(outputFd, str.toString());
        };
    } else {
        outputFunc = function(str) {
            util.print(str);
        };
    }
    try {
        for(var i=0,n=classList.length;i<n;i++) {
            //iterateFile(classList[i], outputFunc);
            var classzz = classList[i];
            logger.log('   ' + classzz.className);
            outputFunc(fs.readFileSync(classzz.filePath));
        }
    } finally {
        if(outputFd) {
            fs.closeSync(outputFd);
        }
    }
}

function listClass(filePath, classList, packageName, targetClasses) {
    if(!fs.existsSync(filePath)) {
        logger.error('file not exists. ' + filePath);
        return;
    }
    var stats = fs.statSync(filePath);
    if(stats.isFile()) {
        if(filePath.match(/\.js$/)) {
            var name = path.basename(filePath).replace(/\.js$/, '');
            var className = (packageName?(packageName+'.'):'') + name;
            var found=false;
            if(targetClasses) {
                for(var i=0, n=targetClasses.length; i<n; i++) {
                    if(targetClasses[i] === className) {
                        found = true;
                        break;
                    }
                }
            } else {
                found = true;
            }
            if(found) {
                classList.push({
                    className: className,
                    filePath: filePath
                });
            }
        }
        return;
    } else {
        var files = fs.readdirSync(filePath);
        if(!packageName) packageName = path.basename(filePath);
        else packageName += '.' + path.basename(filePath);

        var p;
        for(var i=0,n=files.length; i<n; i++) {
            p = path.join(filePath, files[i]);
            listClass(p, classList, packageName, targetClasses);
        }
    }
}

function listClassFromClassPath(classPath, targetClasses, classList) {

    if(!fs.existsSync(classPath)) {
        logger.error('classPath(' + classPath + ') is not exists.');
        return;
    }
    var stats = fs.statSync(classPath);
    if(!stats.isDirectory()) {
        return;
    }

    var files = fs.readdirSync(classPath);
    var filePath;
    for(var i=0,n=files.length; i<n; i++) {
        filePath = path.join(classPath, files[i]);
        stats = fs.statSync(filePath);
        if(stats.isDirectory()) {
            listClass(filePath, classList, undefined, targetClasses);
        } else {
            //root
            listClass(filePath, classList, undefined, targetClasses);
        }
    }
}

function getClassListFromClassPath(classPath, targetClasses) {

    var classList = [];
    for(var i=0, n=classPath.length; i<n; i++) {
        var cp = classPath[i].trim();
        if(cp) listClassFromClassPath(cp, targetClasses, classList);
    }
    if(targetClasses) {
        // check if targetClasses not in classList
        for(var i=0,n=targetClasses.length; i<n; i++) {
            var found = false;
            for(var j=0,jn=classList.length; j<jn; j++) {
                if(targetClasses[i] == classList[j].className) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                logger.error('could not found ' + targetClasses[i]);
            }
        }
    }
    return classList;
}

function getListFromFile(configFile) {

    if(!fs.existsSync(configFile)) {
        logger.error('file not exists. ' + configFile);
        return null;
    }
    var content = fs.readFileSync(configFile);
    var list=[];
    content.toString().split('\n').forEach(function(line) {
        if(line.trim().length>0) list.push(line);
    });
    return list;
}

function getClassName(classInfo) {
    return (classInfo.packageName?(classInfo.packageName+'.'):'')+classInfo.className;
}

function check_package(classList) {
    for(var i=0,n=classList.length; i<n; i++) {
        var classzz = classList[i];
        var ret = getClassInfo(classzz);
        if(!ret || !ret.className) {
            logger.error('cannot get classzz info from ' + classzz.filePath);
        } else {
            var className = classzz.className;
            if(className != getClassName(ret)) {
                logger.error('wrong classzz name. ' + getClassName(ret) +
                        ' and ' + className + ' are different.');
            } else if(!ret.className.match(/^[A-Z][A-Za-z0-9_]+$/)) {
                logger.error('wrong classzz name. ' + className + 'is not match /^[A-Z][A-Za-z0-9_]+$/');
            }
        }
    }
}

function run(options) {

    options = options || {};
    var action            = options['action'];
    var classPath         = options['classPath'];
    var targetClasses     = options['targetClasses'];
    var targetClassesFile = options['targetClassesFile'];
    var outputFileName    = options['output'];
    var append            = options['append'];
    var noLog             = options['noLog'];
    mIsTupaiCore          = options['isTupaiCore'];
    mIgnoreNotFound       = options['ignoreNotFound'];

    if(noLog) {
        logger.log = function() {};
    }

    if(!classPath) {
        logger.error('missing required option classPath');
        return 1;
    } else if(typeof(classPath) === 'string') {
        classPath = classPath.split(';');
    } else if(classPath instanceof Array) {
    } else {
        logger.error('wrong classPath Object.');
        return 1;
    }
    //console.log('Current directory: ' + process.cwd());

    mClassPath = classPath;

    if(targetClasses) {
        if(typeof(targetClasses) === 'string') {
            targetClasses = [targetClasses];
        } else if(!(targetClasses instanceof Array)) {
            logger.error('targetClasses must be an array or string');
            return 1;
        }
    } else if(targetClassesFile) {
        targetClasses = getListFromFile(targetClassesFile);
        if(!targetClasses) {
            logger.error('cannot get classes from ' + targetClassesFile);
            return 1;
        }
    }

    if(action == 'check') {
        var classList = getClassListFromClassPath(classPath, targetClasses);
        check_package(classList);
    } else if(action === 'list') {

        var classList = getClassListFromClassPath(classPath, targetClasses);
        classList = solveDependencyUseList(classList);

        console.log('[');
        for(var i=0, n=classList.length; i<n; i++) {
            console.log('{');
            console.log('"name": "' + classList[i].className + '",');
            console.log('"path": "' + classList[i].filePath + '"');
            if(i < n-1) console.log('},');
            else console.log('}');
        }
        console.log(']');
    } else if(action === 'merge') {

        var classList = getClassListFromClassPath(classPath, targetClasses);
        classList = solveDependencyUseList(classList);
        /*
        for(var i=0, n=classList.length; i<n; i++) {
            console.log(classList[i].className + ':' + classList[i].filePath);
        }
        */
        writeClassListToOutput(classList, outputFileName, append);
    } else {
        logger.error('unknow action ' + action);
    }

    /*
    if(logger.errorCount > 0) {
        console.error('got some errores');
    }
    */
    return logger.errorCount;
}

exports.run = function(options, end) {
    var ret=run(options);
    end && end(ret)
    return ret;
};
/*
run({
    action: 'merge',
    targetClassesFile: 'libs/mustache-template-engine.classpath',
    //output: '/Users/hu.hua/tmp/txt',
    classPath: './src;./libs;'
});
*/
