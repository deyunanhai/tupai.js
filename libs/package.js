/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
(function (global) {

    function copy(targetElement, providers, override) {

        for ( var name in providers) {
            if (override || typeof targetElement[name] === 'undefined') {
                targetElement[name] = providers[name];
            }
        }
        return targetElement;
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
    }

    var classProvider = {};

    function createPackage(packagename, defaultPackageClass) {

        var packageObj = classProvider;
        var nameArr = packagename ? packagename.split('.') : [];
        for ( var i = 0, n=nameArr.length; i < n; i++) {
            var name = nameArr[i];
            var obj = packageObj[name];
            if (!obj) {
                obj = defaultPackageClass || {};
                packageObj[name] = obj;
            }
            packageObj = obj;
        }
        return packageObj;
    }

    function findClass(classPathArr) {

        var nameArr = classPathArr;
        var className = nameArr[nameArr.length-1];

        var packageObj = classProvider;
        for ( var i = 0, n=nameArr.length; i < n; i++) {
            var name = nameArr[i];
            var obj = packageObj[name];
            if(!obj) return null;
            packageObj = obj;
        }
        return packageObj;
    }

    var mLoadingQueue={};
    var mRemoteBaseUrl = '';
    var mAutoLoad = true;
    var mCacheEnabled = true;
    function mergeClassByClassPath(packageObj, classPath) {

        if(!classPath) return;
        var nameArr = classPath.split('.');
        var className = nameArr[nameArr.length-1];

        var cp = packageObj._classProvider;
        if(cp[className]) return;

        var classObj = findClass(nameArr)
        if(!classObj) {

            // add to waitQueue
            if(!packageObj._waitQueue) {
                packageObj._waitQueue = {};
            }
            packageObj._waitQueue[classPath]=undefined;

            // check if loading
            var arr = mLoadingQueue[classPath];
            if(arr) {
                arr.push(packageObj);
                return;
            } else {
                mLoadingQueue[classPath] = arr = [];
                arr.push(packageObj);
            }

            if(!mAutoLoad) return;
            // add script to head
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            if (window.ActiveXObject) {
                s.onreadystatechange = function() {
                    if (s.readyState == 'complete' || s.readyState == 'loaded')  {
                        didJSLoaded(classPath);
                    }
                };
            } else {
                s.onload = function(){
                    didJSLoaded(classPath);
                };
            }
            var src = mRemoteBaseUrl + classPath.split('.').join('/') + '.js';
            if(!mCacheEnabled) {
                src += '?' + Date.now();
            }
            s.src = src;
            document.getElementsByTagName('head')[0].appendChild(s);

            //throw new Error('cannot find package!' + classPath);
        } else {
            cp[className] = classObj;
        }
    }

    function didClassLoaded(classPath) {
        //console.log('did class loaded ' + classPath);
        var arr = mLoadingQueue[classPath];
        if(!arr) return;
        for(var i=0, n=arr.length; i<n; i++) {
            var packageObj = arr[i];
            var packageWaitQueue = packageObj._waitQueue;
            if(!packageWaitQueue) continue;

            delete packageWaitQueue[classPath];
            mergeClassByClassPath(packageObj, classPath);
            packageObj.checkAndRun();
        }
        delete mLoadingQueue[classPath];
    }

    function didJSLoaded(classPath) {
        //console.log('did js loaded ' + classPath);
        var classObj = findClass(classPath.split('.'));
        if(!classObj) return;

        didClassLoaded(classPath);
    }

    var packageClass = createClass({
        initialize: function(packageName) {
            packageName = packageName || '';
            //this._packageName = packageName;
            this._packageObj = createPackage(packageName);
            this._classProvider = {};
            this._classObject = undefined;
            this._packageName = packageName;
            this._className = undefined;
            this._runQueue = [];
        },
        use: function(packageName) {
            mergeClassByClassPath(this, packageName);
            return this;
        },
        checkAndRun: function() {
            if(this._waitQueue) {
                for(var name in this._waitQueue) {
                    return false;
                }
                delete this._waitQueue;
            }
            while(true) {
                var task = this._runQueue.shift();
                if(!task) break;
                task(this);
            }
            if(this._className)
                didClassLoaded(this._packageName + '.' + this._className);
        },
        // define(className, callback);
        // define(callback);
        define: function(arg1, arg2) {
            this._runQueue.push(function(THIS) {
                if(typeof arg1 === 'string') {
                    var className = arg1;
                    var callback = arg2;
                    var obj = ((typeof callback !== 'function') ? callback : callback(THIS._classProvider));
                    THIS._packageObj[className] = obj;
                    THIS._classProvider[className] = obj;
                    THIS._className = className;
                    THIS._classObject = obj;
                } else {
                    var callback = arg1;
                    if(!THIS._classObject) throw new Error('must define with name first.');
                    var obj = ((typeof callback !== 'function') ?
                               callback :
                               callback.apply(THIS._classObject, [THIS._classProvider]));
                    if(obj) {
                        copy(THIS._classObject, obj, true);
                    }
                }
            });
            this.checkAndRun();
            return this;
        },
        run: function(callback) {
            this._runQueue.push(function(THIS) {
                if(typeof callback !== 'function') throw Error();
                callback(THIS._classProvider);
            });
            this.checkAndRun();
            return this;
        }
    });

    var BaseClass = createClass({initialize: function() {}});
    BaseClass.forName = function(name) {

        if(!name) throw new Error('cannot find package!' + name);
        var classObj = findClass(name.split('.'));
        if(!classObj) throw new Error('cannot find package!' + name);
        return classObj;
    };
    BaseClass.extend = function(prototype, properties) {

        var parent = this;
        var extendedClass = createClass(prototype, properties);

        //extendedClass.prototype.__proto__ = parent.prototype;
        copy(extendedClass.prototype, parent.prototype, false);

        extendedClass.prototype.SUPER = this.prototype;
        extendedClass.SUPER = this;
        extendedClass.extend = parent.extend;
        return extendedClass;
    };

    global.Package = function(name){
        return new packageClass(name);
    };
    global.Package.setBaseUrl = function(url) {
        mRemoteBaseUrl = url;
    };
    global.Package.setAutoLoad = function(autoLoad) {
        mAutoLoad = autoLoad;
    };
    global.Package.setCacheEnabled = function(cacheEnabled) {
        mCacheEnabled = cacheEnabled;
    };
    global.Package.Class = BaseClass;
    global.Package.classProvider = classProvider;

})(window);
