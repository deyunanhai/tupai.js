/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */

(function() {

    var mClassPath;
    var mClassList;
    var mIsTupaiCore;
    var mIgnoreNotFound;
    function getClassFromClassName(className, arr) {

        var classPath = mClassPath;
        for(var i=0, n=classPath.length; i<n; i++) {
            var f = new File(classPath[i] + '/' + className.split('.').join('/') + '.js');
            if(f.exists) {
                arr.push({
                    className: className,
                    filePath: f.toString()
                });
                return true;
            } else {
                var f = new File(classPath[i] + '/' + className.split('.').join('/'));
                if(f.isDirectory) {
                    var files = f.list();

                    for(var i=0,n=files.length; i<n; i++) {
                        var name = files[i].name;
                        if(files[i].isFile && name.match(/\.js$/)) {
                            name = name.replace(/\.js$/, '');
                            var c = {
                                className: className+'.'+name,
                                filePath:  files[i].toString()
                            };
                            arr.push(c);
                        }
                    }
                    return true;
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

    function iterateFile(class, callback) {
        console.log('   ' + class.className);
        var f = new File(class.filePath);
        try {
            var str=null;
            while((str=f.read(102400)) != null) {
                callback(str);
            }
        } catch(e) {
            console.print_stack_trace(e);
        } finally {
            f.close();
        }
    }

    function getClassInfo(class) {
        var tree = parse(class.filePath);
        var ret = {};
        var gotPackageName = false;
        visit_tree(tree, {
            got_call: function(node) {
                var pName = getFunctionParameter(node, 'Package');
                var cName = getFunctionParameter(node, 'define');
                if(pName) {
                    if(gotPackageName) {
                        console.error('duplicate package. old=' + ret.packageName + ' new=' + pName);
                    } else {
                        ret.packageName = pName;
                        gotPackageName = true;
                    }
                }
                if(cName && !ret.className) {
                    ret.className = cName;
                }
            }
        });
        return ret;
    }

    function parseDirtyUseList(class, map) {
        var tree = parse(class.filePath);
        var arr = [];
        visit_tree(tree, {
            got_call: function(node) {
               var className = getFunctionParameter(node, 'use');
               if(!className) return;

               if(!mIsTupaiCore) {
                   if(className.match(/^tupai\./)) return;
               }
               if(!getClassFromClassName(className, arr)) {
                   if(!mIgnoreNotFound) {
                       console.error('cannot found ' + className + ' in ' + class.className);
                   //} else {
                       //console.debug('cannot found ' + className + ' in ' + class.className);
                   }
               }
            }
        });
        map[class.className] = {useList: arr, class: class};
        for(var i=0, n=arr.length; i<n; i++) {
            parseDirtyUseList(arr[i], map);
        }
    }

    function hasClass(arr, class) {
        for(var i=0, n=arr.length; i<n; i++) {
            if(arr[i].className === class.className) return true;
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
                    newClassList.push(classMap[name].class);
                    delete classMap[name];
                    solveCount++;
                }
            }
            if(count === 0) break;
            if(solveCount === 0) {
                console.error('cannot solve class dependency.');
                for(var name in classMap) {
                    console.error(name);
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
        var outputFile=undefined;
        if(outputFileName) {
            outputFile = new File(outputFileName);
            if(append) outputFile.open('write,append,create');
            else outputFile.open('write,replace,create');
            outputFunc = function(str) {
                outputFile.write(str);
            };
        } else {
            outputFunc = function(str) {
                print(str);
            };
        }
        try {
            for(var i=0,n=classList.length;i<n;i++) {
                iterateFile(classList[i], outputFunc);
            }
        } finally {
            if(outputFile) {
                outputFile.close();
            }
        }
    }

    function listClass(filePath, classList, packageName, targetClasses) {
        var f = new File(filePath);
        if(!f.exists) {
            console.error('file not exists. ' + filePath);
            return;
        } else if(f.isFile) {
            if(filePath.match(/\.js$/)) {
                var name = f.name.replace(/\.js$/, '');
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
                        filePath: f.toString()
                    });
                }
            }
            return;
        } else {
            var files = f.list();
            if(!packageName) packageName = f.name;
            else packageName += '.' + f.name;

            for(var i=0,n=files.length; i<n; i++) {
                listClass(files[i].toString(), classList, packageName, targetClasses);
            }
        }
    }

    function listClassFromClassPath(classPath, targetClasses, classList) {
        var f = new File(classPath);
        if(!f.isDirectory) {
            return;
        }

        var files = f.list();
        for(var i=0,n=files.length; i<n; i++) {
            if(files[i].isDirectory) {
                listClass(files[i].toString(), classList, undefined, targetClasses);
            } else {
                //root
                listClass(files[i].toString(), classList, undefined, targetClasses);
            }
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
                    console.error('could not found ' + targetClasses[i]);
                }
            }
        }
    }

    function getClassListFromClassPath(classPath, targetClasses) {

        var classList = [];
        for(var i=0, n=classPath.length; i<n; i++) {
            listClassFromClassPath(classPath[i], targetClasses, classList);
        }
        return classList;
    }

    function getListFromFile(configFile) {
        var f = new File(configFile);
        if(!f.exists) {
            console.error('file not exists. ' + configFile);
            return null;
        }
        f.open('read');
        var line = null;
        var list = [];
        try {
            while((line=f.readln())!=null) {
                list.push(line);
            }
        } finally {
            f.close();
        }
        return list;
    }

    function getClassName(classInfo) {
        return (classInfo.packageName?(classInfo.packageName+'.'):'')+classInfo.className;
    }

    function check_package(classList) {
        for(var i=0,n=classList.length; i<n; i++) {
            var class = classList[i];
            var ret = getClassInfo(class);
            if(!ret.className) {
                console.error('cannot get class info from ' + class.filePath);
            } else {
                var className = class.className;
                if(className != getClassName(ret)) {
                    console.error('wrong class name. ' + getClassName(ret) +
                            ' and ' + className + ' are different.');
                } else if(!ret.className.match(/^[A-Z][A-Za-z0-9_]+$/)) {
                    console.error('wrong class name. ' + className + 'is not match /^[A-Z][A-Za-z0-9_]+$/');
                }
            }
        }
    }

    function run() {
        var options = __global.options || {};

        var action            = options['action'];
        var classPath         = options['classPath'];
        var targetClasses     = options['targetClasses'];
        var targetClassesFile = options['targetClassesFile'];
        var outputFileName    = options['output'];
        var append            = options['append'];
        var noLog             = options['noLog'];
        mIsTupaiCore          = options['isTupaiCore'];
        mIgnoreNotFound       = options['ignoreNotFound'];

        var errorCount = 0;
        var consoleErrorFunc = console.error;
        console.error = function() {
            errorCount++;
            consoleErrorFunc.apply(console, arguments);
        };

        if(noLog) {
            console.log = function() {};
        }

        if(!classPath) {
            console.error('missing required option classPath');
            return 1;
        } else if(typeof(classPath) === 'string') {
            classPath = classPath.split(';');
        } else if(classPath instanceof Array) {
        } else {
            console.error('wrong classPath Object.');
            return 1;
        }

        mClassPath = classPath;

        if(targetClasses) {
            if(typeof(targetClasses) === 'string') {
                targetClasses = [targetClasses];
            } else if(!(targetClasses instanceof Array)) {
                console.error('targetClasses must be an array or string');
                return 1;
            }
        } else if(targetClassesFile) {
            targetClasses = getListFromFile(targetClassesFile);
            if(!targetClasses) {
                console.error('cannot get classes from ' + targetClassesFile);
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
                console.debug(classList[i].className + ':' + classList[i].filePath);
            }
            */
            writeClassListToOutput(classList, outputFileName, append);
        } else {
            console.error('unknow action ' + action);
        }

        if(errorCount > 0) throw new Error();
        else return 0;
    }

    run();
})();
