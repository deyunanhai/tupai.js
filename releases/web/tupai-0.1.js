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
/**
 * @class   tupai.events.Events
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * ### example
 *     @example
 *     Package('demo')
 *     .use('tupai.events.Events')
 *     .run(function(cp) {
 *         var events = new cp.Events();
 *         events.addEventListener('hoge', function(e) {
 *             logOnBody('hoge is fired. message is ' + e.message);
 *         });
 *
 *         events.fire('hoge', {message: 'hoge hoge'});
 *     });
 *
 * ### fireDelegate example
 *     @example
 *     Package('demo')
 *     .use('tupai.events.Events')
 *     .define('Test', function(cp) { return Package.Class.extend({
 *         didReciveMessage: function(e) {
 *             logOnBody('hoge\'s didReciveMessage is fired. message is ' + e.message);
 *         }
 *     });}).run(function(cp) {
 *         var test = new cp.Test();
 *         var events = new cp.Events();
 *         events.addEventListener('hoge', test);
 *         events.fireDelegate('hoge', 'didReciveMessage', {message: 'hoge hoge'});
 *     });
 *
 * ### Events base Model
 *     @example
 *     Package('demo')
 *     .use('tupai.events.Events')
 *     .define('Model', function(cp) { return cp.Events.extend({
 *         initialize: function() {
 *             this.SUPER.initialize.apply(this, arguments);
 *             this._map = {};
 *         },
 *         set: function(obj) {
 *             if(!obj) return;
 *             for(var name in obj) {
 *                 var oldV = this._map[name];
 *                 var newV = obj[name];
 *                 this._map[name] = newV;
 *                 var type = (oldV?'change':'add');
 *                 this.fire(type+':'+name, {
 *                     name: name,
 *                     oldValue: oldV,
 *                     newValue: newV
 *                 });
 *             }
 *         }
 *     });}).run(function(cp) {
 *         var test = new cp.Model();
 *         test.on('change:color', function(args) {
 *             logOnBody(args.name + ' is changed. ' + args.oldValue + ' -> ' + args.newValue);
 *         });
 *         test.on('add:color', function(args) {
 *             logOnBody(args.name + ' is added. ' + args.newValue);
 *         });
 *         test.set({
 *             color: 'oldValue'
 *         });
 *         test.set({
 *             color: 'newValue'
 *         });
 *     });
 *
 */
Package('tupai.events')
.define('Events', function(cp) { return Package.Class.extend({

    /**
     * initialize
     *
     */
    initialize : function (args) {
        this._events = {};
    },

    /**
     * fire event
     * @param {String} type
     * @param {Object} [parameter]
     *
     */
    fire: function(type, parameter) {
        var chain = this._events[type];
        if(chain) {
            var e = parameter || {};
            e.eventName = type;
            e.stop = false;
            for(var i=0,n=chain.length;i<n;i++) {
                if(!chain[i]) continue;

                chain[i](e);
                if(e.stop) break;
            }
        }
    },

    /**
     * fire event and execute delegate method
     * @param {String} name event name
     * @param {String} type delegate method name
     * @param {Object} [parameter]
     *
     */
    fireDelegate: function(name, type, parameter) {
        var chain = this._events[name];
        if(chain) {
            var e = parameter || {};
            e.targetName = name;
            e.eventName = type;
            e.stop = false;
            for(var i=0,n=chain.length;i<n;i++) {
                if(!chain[i]) continue;

                if(chain[i][type]) {
                    chain[i][type](e);
                    if(e.stop) break;
                }
            }
        }
    },

    /**
     * same as addEventListener.
     * @param {String} type eventType
     * @param {Object} listener function or class instance
     * @param {boolean} [first=true] add listener to the first of events pool
     *
     */
    on: function(type, listener, first) {
        return this.addEventListener(type, listener, first);
    },

    /**
     * add event listener
     * @param {String} type eventType
     * @param {Object} listener function or class instance
     * @param {boolean} [first=true] add listener to the first of events pool
     *
     */
    addEventListener: function(type, listener, first) {
        var chain = this._events[type];
        if(!chain) {
            this._events[type] = chain = [];
        } else {
            if(chain.indexOf(listener) >= 0) return false;
        }
        if(first) chain.unshift(listener);
        else chain.push(listener);
        return true;
    },

    /**
     * same as removeEventListener.
     * @param {String} type eventType
     * @param {Object} listener function or class instance
     *
     */
    off: function(type, listener) {
        return this.removeEventListener(type, listener);
    },

    /**
     * remove listener from events pool
     * @param {String} type eventType
     * @param {Object} listener function or class instance
     *
     */
    removeEventListener: function(type, listener) {
        var chain = this._events[type];
        if(!chain) return;
        var index;
        if((index=chain.indexOf(listener)) < 0) return false;

        delete chain[index];
        return true;
    },

    /**
     * remove all listeners
     * @param {String} type eventType
     *
     */
    removeAllEventListener: function(type) {
        delete this._events[type];
    },

    /**
     * clear all listeners
     *
     */
    clear: function() {
        this._events = {};
    }
});});
/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.util')
.define('MemCache', function(cp) { return Package.Class.extend({
    _limit: undefined,
    _storage: undefined,
    initialize: function(limit, overflowRemoveSize) {

        this._limit = limit || 300;
        this._overflowRemoveSize = overflowRemoveSize || (this._limit/10);
        this._storage = [];
    },
    setDelegate: function(delegate) {
        this._delegate = delegate;
    },
    _cacheGC: function(fromHead) {
        var i,n;
        var storage = this._storage;
        var len = this._overflowRemoveSize;
        // don't use array's slice function because this action will create a new instance of array use too memory.
        if(fromHead) {
            for(i=0;i<len;i++) {
                storage.shift();
            }
        } else {
            for(i=0;i<len;i++) {
                storage.pop();
            }
        }
        this._delegate && this._delegate.didMemCacheGC &&
        this._delegate.didMemCacheGC(this);
    },
    push: function(data) {
        if(this._storage.length >= this._limit) {
            this._cacheGC(true);
        }
        this._storage.push(data);
        return true;
    },
    unshift: function(data) {
        if(this._storage.length >= this._limit) {
            this._cacheGC(false);
        }
        this._storage.unshift(data);
        return true;
    },
    clear: function() {
        this._storage=[];
    },
    iterator: function(callback) {
        var storage = this._storage;
        for(var i=0, n=storage.length; i<n; i++) {
            callback(storage[i]);
        }
    },
    filter: function(callback) {
        var storage = this._storage;
        var new_storage = [];
        for(var i=0, n=storage.length; i<n;i++) {
            if(callback(storage[i], i)) new_storage.push(storage[i]);
        }
        this._storage = new_storage;
    },
    remove: function(index) {
        var storage = this._storage;
        var ret = storage.splice(index, 1);
        if(!ret || ret.length < 1) return undefined;
        return ret[0];
    },
    removeByElement: function(data) {
        var index = this._storage.indexOf(data);
        return this.remove(index);
    },
    concatFirst: function(arr) {

        if(this._storage.length + arr.length > this._limit) {
            this._cacheGC(false);
        }
        this._storage = arr.concat(this._storage);
        return true;
    },
    concat: function(arr) {
        if(this._storage.length + arr.length > this._limit) {
            this._cacheGC(true);
        }
        // don't use array's concat function because this action will create a new instance of array use too memory.
        var storage = this._storage;
        for(var i=0,n=arr.length;i<n;i++) {
            storage.push(arr[i]);
        }
        return true;
    },
    getStorage: function() {
        return this._storage;
    },
    swapStorage: function(storage) {
        this._storage = storage;
    },
    get: function(index) {
        return this._storage[index];
    },
    size: function() {
        return this._storage.length;
    }
});});
/**
 * @class   tupai.model.DataSet
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * this class instance is create by Cache(HashCache or QueueCache) class
 * see {@link tupai.model.CacheManager}
 *
 */
Package('tupai.model')
.define('DataSet', function(cp) { return Package.Class.extend({

    /**
     * initialize
     * @param {Object} cache cache object
     * @param {Object} options
     * @param {Function} [options.filter]
     *
     */
    initialize: function(cache, args) {
    },

    /**
     * iterate cache item
     * @param {Function} callback
     *
     */
    iterator: function(callback) {
    },

    /**
     * get cache by id or index
     * @param {String} id id or index
     *
     */
    get: function(id) {
    },

    /**
     * get size of cache items
     *
     */
    size: function() {
    }
});});
/**
 * @class   tupai.model.caches.HashCacheDataSet
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * this class instance is create by HashCache.
 * see {@link tupai.model.caches.HashCache}
 *
 */
Package('tupai.model.caches')
.use('tupai.model.DataSet')
.define('HashCacheDataSet', function(cp) { return cp.DataSet.extend({

    /**
     * initialize
     * @param {Object} cache cache object
     * @param {Number} size cache size
     * @param {Object} options
     * @param {Function} [options.filter]
     *
     */
    initialize: function(cache, size, args) {

        this.SUPER.initialize.apply(this, arguments);
        if(!cache) throw new Error('missing required parameter. cache');

        this._cache = cache;
        this._size = size;
        if(args && args.filter) {
            var newCache = {};
            var limit = args.limit;
            var count=0;
            var filter = args.filter;
            for(var name in cache) {
                if(filter(cache[name], name)) {
                    newCache[name] = cache[name];
                    count++;
                    if(limit && (count) >= limit) {
                        break;
                    }
                }
            }
            this._cache = newCache;
            this._size = count;
        }
    },

    /**
     * iterate cache item
     * @param {Function} callback
     *
     */
    iterator: function(callback) {
        var storage = this._cache;
        for(var name in storage) {
            callback(storage[name], name);
        }
    },

    /**
     * get cache by id or index
     * @param {String} id id or index
     *
     */
    get: function(id) {
        var storage = this._cache;
        return storage[id];
    },

    /**
     * get size of cache items
     *
     */
    size: function() {
        return this._size;
    }
});});
/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.util')
.define('HashUtil', function(cp) { return {

    merge: function (dest, src) {
        if(!src) return dest;
        dest = dest || {};
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                dest[key] = src[key];
            }
        }
        return dest;
    },

    equals: function(o1, o2) {

        if(o1 == o2) return true;
        if(!o1 || !o2) return false;

        for (key in o1) {
            if(o1[key] != o2[key]) return false;
        }
        for (key in o2) {
            if(o1[key] != o2[key]) return false;
        }
        return true;
    },
    clone: function(obj) {
        var newObj = {};
        if(obj) {
            for(var name in obj) {
                newObj[name] = obj[name];
            }
        }
        return newObj;
    },
    getValueByName: function(pattern, data) {
        if(!data) return undefined;
        names = pattern.split('.');
        var d = data;
        var name;
        for(var i=0, n=names.length; i<n; i++) {
            var name = names[i];
            d = d[name];
            if(!d) return d;
        }
        return d;
    },
    only: function(funcName, source, keys) {

        if(!source) return false;
        var ret = true;
        for(var key in source) {
            if(keys.indexOf(key) < 0) {
                ret = false;
                console.error(key + ' is unknown parameter in ' + funcName);
            }
        }
        return ret;
    },
    swap: function(dst, src) {
        var n = arguments.length;
        if(!dst || !src) return;

        var old={};
        for(var name in src) {
            old[name] = dst[name];
            dst[name] = src[name];
        }
        return old;
    },
    require: function(source, keys) {

        if(!source) throw new Error('missing required parameter.');
        for(var i=0, n=keys.length; i<n; i++) {
            var key = keys[i];
            if (source[key] == null) {
                throw new Error('key :' + key +' required.');
            }
        }
    }
};});
/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.util')
.define('HttpUtil', function(cp) {

    function getQueryStringByUrl(url, key, default_) {
        if (default_==null) default_='';
        key = key.replace(/[\[]/,'\\\[').replace(/[\]]/,'\\\]');
        var regex = new RegExp('[\\?&]'+key+'=([^&#]*)');
        var qs = regex.exec(url);
        if(qs == null)
            return default_;
        else
            return qs[1];
    }
    function getUrlWithoutQueryString(url) {
        return url.split('?')[0];
    }
    function getQueryString(key, default_) {
        return getQueryStringByUrl(window.location.href, key, default_);
    }
    function compareUrlWithOutQueryString(srcUrl, tarUrl) {
        return (getUrlWithoutQueryString(srcUrl) ==
                getUrlWithoutQueryString(tarUrl));
    }

    function createRequester() {
        var xhr;
        try { xhr = new XMLHttpRequest(); } catch(e) {
            try { xhr = new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {
                try { xhr = new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {
                    try { xhr = new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {
                        try { xhr = new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {
                            throw new Error( 'This browser does not support XMLHttpRequest.' );
                        }
                    }
                }
            }
        }
        return xhr;
    }

    function encode(obj) {
        var set = [], key;

        for ( key in obj ) {
            var val = obj[key];
            if(val === undefined) continue;
            set.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }

        return set.join('&');
    }

    function encodeJson(obj) {

        if( typeof obj === 'object' && obj !== null ) {
            var d;
            if (obj instanceof Array) {
                d = [];
                for(var i=0,n=obj.length;i<n;i++) {
                    d.push(encodeJson(obj[i]));
                }
            } else {
                d = {};
                for ( var key in obj ) {
                    d[key] = encodeJson(obj[key]);
                }
            }
            return d;
        } else {
            if(!obj) return obj;
            else return encodeURIComponent(obj);
        }
    }

    function doAjax(url, success, error, options) {
        var xhr = createRequester(),
            options = options || {},
            success = success || function() {},
            error = error || function() {},
            method = options.method || 'GET',
            header = options.header || {},
            ctype = options.ctype || (( method === 'POST' ) ? 'application/x-www-form-urlencoded' : ''),
            data = options.data || '',
            key;

        xhr.onreadystatechange = function() {
            if ( xhr.readyState === 4 ) {
                if ( (xhr.status >= 200 && xhr.status < 300) || xhr.status == 0 ) {
                    success(xhr.responseText, xhr);
                } else {
                    error(xhr);
                }
            }
        };

        if ( typeof data === 'object' ) {
            if(options.type === 'json') {
                data = JSON.stringify(encodeJson(data));
            } else {
                data = encode(data);
            }
        }

        //console.log(method + ' ' + url + ' -- ' + data);
        xhr.open(method, url, true);

        if ( ctype ) {
            xhr.setRequestHeader('Content-Type', ctype);
        }

        for ( key in header ) {
            xhr.setRequestHeader(key, header[key]);
        }

        //console.log(method + ' ' + url + ' -- ' + data);
        xhr.send(data);

        return xhr;
    }

    var loadFlg = false;
    var ajaxQueue = [];
    var onLoadFunc = function() {
        setTimeout(function(){
            loadFlg = true;
            var item;
            while((item=ajaxQueue.shift())) {
                doAjax.apply(this, item.param);
            }
        },10);
    }
    if(window.addEventListener) {
        window.addEventListener('load', onLoadFunc, false);
    } else {
        window.attachEvent('onload', onLoadFunc);
    }

    function doAfterLoad(param) {
        if(!loadFlg) ajaxQueue.push({param: param});
        else doAjax.apply(this, param);
    }

    return {
        encode: encode,
        ajax: function(url, success, error, options) {
            doAfterLoad([url, success, error, options]);
        }
    };
});
/**
 * @class   tupai.net.JsonpClient
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * execute request.
 * see {@link tupai.model.ApiManager}
 * */
Package('tupai.net')
.define('JsonpClient', function(cp) { return Package.Class.extend({

    /**
     * initialize
     * @param {Object} config
     * @param {Object} config.defaultRequestHeaders request headers
     * @param {Boolean} [config.autoIndex=false] auto change callbackName
     *
     */
    initialize : function (options) {

        this._autoIndex = true;
        if(options) {
            if(options.hasOwnProperty('autoIndex')) {
                this._autoIndex = options.autoIndex;
            }
        }
        if(this._autoIndex) {
            this._index = 0;
        }
    },
    _setupCallback: function(callbackName, request, responseDelegate) {
        var THIS = this;
        window[callbackName] = function(json) {
            if(THIS._autoIndex) {
                delete window[callbackName];
            }
            var response = {
                header: {},
                status: 200,
                statusText: 'OK',
                responseText: JSON.stringify(json),
                response: json
            }
            responseDelegate &&
            responseDelegate.didHttpRequestSuccess &&
            responseDelegate.didHttpRequestSuccess(response, request);
        };
    },
    _setupScriptTag: function(url) {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src=url;
        document.getElementsByTagName('head')[0].appendChild(s);
    },

    /**
     * execute request
     * @param {tupai.net.HttpRequest} request
     * @param {Object} [responseDelegate]
     * @param {Function} [responseDelegate.didHttpRequestSuccess] parameters: response, request
     * @param {Function} [responseDelegate.didHttpRequestError] parameters: response, request
     *
     */
    execute: function(request, responseDelegate) {

        if(!request) {
            throw new Error('missing required parameter.');
        }

        var callbackName = '__tupai_jsonpCallbck';
        if(this._autoIndex) {
            this._index ++;
            callbackName += this._index;
        }
        var url = request.getUrl();
        var queryString = request.getQueryString();
        if(url.indexOf('?') > 0) url += '&';
        else url += '?';
        url += 'callback=' + callbackName;
        if(queryString) {
            url += '&' + queryString;
        }
        this._setupCallback(callbackName, request, responseDelegate);
        //setTimeout(this._setupScriptTag, 10, url);
        this._setupScriptTag(url);
    }
});});
/**
 * @class   tupai.net.HttpRequest
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 * see {@link tupai.model.ApiManager}
 *
 */
Package('tupai.net')
.use('tupai.util.HashUtil')
.define('HttpRequest', function(cp) { return Package.Class.extend({

    /**
     * initialize
     * @param {Object} config
     * @param {String} config.url request url
     * @param {Object} [config.headers] http request headers
     * @param {Object} [config.type='json'] http request type
     * @param {Object} [config.method='GET'] http request method
     * @param {Object} [config.parameters] request parameters
     * @param {Object} [config.queryParameters] request queryParameters
     * @param {Object} [config.formDatas] request formDatas
     * @param {Object} [config.attributes] request custom attributes
     *
     *
     */
    initialize: function(config) {

        cp.HashUtil.require(config, ['url']);
        this._url = config.url;
        this._headers = config.headers || {};
        this._type = config.type || 'json';
        this._method = config.method;
        this._attributes = config.attributes;
        this._noFormData = !!(!this._method || this._method.match(/get/i));
        this._parameters = config.parameters;

        this._queryParameters = config.queryParameters;
        this._formData = config.formData;
    },

    /**
     * add some params to request
     * @param {Object} params
     * @param {Object} [params.headers] http request headers
     * @param {Object} [params.parameters] request parameters
     * @param {Object} [params.queryParameters] request queryParameters
     * @param {Object} [params.formDatas] request formDatas
     * @param {Object} [params.attributes] request custom attributes
     *
     */
    addAll: function(params) {
        this.addParameters(params.parameters);
        this.addQueryParameters(params.queryParameters);
        this.addFormDatas(params.formDatas);
        this.addAttributes(params.attributes);
        this.addHeaders(params.headers);
    },

    /**
     * add some headers to request
     * @param {Object} headers http request headers
     *
     */
    addHeaders: function(headers) {
        this._headers = cp.HashUtil.merge(this._headers, headers);
    },

    /**
     * add some custom attributes to request
     * @param {Object} attributes http request custom attributes
     *
     */
    addAttributes: function(attributes) {
        this._attributes = cp.HashUtil.merge(this._attributes, attributes);
    },

    /**
     * add some parameters to request
     * @param {Object} parameters http request parameters
     *
     * those parameters will add to formDatas when method is POST,
     * add to queryParameters otherwise.
     *
     */
    addParameters: function(parameters) {
        this._parameters = cp.HashUtil.merge(this._parameters, parameters);
    },

    /**
     * add some query parameters to request
     * @param {Object} parameters http request query parameters
     *
     */
    addQueryParameters: function(parameters) {
        this._queryParameters = cp.HashUtil.merge(this._queryParameters, parameters);
    },

    /**
     * add some form datas to request
     * @param {Object} parameters http request form data
     *
     * this will ignore if method isn't POST
     *
     */
    addFormDatas: function(parameters) {
        this._formData = cp.HashUtil.merge(this._formData, parameters);
    },

    /**
     * get url
     * @return {String} url
     *
     */
    getUrl: function() {
        return this._url;
    },

    /**
     * get type
     * @return {String} type
     *
     */
    getType: function() {
        return this._type;
    },

    /**
     * get http headers
     * @return {Object} headers
     *
     */
    getHeaders: function() {
        return this._headers;
    },
    getQueryData: function() {
        if(this._noFormData && this._parameters) {
            return cp.HashUtil.merge(this._parameters, this._queryParameters);
        } else {
            return this._queryParameters;
        }
    },
    getQueryString: function() {
        var paramStr='';

        var queryData = this.getQueryData();
        if(queryData) {
            for (var name in queryData) {
                var val = queryData[name];
                if(val === undefined) continue;
                paramStr += name + '=' + encodeURIComponent(val) + '&';
            }
        }

        if(paramStr.length > 1) return paramStr.substring(0, paramStr.length-1);
        else return null;
    },

    /**
     * get custom attributes
     * @return {Object} attributes
     *
     */
    getAttributes: function() {
        return this._attributes;
    },

    /**
     * get custom attribute by name
     * @param {String} name
     * @return {Object} attribute
     *
     */
    getAttribute: function(name) {
        if(!this._attributes) return undefined;
        else return this._attributes[name];
    },

    /**
     * get parameters
     * @return {Object} parameters
     *
     */
    getParameters: function() {
        return this._parameters;
    },

    /**
     * get parameter by name
     * @param {String} name
     * @return {String} parameter
     *
     */
    getParameter: function(name) {
        if(!this._parameters) return undefined;
        else return this._parameters[name];
    },
    getData: function() {

        if(!this._noFormData && this._parameters) {
            return cp.HashUtil.merge(this._parameters, this._formData);
        } else {
            return this._formData;
        }
    },
    setRequestName: function(requestName) {
        this._requestName = requestName;
    },
    getRequestName: function() {
        return this._requestName;
    },
    getName: function() {
        return this._name;
    },
    setName: function(name) {
        this._name = name;
    },
    getName: function() {
        return this._name;
    },

    /**
     * get http method
     * @return {String} http method
     *
     */
    getMethod: function() {
       return this._method;
    }
});});
/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.util')
.define('CommonUtil', function(cp) {
    var elm = document.createElement('div');
    var getDataSet;
    if (!elm.dataset) {
        /*
        var camelize = function(str) {
            return str.replace(/-+(.)?/g, function(match, chr) {
                return chr ? chr.toUpperCase() : '';
            });
        };
        */
        var toDash = function(str) {
            return str.replace(/([A-Z])/g, function(m) { return '-'+m.toLowerCase(); });
        };
        getDataSet = function(element, name) {
            var dataName = 'data-';
            var attrs = element.attributes;
            var attrName  = dataName + toDash(name);

            var attr = attrs[attrName];
            return attr && attr.value;
        }
    } else {
        getDataSet = function(element, name) {
            return element.dataset[name];
        }
    }

    var haveClassList = !!elm.classList;

    var bind = function() {
        var args = Array.prototype.slice.call(arguments);
        var func = args.shift(), object = args.shift();
        return function() {
            return func.apply(object, args.concat(Array.prototype.slice.call(arguments)));
        };
    };
    var isValidUrl = function(url) {
        if(!url) return false;
        return !!url.match(/^(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/);
    };
    var isValidHttpUrl = function(url) {
        if(!url) return false;
        return !!url.match(/^(https?)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/);
    };

    return {
        bind: bind,
        isValidUrl: isValidUrl,
        isValidHttpUrl: isValidHttpUrl,
        haveClassList: haveClassList,
        getDataSet: getDataSet
    };
});
/**
 * @class   tupai.TransitManager
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * you can use this class to transit ViewController by url.
 *
 * you can initialize this Class by create Window use Config.
 * ### example (also see examples/twitter)
 *     new cp.Window({
 *         routes: {
 *             // call window.tansit('/root') will be show RootViewController
 *             '/root' : cp.RootViewController,
 *             // call window.tansit('/root/sub') will be show RootViewController and call RootViewController's transitController to show SubViewController.
 *             '/root/sub' : cp.SubViewController
 *         }
 *     })
 *
 * ### example
 *      var app = cp.ThisApplication.instance;
 *      var win = app.getWindow();
 *      win.transitWithHistory('/root', {hoge: 'hoge'});
 *
 */
Package('tupai')
.use('tupai.util.HashUtil')
.define('TransitManager', function (cp) { return Package.Class.extend({
    _delegate: undefined,
    initialize : function (windowObject, routes) {
        var name, i;

        if(!routes) {
            throw new Error('missing transit_rules.');
        }

        this._history = [];
        this._window = windowObject;

        this._controllerRefs = {};
        for (name in routes) {

            var ruleRegExp = name.replace(/\*/g, '\\w*') + '$';
            var s = name.split('/');

            this._controllerRefs[ruleRegExp] = {
                classzz: routes[name]
            };
        }
    },
    setDelegate: function (delegate) {
        this._delegate = delegate;
    },
    _getController: function (url) {
        var route, controllerRef;
        for (route in this._controllerRefs) {
            if (url.match(route)) {
                controllerRef = this._controllerRefs[route];
                if (!controllerRef.instance) {
                    var classzz = controllerRef.classzz;
                    if(typeof(classzz) === 'string') {
                        var classPoint = Package.Class.forName(classzz);
                        controllerRef.instance = new classPoint(this._window);
                    } else if(typeof(classzz) === 'function') {
                        controllerRef.instance = new controllerRef.classzz(this._window);
                    } else {
                        throw new Error('cannot create view controller.' + classzz);
                    }
                }
                return controllerRef.instance;
            }
        }
        return undefined;
    },
    size: function() {
        return this._history.length;
    },
    lastIndexOf: function(targetUrl) {
        if(!targetUrl) return -1;
        var h = this._history;
        for(var i=h.length-1; i>=0; i--) {
            if(h[i].url == targetUrl) {
                return i;
            }
        }
        return -1;
    },
    indexOf: function(targetUrl) {
        if(!targetUrl) return -1;
        var h = this._history;
        for(var i=0, n=h.length; i<n; i++) {
            if(h[i].url == targetUrl) {
                return i;
            }
        }
        return -1;
    },
    _removeUntil: function(targetUrl) {
        if(!targetUrl) return;
        var prev;
        do {
            prev = this._history.pop();
            if (!prev) {
                break;
            } else if(prev.url == targetUrl) {
                break;
            }
        } while (1);
        return prev;
    },

    /**
     * back to previos ViewController
     * @param {String} [targetUrl]
     *   back to targetUrl, if the targetUrl is not in the stack,
     *   will be clear stack and transit the targetUrl
     * @param {Object} [transitOptions]
     */
    back: function (targetUrl, transitOptions) {
        var prev;
        if (targetUrl) {
            prev = this._removeUntil(targetUrl);
            if(!prev) prev = {url: targetUrl};
        } else {
            prev = this._history.pop();
            if (!prev) return;
        }
        var url = prev.url;

        var options = prev.options;
        var current = this._current;

        transitOptions = transitOptions || {};
        transitOptions.transitType = 2; // back
        //console.log('back to ' + url);
        var ret = this._transit(url, options, transitOptions);
        this._current = prev;
        return ret;
    },

    /**
     * transit the url and put current to stack.
     * @param {String} url ViewController url
     * @param {Object} [options] ViewController options
     * @param {Object} [transitOptions]
     */
    transitWithHistory: function (url, options, transitOptions) {
        if (!this._current) throw new Error('can\'t transit with history.');

        transitOptions = transitOptions || {};
        transitOptions.transitType = 1; // transit

        var current = this._current;
        if (this._transit(url, options, transitOptions)) {
            this._history.push(current);
            return true;
        } else {
            return false;
        }
    },
    _currentRoute: undefined,
    _current: undefined,
    _computeTransitRoute: function (url) {
        if (!url || url.length < 1) return null;
        var route = url.replace(/(^\s+)|((\/|\s)+$)/g, '').split('/');
        if (route.length < 2) return null;

        var currentRoute = this._currentRoute;
        this._currentRoute = route;

        if (!currentRoute) {
            return {
                root: route[0],
                path: route.slice(1)
            };
        }

        var n = currentRoute.length > route.length ? route.length : currentRoute.length;
        if (n === 0) {
            return null;
        }

        var i=1;
        for (;i<n;i++) {
            if (currentRoute[i] != route[i]) {
                break;
            }
        }
        if (i == n && currentRoute.length == route.length) {
            return {
                root: route.slice(0, route.length-1).join('/'),
                path: route.slice(route.length-1)
            }; // same route
        }

        return {
            root: route.slice(0,i).join('/'),
            path: route.slice(i)
        };
    },

    /**
     * transit the url
     * if you want to tansit with history please see {@link tupai.TransitManager#transitWithHistory}
     * @param {String} url ViewController url
     * @param {Object} [options] ViewController options
     * @param {Object} [transitOptions]
     */
    transit: function (url, options, transitOptions) {
        url = url || '/root';
        return this._transit(url, options, transitOptions);
    },
    _transit: function (url, options, transitOptions) {
    //console.log('tansit ' + url + ',options=' + JSON.stringify(options));
/*
        console.log(JSON.stringify(this._computeTransitRoute('/')));
        console.log(JSON.stringify(this._computeTransitRoute('/root')));
        console.log(JSON.stringify(this._computeTransitRoute('/root/aa')));
        console.log(JSON.stringify(this._computeTransitRoute('/root/aa')));
        console.log(JSON.stringify(this._computeTransitRoute('/root/aa/bb')));
        console.log(JSON.stringify(this._computeTransitRoute('/root/cc/dd')));
        console.log(JSON.stringify(this._computeTransitRoute('/dd/cc/dd')));
*/

        if (this._current &&
            this._current.url == url &&
            cp.HashUtil.equals(this._current.options, options)) {
            //console.log('skip this transit');
            return false;
        }

        var route = this._computeTransitRoute(url);
        if (route == null) {
            // should show 404 page?
            return false;
        }
        var rootController = (route.root ? this._getController(route.root) : this._window);
        var rootUrl = route.root;
        transitOptions = transitOptions || {};
        for (var i = 0, n = route.path.length; i < n; i++) {
            var r = route.path[i];
            var controllerUrl = rootUrl + '/' + r;
            var controller = this._getController(controllerUrl);

            if(controller) {
                (controller.viewInit && controller.viewInit(options, url, r));
            }
            if(!rootController.transitController) throw new Error('root controller must have transitController delegate function. ' + url);
            rootController.transitController(controller, controllerUrl, options, transitOptions);

            if(!controller) break;
            rootController = controller;
            rootUrl = controllerUrl;
        }

        this._current = {
            url : url,
            options : options
        };
        return true;
    }
});});
/**
 * @class   tupai.ui.TemplateEngine
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * Create element by template and bindingData
 *
 * you can make a plugin by override the methods
 * also you can override the all of methods or some of it.
 *
 * ### plugin example
 *     Package('plugin')
 *     .use('tupai.ui.TemplateEngine')
 *     .use('tupai.util.HashUtil')
 *     .define('TemplateEnginePlugin', function(cp) {
 *         var createElement = function(element, template, data) {
 *             console.log('createElement');
 *             return Super.createElement.apply(undefine, arguments);
 *         };
 *
 *         var setValue = function(element, value) {
 *             console.log('setValue');
 *             return Super.setValue.apply(undefine, arguments);
 *         };
 *
 *         var getValue = function(element) {
 *             console.log('getValue');
 *             return Super.getValue.apply(undefine, arguments);
 *         };
 *
 *         var Super = cp.HashUtil.swap(cp.TemplateEngine, {
 *             createElement: createElement,
 *             setValue: setValue,
 *             getValue: getValue
 *         })
 *     });
 *
 */
Package('tupai.ui')
.use('tupai.util.CommonUtil')
.use('tupai.util.HashUtil')
.define('TemplateEngine', function(cp) {

    var bindToElement = function(tarElement, data) {
        var elements = tarElement.querySelectorAll('*[data-ch-name]');
        for (var i=0,len=elements.length; i<len; ++i) {
            var elm = elements[i];
            var name = cp.CommonUtil.getDataSet(elements[i], 'chName');

            var value = cp.HashUtil.getValueByName(name, data);
            setValue(elm, value);
        }
        var name = cp.CommonUtil.getDataSet(tarElement, 'chName');
        if(name) {
            var value = cp.HashUtil.getValueByName(name, data);
            setValue(tarElement, value);
        }
    };

    /**
     * create element
     *
     */
    var createElement = function(element, template, data) {
        if(element) {
            bindToElement(element, data);
            return element;
        } else if(template) {
            var rootTag = 'div';
            if(template.match(/^<(tr|th)/)) {
                rootTag = 'tbody';
            } else if(template.match(/^<(tbody|thead)/)) {
                rootTag = 'table';
            }
            var root = document.createElement(rootTag);
            root.innerHTML = template;
            var elem = root.children[0];
            bindToElement(elem, data);
            return elem;
        } else {
            return document.createElement('div');
        }
    };

    /**
     * set element value
     *
     */
    var setValue = function(elm, value) {
        if (elm.length) {
            // select
            var values = (value instanceof Array) ? value : [value];
            for(var i=0, n=elm.length; i<n; i++) {
                var selm = elm[i];
                if (values.indexOf(selm.value) != -1) {
                    selm.selected = true;
                } else {
                    selm.selected = false;
                }
            }
        } else if (elm.value !== undefined) {
            // input system
            if (/radio|checkbox/.test(elm.type)) {
                elm.checked = value;
            } else {
                elm.value = ((value===undefined)?'':value);
            }
        } else if(elm.src !== undefined) {
            elm.src = value;
        } else {
            // other
            if(value === undefined) {
                elm.innerHTML = '';
            } else {
                elm.innerHTML = value;
            }
        }
    };

    /**
     * get element value
     *
     */
    var getValue = function(elm) {
        if(!elm) return null;

        if (elm.length) {
            if(elm.getAttribute('multiple')) {
                var ret=[];
                Array.prototype.forEach.call(elm, function(elm) {
                    if(elm.selected) {
                        ret.push(elm.value);
                    }
                });
                return ret;
            } else {
                return elm.value;
            }
        } else if (elm.value !== undefined) {
            // input system
            if (/radio|checkbox/.test(elm.type)) {
                return elm.checked;
            }
            else {
                return elm.value;
            }
        } else if (elm.src !== undefined) {
            return elm.src;
        } else {
            return elm.innerHTML;
        }

        return null;
    };

    return {
        createElement: createElement,
        setValue: setValue,
        getValue: getValue
    };
});
/**
 * @class   tupai.ui.ViewEvents
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * bind and unbind HTML events
 * you can make a plugin by override the methods
 * also you can override the all of methods or some of it.
 *
 * ### plugin example
 *     Package('plugin')
 *     .use('tupai.ui.ViewEvents')
 *     .use('tupai.util.HashUtil')
 *     .define('ViewEventsPlugin', function(cp) {
 *         var bind = function(tarElement, event, callback, useCapture) {
 *             console.log('bind');
 *             return Super.bind.apply(undefine, arguments);
 *         };
 *
 *         var unbind = function(tarElement, event, callback) {
 *             console.log('unbind');
 *             return Super.unbind.apply(undefine, arguments);
 *         };
 *
 *         var Super = cp.HashUtil.swap(cp.ViewEvents, {
 *             bind: bind,
 *             unbind: unbind
 *         })
 *     });
 *
 */
Package('tupai.ui')
.define('ViewEvents', function(cp) {

    /**
     * bind event to element
     * @param {String} event
     * @param {Function} callback
     * @param {Boolean} useCapture
     *
     */
    var bind = function(tarElement, event, callback, useCapture) {
        if(!tarElement || !event || !callback) throw new Error('missing required parameters');
        return tarElement.addEventListener(event, callback, useCapture);
    };

    /**
     * unbind event to element
     * @param {String} event
     * @param {Function} callback
     *
     */
    var unbind = function(tarElement, event, callback) {
        if(!tarElement || !event || !callback) throw new Error('missing required parameters');
        return tarElement.removeEventListener(event, callback);
    };

    return {
        bind: bind,
        unbind: unbind
    };
});
/**
 * @class   tupai.PushStateTransitManager
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.3
 *
 * html5 history api are support by this class.
 * this class is default tansitManager.
 * if you don't want to use html5 history api for you application
 * you can set the window options like bellow.
 *
 *     new cp.Window({
 *         routes: {
 *             '/root'    : cp.RootViewController,
 *             '/root/timeline': cp.TimeLineViewController
 *         },
 *         disablePushState: true
 *     });
 *
 */
Package('tupai')
.use('tupai.util.HashUtil')
.use('tupai.TransitManager')
.define('PushStateTransitManager', function (cp) { return cp.TransitManager.extend({
    _delegate: undefined,
    initialize : function (windowObject, rules, config) {

        this.SUPER.initialize.apply(this, arguments);

        this._separator = (config && config.separator) || "#!";
        var initialURL = location.href;
        var THIS = this;
        window.addEventListener("popstate", function(jsevent) {
            if(this._stopPopStateEventStatus) return;
            //console.log(jsevent);
            var state = jsevent.state;
            if(!state) return;
            var url = state.url;
            if(!url) return;

            THIS._transit(
                url,
                state.options,
                state.transitOptions);
        });
    },
    _enterStopPopStateEvent: function() {
        if(!this._stopPopStateEventStatus) {
            this._stopPopStateEventStatus = 1;
        } else {
            this._stopPopStateEventStatus++;
        }
        //console.log("_entry " + this._stopPopStateEventStatus);
    },
    _exitStopPopStateEvent: function() {
        //console.log("_exit");
        if(this._stopPopStateEventStatus) this._stopPopStateEventStatus--;
    },
    _removeUntil: function(targetUrl) {
        if(!targetUrl) return;
        var index = this.lastIndexOf(targetUrl);
        if(index < 0) return;
        var bi = this.size() - index;
        var prev = this.SUPER._removeUntil.apply(this, arguments);

        this._enterStopPopStateEvent();
        window.history.go(bi*-1);
        // this can clear forward history. but will push two same state ........
        //window.history.pushState("","","");
        this._exitStopPopStateEvent();

        return prev;
    },
    back: function (targetUrl, transitOptions) {
        var ret = this.SUPER.back.apply(this, arguments);
        if(ret) {
            this._enterStopPopStateEvent();
            window.history.replaceState(
                this._current, "",
                this._createUrl(this._current.url, this._current.options)
            );
            this._exitStopPopStateEvent();
        }
    },
    transitWithHistory: function (url, options, transitOptions) {
        var result = this.SUPER.transitWithHistory.apply(this, arguments);
        if(result) {
            window.history.pushState({
                url:url,
                options:options,
                transitOptions: transitOptions
            }, "", this._createUrl(url, options));
        }
        return result;
    },
    _createOptionsFromStr: function(paramsStr, options) {

        if(!paramsStr) return options;
        var pairs = paramsStr.split('&');
        options = options || {};
        for(var i=0, n=pairs.length; i<n; i++) {
            var c = pairs[i].split('=');
            options[c[0]] = decodeURIComponent(c[1]);
        }
        return options;
    },
    _createQueryString: function(options) {

        var qs = '';
        if(typeof options !== 'object') return qs;
        for(var name in options) {
            var val = options[name];
            qs += '&' + name + '=' + encodeURIComponent(val);
        }
        if(qs.length > 0) qs = qs.substring(1);
        return qs;
    },
    _createUrl: function(url, options) {

        var qs = this._createQueryString(options);
        if(qs.length > 0) {
            if(url.indexOf('?') < 0) url += '?';
            url += qs;
        }
        return this._separator + url;
    },
    transit: function (url, options, transitOptions) {
        if(transitOptions && transitOptions.entry) {
            // entry point

            var escapeRegExp = function (string) {
                return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
            };
            var entryUrl;
            var regexp = new RegExp("^(.*)"+escapeRegExp(this._separator)+"(.*)");
            var matches = (window.location.href+'').match(regexp);
            if(matches) {
                entryUrl = matches[2];
            }

            if(entryUrl) {
                options = {};
                matches = entryUrl.match(/^(.*)\?(.*)$/);
                if(matches) {
                    entryUrl = matches[1];
                    var params = matches[2];
                    options = this._createOptionsFromStr(params, options);
                }

                url = entryUrl;
                Array.prototype.slice.call(arguments).splice(0, 2, entryUrl, options);
            }
        }
        var result = this.SUPER.transit.apply(this, arguments);
        if(result) {
            window.history.replaceState(this._current, "", this._createUrl(url, options));
        }
        return result;
    }
});});
/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * not complete
 * */
Package('tupai.animation')
.use('tupai.util.HashUtil')
.define('TransitAnimation', function(cp) { return Package.Class.extend({
    initialize : function (options) {
        this._options = options;
    },
    startCSSAnimation: function(container, tarView, delegate) {

        if(this._animating) {
            return;
        }
        this._animating = true;

        var options = {};
        this.setupCSSAnimation(container, tarView, options);
        var callback = function () { cleanupOnAnimationEnd(); };
        container._element.addEventListener('webkitTransitionEnd',callback , false);
        var timerId = setTimeout(cleanupOnAnimationEnd, this.getCleanupTimeOut());

        var THIS = this;
        function cleanupOnAnimationEnd (e) {

            clearTimeout(timerId);
            container._element.removeEventListener('webkitTransitionEnd', callback, false);

            THIS.cleanupCSSAnimation(container, tarView, options);

            delegate &&
            delegate.didAnimationEnd &&
            delegate.didAnimationEnd(THIS);
        }
    },
    cleanupCSSAnimation: function(container, tarView, options) {

        var currentStyle = options.currentStyle;
        container.css({
            '-webkit-transition-duration' : null,
            '-webkit-transition-property' : null,
            '-webkit-transform' : null
        });
        tarView.css({
            'position' : currentStyle['position'] || null,
            'overflow-y' : currentStyle['overflow-y'] || null,
            'left' : currentStyle['left'],
            'top' : currentStyle['top']
        });
    },
    setupCSSAnimation: function(container, tarView, options) {

        options.currentStyle = {};
        options.currentStyle['overflow-y'] = tarView.css('overflow-y');
        options.currentStyle['top'] = tarView.css('top') || '0px';
        options.currentStyle['left'] = tarView.css('left') || '0px';
        options.currentStyle['position'] = tarView.css('position');
        tarView.css({
            position: 'absolute',
            top: '0px',
            left: direction === 'right2left' ? ( 1 * window.innerWidth) + 'px' : (-1 * window.innerWidth) + 'px',
            'overflow-y': 'hidden'
        });

        container.css({
            '-webkit-transition-property' : '-webkit-transform',
            '-webkit-transition-duration':  300,
            '-webkit-transform' : 'translate3d(' + (direction === 'right2left' ? (-1 * window.innerWidth) + 'px': window.innerWidth + 'px') + ', 0, 0)' // translate3d width % does not work in android (at least with xperia). i.e translated(-100%, 30, 30);
        });

    },
    getCleanupTimeOut: function() {
        return 500;
    },
});});
/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * not complete
 * */
Package('tupai.animation')
.use('tupai.util.HashUtil')
.define('Transition', function(cp) { return Package.Class.extend({
    initialize : function (options) {
        this._options = options;
    },
    getTransformation: function() {
        return {
            alpha: {
            },
            matrix: {
            }
        }
    },
    startCSSAnimation: function(view, delegate) {

        this.setupCSSAnimation(view);
        var callback = function () { cleanupOnAnimationEnd(); };
        this._element.addEventListener('webkitTransitionEnd',callback , false);
        var timerId = setTimeout(cleanupOnAnimationEnd, this.getCleanupTimeOut());

        var THIS = this;
        function cleanupOnAnimationEnd (e) {

            clearTimeout(timerId);
            view._element.removeEventListener('webkitTransitionEnd', callback, false);

            THIS.cleanupCSSAnimation(view);

            delegate &&
            delegate.didAnimationEnd &&
            delegate.didAnimationEnd(THIS);
        }
    },
    cleanupCSSAnimation: function(view) {
        view.css({
            '-webkit-transition-duration' : null,
            '-webkit-transition-property' : null,
            '-webkit-transform' : null
        });
        if(view._children.length > 1) {
            var prev = view.getChildAt(0);
            prev.clearFromParent();
        }
    },
    setupCSSAnimation: function(view) {
        view.css({
            '-webkit-transition-property' : '-webkit-transform',
            '-webkit-transition-duration':  300,
            '-webkit-transform' : 'translate3d(' + (direction === 'right2left' ? (-1 * window.innerWidth) + 'px': window.innerWidth + 'px') + ', 0, 0)' // translate3d width % does not work in android (at least with xperia). i.e translated(-100%, 30, 30);
        });
    },
    getCleanupTimeOut: function() {
        return 500;
    },
});});
/**
 * @class   tupai.ui.Templates
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * read template from html
 *
 * ### simple initialize from html
 * var templates = new cp.Templates({
 *     html: '<div data-ch-template='template1'>something<div>'
 * });
 *
 * ### simple initialize from remote
 * var templates = new cp.Templates({
 *     url: 'http://demo.local/demo.html'
 * });
 *
 */
Package('tupai.ui')
.use('tupai.util.HttpUtil')
.define('Templates', function(cp) { return Package.Class.extend({
    /**
     * initialize
     * @param {Object} [args]
     *
     * ### args:
     * - {String} [html]: the html template
     * - {String} [url]: this url to download html
     * - {String} [element]: the element's outerHTML will be used
     * - {String} [elementId]: the element's outerHTML will be used
     *
     */
    initialize : function (args) {
        if(!args) throw new Error('missing required parameters.');

        if(args.html) {
            this._parseHtml(args.html);
        } else if(args.url) {
            var THIS = this;
            this._loading = true;
            cp.HttpUtil.ajax(args.url,
                function(html) {
                    try {
                        THIS._parseHtml(html);
                    } finally {
                        THIS._loading = false;
                    }
                },
                function(xhr) {
                    THIS._loading = false;
                    args.error && args.error(xhr);
                }
            );
        } else if(args.element) {
            this._parseHtml(args.element.outerHTML);
        } else if(args.elementId) {
            var elem = document.getElementById(args.elementId);
            if(elem) {
                this._parseHtml(elem.outerHTML);
            } else {
                throw new Error('cannot find [' + args.elementId + '] to create Templates');
            }
        }
    },
    _parseHtml: function(htmlTemplate) {
        var root = document.createElement('div');
        root.innerHTML = htmlTemplate;
        var elements = root.querySelectorAll('*[data-ch-template]');
        var templates={};
        for (var i=0,len=elements.length; i<len; ++i) {
            var element = elements[i];
            var templateId = element.getAttribute('data-ch-template');
            if(!templateId) {
                continue;
            }
            element.removeAttribute('data-ch-template');

            var excludeSubTemplates = true;
            var includeSubTemplatesAttr = element.getAttribute('data-ch-include-sub-templates');
            if(includeSubTemplatesAttr) {
                element.removeAttribute('data-ch-include-sub-templates');
                if(includeSubTemplatesAttr === 'true') {
                    excludeSubTemplates = false;
                }
            }

            if(excludeSubTemplates) {
                element = element.cloneNode(true);
                this._removeSubTemplates(element);
            }

            var html = element.outerHTML;
            templates[templateId] = html;
        }
        this._templates = templates;
        this._onReady();
    },
    _removeSubTemplates: function(element) {
        var subElements = element.getElementsByTagName('*');
        var removeQueue = [];
        for(var i=0, n=subElements.length; i<n; i++) {
            var subElement = subElements[i];
            if(!subElement) continue;
            var templateId = subElement.getAttribute('data-ch-template');
            if(!templateId) {
                continue;
            }
            removeQueue.push(subElement);
        }

        for(var i=0, n=removeQueue.length; i<n; i++) {
            var elem = removeQueue[i];
            //var templateId = elem.getAttribute('data-ch-template');
            //console.log(JSON.stringify({log: 'remove ' + templateId}));
            elem.parentNode.removeChild(elem);
        }
    },
    _onReady: function() {
        this._ready = true;
        if(this._templates && this._waitingQueue) {
            while(true) {
                var q = this._waitingQueue.shift();
                if(!q) break;
                q.callback && q.callback(this._templates[q.id]);
            }
        }
    },

    /**
     * get template by id
     * @param {String} id
     * @param {String} callback
     *
     */
    get: function(id, callback) {
        if(this._ready) {
            var ret = this._templates[id];
            callback && callback(ret);
            return ret;
        } else {
            if(!this._waitingQueue) this._waitingQueue = [];
            this._waitingQueue.push({id: id, callback: callback});
            return undefined;
        }
    }
});}).define(function(cp) { return ({
    register: function(name, args) {
        if(!cp.Templates.instances) {
            cp.Templates.instances={};
        }
        cp.Templates.instances[name] = new cp.Templates(args);
    },
    getInstance: function(name) {
        if(!cp.Templates.instances) {
            return undefined;
        } else {
            return cp.Templates.instances[name];
        }
    },
    getTemplate: function(name, templateId, callback) {
        var instance = cp.Templates.getInstance(name);
        if(!instance) return undefined;

        return instance.get(templateId, callback);
    }
});});

/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.util')
.define('LinkedList', function(cp) { return Package.Class.extend({
    _root: undefined,
    _last: undefined,
    initialize: function() {
        this._size = 0;
    },
    _add: function(first, last, head) {
        if(!this._last) {
            this._root = first;
            this._last = last;
        } else {
            if(head) {
                last.next = this._root;
                this._root.prev = last;
                this._root = first;
            } else {
                this._last.next = first;
                first.prev = this._last;
                this._last = last;
            }
        }
    },
    push: function(data) {

        var node = {data: data, next: undefined, prev: undefined};
        this._add(node, node, false);
        this._size++;
    },
    unshift: function(data) {

        var node = {data: data, next: undefined, prev: undefined};
        this._add(node, node, true);
        this._size++;
    },
    clear: function() {
        this._root = undefined;
        this._last = undefined;
        this._size = 0;
    },
    iterator: function(callback) {

        var c = this._root;
        while(c) {
            callback(c.data);
            c = c.next;
        }
    },
    _findByData: function(data) {
        var current = this._root;
        while(current) {
            if(data === current.data) return current;
            current = current.next;
        }
    },
    _findByIndex: function(index) {
        if(index < 0 || index >= this._size) return undefined;
        var current = this._root;
        while(current) {
            if(index == 0) return current;
            current = current.next;
            index--;
        }
    },
    _remove: function(start, last) {
        //console.log('remove ' + start.data + ':' + last.data);
        if(start.prev) {
            if(last.next) {
                start.prev.next = start.next;
                last.next.prev = last.prev;
            } else {
                this._last = start.prev;
                this._last.next = undefined;
            }
        } else {
            if(last.next) {
                this._root = last.next;
                this._root.prev = undefined;
            } else {
                this._root = this._last = undefined;
            }
        }
    },
    removeByElement: function(data) {
        var node = this._findByData(data);
        if(!node) return undefined;

        this._remove(node, node);
        this._size --;
        return data;
    },
    removeByIndex: function(index) {
        var node = this._findByIndex(index);
        if(!node) return undefined;

        this._remove(node, node);
        this._size --;
        return node.data;
    },
    pop: function() {
        return this.removeLast();
    },
    shift: function() {
        return this.removeFirst();
    },
    removeFirst: function() {

        if(!this._root) return;

        var ret = this._root.data;
        this._root = this._root.next;
        if(!this._root) {
            this._last = undefined;
        } else {
            this._root.prev = undefined;
        }
        this._size --;
        return ret;
    },
    removeLast: function() {

        if(!this._last) return;

        var ret = this._last.data;
        this._last = this._last.prev;
        if(!this._last) {
            this._root = undefined;
        } else {
            this._last.next = undefined;
        }
        this._size --;
        return ret;
    },
    filter: function(callback) {

        var current = this._root;
        var start, last, count=0;
        while(current) {
            if(!callback(current.data, count)) {
                if(!start) {
                    start = current;
                }
                count++;
            } else {
                if(start) {
                    this._remove(start, current.prev);
                    this._size -= count;
                    start = undefined;
                    count = 0;
                }
            }
            last = current;
            current = current.next;
        }
        if(start) {
            this._remove(start, last);
            this._size -= count;
        }
    },
    _createNode: function(arr) {
        var r,l,c;
        var n=arr.length;
        for(var i=0;i<n;i++) {
            c = {data: arr[i], next: undefined, prev: undefined};
            if(!l) {
                r = l = c;
            } else {
                l.next = c;
                c.prev = l;
                l = c;
            }
        }
        if(r && l) {
            return {
                root: r, last: l, count: n
            };
        } else {
            return undefined;
        }
    },
    concatFirst: function(arr) {
        var nodes = this._createNode(arr);
        if(nodes) {
            this._add(nodes.root, nodes.last, true);
            this._size += nodes.count;
        }
    },
    concat: function(arr) {
        var nodes = this._createNode(arr);
        if(nodes) {
            this._add(nodes.root, nodes.last, false);
            this._size += nodes.count;
        }
    },
    get: function(index) {
        if(index < 0 || index >= this._size) return undefined;
        var node = this._findByIndex(index);
        return node?node.data:undefined;
    },
    size: function() {
        return this._size;
    }
});});
/**
 * @class   tupai.util.UserAgent
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * help you to get userAgent easy
 *
 */
Package('tupai.util')
.define('UserAgent', function(cp) {

    var inited = false, ie, firefox, opera, safari, chrome, android, iphone, ipad, mobile, device;
    function init() {
        if (inited) return;
        inited = true;

        var userAgent = navigator.userAgent;
        var pattern = /(?:MSIE.(\d+\.\d+))|(?:(?:Firefox|GranParadiso|Iceweasel).(\d+\.\d+))|(?:Opera(?:.+Version.|.)(\d+\.\d+))|(?:AppleWebKit.(\d+(?:\.\d+)?))/.exec(userAgent)
        iphone = /\b(iPhone|iP[ao]d)/.exec(userAgent);
        if(iphone) {
            var m = userAgent.match(/OS ([_\d\.]+)/);
            if(m && m.length > 1) {
                iphone = parseFloat(m[1].split('_').join('.'));
            } else iphone = 1;
        }
        ipad = /\b(iP[ao]d)/.exec(userAgent);
        android = /Android (\d+(?:\.\d+)+)(-\w+)?;/i.exec(userAgent);
        mobile = /Mobile/i.exec(userAgent);

        android = android && parseFloat(android[1]);
        if(android) {
            device = /Android (\d+(?:\.\d+)+)(-\w+)?; (\w{2,3})\-(\w{2,3});\s([^\/]+)\sBuild/i.exec(userAgent);
            if(device) device = device[5];
        }

        if (pattern) {
            ie = pattern[1] ? parseFloat(pattern[1]) : NaN;
            if (ie && document.documentMode) ie = document.documentMode;

            firefox = pattern[2] ? parseFloat(pattern[2]) : NaN;
            opera = pattern[3] ? parseFloat(pattern[3]) : NaN;
            safari = pattern[4] ? parseFloat(pattern[4]) : NaN;
            if (safari) {
                pattern = /(?:Chrome\/(\d+\.\d+))/.exec(userAgent);
                chrome = pattern && pattern[1] ? parseFloat(pattern[1]) : NaN;
            } else {
                chrome = NaN;
            }
        } else {
            ie = firefox = opera = chrome = safari = NaN;
        }
    }
    return {

        /**
         * get ie version
         * @return {Number} return browser version if is ie
         *
         */
        ie: function() {
            return init() || ie;
        },

        /**
         * get firefox version
         * @return {Number} return browser version if is firefox
         *
         */
        firefox: function() {
            return init() || firefox;
        },

        /**
         * get opera version
         * @return {Number} return browser version if is opera
         *
         */
        opera: function() {
            return init() || opera;
        },

        /**
         * get safari version
         * @return {Number} return browser version if is safari
         *
         */
        safari: function() {
            return init() || safari;
        },

        /**
         * get chrome version
         * @return {Number} return browser version if is chrome
         *
         */
        chrome: function() {
            return init() || chrome;
        },

        /**
         * get iphone browser version
         * @return {Number} return browser version if is iphone browser
         *
         */
        iphone: function() {
            return init() || iphone;
        },

        /**
         * get mobile browser version
         * @return {Number} return browser version if is iphone or ipad or android browser version
         *
         */
        mobile: function() {
            return init() || (iphone || ipad || android || mobile);
        },

        /**
         * get android browser version
         * @return {Number} return browser version if is android browser
         *
         */
        android: function() {
            return init() || android;
        },

        /**
         * get device name. support android only.
         * @return {String} return device name like SC-06D
         *
         */
        device: function() {
            return init() || device;
        },

        /**
         * get ipad browser version
         * @return {Number} return browser version if is ipad browser
         *
         */
        ipad: function() {
            return init() || ipad;
        }
    };
});
/**
 * @class   tupai.model.caches.QueueCacheDataSet
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * this class instance is create by QueueCache
 * see {@link tupai.model.caches.QueueCache}
 *
 */
Package('tupai.model.caches')
.use('tupai.model.DataSet')
.define('QueueCacheDataSet', function(cp) { return cp.DataSet.extend({

    /**
     * initialize
     * @param {Object} cache cache object
     * @param {Object} options
     * @param {Function} [options.filter]
     *
     */
    initialize: function(cache, args) {

        this.SUPER.initialize.apply(this, arguments);
        if(!cache) throw new Error('missing required parameter. cache');

        this._cache = cache;
        if(args && args.filter) {
            var newCache = [];
            var limit = args.limit;
            var count =0;
            var filter = args.filter;
            for(var i=0, n=cache.size(); i<n; i++) {
                if(filter(cache.get(i), i)) {
                    newCache.push(cache.get(i));
                    count++;
                    if(limit && (count) >= limit) {
                        break;
                    }
                }
            }
            this._newCache = newCache;
        }
    },

    /**
     * iterate cache item
     * @param {Function} callback
     *
     */
    iterator: function(callback) {
        if(this._newCache) {
            var storage = this._newCache;
            for(var i=0, n=storage.length; i<n; i++) {
                callback(storage[i]);
            }
        } else {
            this._cache.iterator.apply(this._cache, arguments);
        }
    },

    /**
     * get cache by id or index
     * @param {String} id id or index
     *
     */
    get: function(id) {
        if(this._newCache) {
            var storage = this._newCache;
            return storage[id];
        } else {
            return this._cache.get.apply(this._cache, arguments);
        }
    },

    /**
     * get size of cache items
     *
     */
    size: function() {
        if(this._newCache) return this._newCache.length;
        else return this._cache.size.apply(this._cache, arguments);
    }
});});
/**
 * @class   tupai.model.caches.HashCache
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * cache data in hash by id
 * see {@link tupai.model.CacheManager}
 *
 */
Package('tupai.model.caches')
.use('tupai.model.caches.HashCacheDataSet')
.define('HashCache', function(cp) { return Package.Class.extend({
    _storage: null,

    /**
     * initialize
     * @param {String} name cache name
     * @param {Object} options
     * @param {Object} [options.idField='id'] data id field key
     * @param {Object} [options.memCache] memory cache config
     * @param {Number} [options.memCache.limit] memory cache limit
     * @param {Number} [options.memCache.overflowRemoveSize] number of remove items when reach limit of cache
     * @param {Object} [options.localStorage] use localStorage
     * @param {Object} [options.sesseionStorage] use sesseionStorage
     * see {@link tupai.model.CacheManager#createCache}
     *
     */
    initialize: function(name, options, delegate) {

        options = options || {};

        this._idField = options.idField || 'id';
        this._unique = options.unique;

        this._storage = {};
        this._attributes = options.attributes;
        this._size = 0;
        if(options.memCache) {
            var c = options.memCache;
            this._limit = c.limit;
            this._overflowRemoveSize = c.overflowRemoveSize;
            if(!this._overflowRemoveSize) this._overflowRemoveSize = this._limit/10;
        }
        if(options.localStorage) {
            this._nativeStorage = window.localStorage;
        } else if(options.sessionStorage) {
            this._nativeStorage = window.sessionStorage;
        }
        if(this._nativeStorage) {
            this._nativeStorageKey = '__tupai_'+name;
            var dataText = this._nativeStorage[this._nativeStorageKey];
            if(dataText) {
                this._storage = JSON.parse(dataText);
            }
            for(var name in this._storage) {
                this._size ++;
            }
        }

        this._delegate = delegate;
        this._name = name;
    },

    /**
     * notify cache has been changed
     * @param {Object} [options] custom options
     *
     */
    notifyDataSetChanged : function(options) {
        this._saveToNative();
        this._delegate &&
        this._delegate.didCacheChanged &&
        this._delegate.didCacheChanged(this._name, this, options);
    },

    /**
     * end edit the cache and notify cache has been changed
     * @param {Object} [options] custom options
     *
     */
    end: function(options) {
        this.notifyDataSetChanged(options);
    },

    /**
     * get custom attribute by name.
     * @param {String} name attribute name
     * @return {Object} attribute value
     *
     */
    getAttribute: function(name) {
        return this._attributes && this._attributes[name];
    },

    /**
     * query cache and return {@link tupai.model.DataSet DataSet}
     * @param {Object} args sess {@link tupai.model.DataSet}
     * @return {tupai.model.DataSet} DataSet
     *
     */
    query: function(args) {
        var set = new cp.HashCacheDataSet(this._storage, this._size, args);
        return set;
    },
    _saveToNative: function() {
        if(this._nativeStorage) {
            this._nativeStorage[this._nativeStorageKey] = JSON.stringify(this._storage);
        }
    },
    _cacheGC: function() {
        var len = this._overflowRemoveSize || 100;
        for(var i=0;i<len;i++) {
            L1: while(1) {
                for(var name in this._storage) {
                    if(parseInt(Math.random()*3) == 0) {
                        delete this._storage[name];
                        this._size--;
                        break L1;
                    }
                }
            }
        }
        this._saveToNative();
        this._delegate &&
        this._delegate.didCacheGC &&
        this._delegate.didCacheGC(this._name, this);
    },

    /**
     * get cache name
     * @return {String} name
     *
     */
    getName: function() {
        return this._name;
    },

    getId: function(data) {
        return data[this._idField];
    },
    _push: function(data) {
        var id = this.getId(data);
        if(id == undefined) throw new Error('can\'t get ' + this._idField + ' from data.');
        if(!this._storage.hasOwnProperty(id)) {
            if(this._limit && this._size >= this._limit) {
                this._cacheGC();
            }
            this._size++;
        } else if (this._unique) throw new Error('duplicate key. ' + id);

        this._storage[id] = data;
    },

    /**
     * push data to cache. the method will not notify cache changed.
     * you need to call end function to end edit and notify cache changed.
     * @param {Object} data
     *
     */
    push: function(data) {
        if(data instanceof Array) {
            for(var i=0, n=data.length; i<n; i++) {
                this._push(data[i]);
            }
        } else {
            this._push(data);
        }
    },

    /**
     * set cache filter
     * @param {Function} callback
     * @param {Boolean} [noNotify=false] set this parameter to true will not notify cache changed.
     *
     */
    filter: function(callback, noNotify) {
        var changed = false;
        var name;
        for(name in this._storage) {
            if(!callback(this._storage[name], name)) {
                changed = true;
                delete this._storage[name];
                this._size--;
            }
        }
        if(!noNotify && changed) {
            this.notifyDataSetChanged({action: 'filter'});
        }
    },

    /**
     * push data to top of cache
     * @param {Object} data
     *
     */
    unshift: function(data) {
        this.push(data);
    },

    /**
     * iterate cache item
     * @param {Function} callback
     *
     */
    iterator: function(callback) {
        for(var name in this._storage) {
            callback(this._storage[name], name);
        }
    },

    /**
     * remove element by id
     * @param {Object} id
     *
     */
    remove: function(id) {
        var d = this._storage[id];
        if(this._storage.hasOwnProperty(id)) {
            delete this._storage[id];
            this._size--;
        }
        return d;
    },

    /**
     * remove element
     * @param {Object} element
     *
     */
    removeByElement: function(data) {
        if(!data) return undefined;
        var id = this.getId(data);
        if(this._storage[id] === data) {
            return this.remove(id);
        }
        return undefined;
    },

    /**
     * clear cache
     *
     */
    clear: function() {
        this._storage = {};
        this._size = 0;
    },

    /**
     * get cache by id
     * @param {String} id
     *
     */
    get: function(id) {
        return this._storage[id];
    },

    /**
     * get size of cache items
     *
     */
    size: function() {
        return this._size;
    }
});});
/**
 * @class   tupai.net.HttpClient
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * execute request.
 * see {@link tupai.model.ApiManager}
 *
 * You can ovveride this class to define a special http access
 * #### JSONPClient.js
 *     Package('demo.api')
 *     .define('JSONPClient', function(cp) { return Package.Class.extend({
 *         initialize : function (options) {
 *             this._index = 0;
 *         },
 *         _setupCallback: function(callbackName, request, responseDelegate) {
 *             window[callbackName] = function(json) {
 *                 responseDelegate.didHttpRequestSuccess(json, request);
 *                 delete window[callbackName];
 *             };
 *         },
 *         _setupScriptTag: function(url) {
 *             var s = document.createElement('script');
 *             s.type = 'text/javascript';
 *             s.async = true;
 *             s.src=url;
 *             document.getElementsByTagName('head')[0].appendChild(s);
 *         },
 *         execute: function(request, responseDelegate) {
 *
 *             if(!request) {
 *                 throw new Error('missing required parameter.');
 *             }
 *
 *             this._index ++;
 *             var callbackName = '__jsonpCallbck' + this._index;
 *             var url = request.getUrl();
 *             var queryString = request.getQueryString();
 *             if(url.indexOf('?') > 0) url += '&';
 *             else url += '?';
 *             url += 'callback=' + callbackName;
 *             if(queryString) {
 *                 url += '&' + queryString;
 *             }
 *             this._setupCallback(callbackName, request, responseDelegate);
 *             //setTimeout(this._setupScriptTag, 10, url);
 *             this._setupScriptTag(url);
 *         }
 *     });});
 *
 * #### ApiManagerConfig
 *     Package('demo')
 *     .use('tupai.Application')
 *     .run(function(cp) {
 *         var app = new cp.Application({
 *             apiManager: {
 *                 client: {
 *                     classzz: 'demo.api.JSONPClient',
 *                     ... // other custom attributes
 *                 }
 *             }
 *         });
 *     });
 *
 *
 */
Package('tupai.net')
.use('tupai.util.HttpUtil')
.define('HttpClient', function(cp) { return Package.Class.extend({

    /**
     * initialize
     * @param {Object} config
     * @param {Object} config.defaultRequestHeaders request headers
     *
     */
    initialize : function (config) {

        if(config) {
            this._defaultRequestHeaders = config.defaultRequestHeaders;
            this._fixAjaxCache = !!config.fixAjaxCache;
        }
        if(!this._defaultRequestHeaders) {
            this._defaultRequestHeaders = {
                'Accept': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
                'If-Modified-Since': 'Thu, 01 Jun 1970 00:00:00 GMT'
            };
        }
    },
    _mergeDefault: function(defaultData, data) {
        data = data || {};
        if(defaultData) {
            for ( var name in defaultData) {
                data[name] = defaultData[name];
            }
        }
        return data;
    },
    _getResponseFromXhr: function(xhr, responseText) {
        return {
            header: xhr.getAllResponseHeaders(),
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: responseText
        };
    },
    _execute: function(request, delegate) {

        var url = request.getUrl();
        var queryString = request.getQueryString();
        if(queryString) {
            if(url.indexOf('?') > 0) url += '&';
            else url += '?';
            url += queryString;
        }

        var requestHeader = this._mergeDefault(
                this._defaultRequestHeaders, request.getHeaders());

        var requestMethod = request.getMethod();
        var requestData = request.getData();
        var requestType = request.getType();

        if(this._fixAjaxCache && (!requestMethod || requestMethod.toLowerCase() === 'get')) {
            var p = '__t='+(Date.now?Date.now():(+new Date()));
            if(url.indexOf('?') > 0) url += '&';
            else url += '?';
            url += p;
        }

        var THIS = this;
        cp.HttpUtil.ajax(
            url,
            function(responseText, xhr) {
                var response = THIS._getResponseFromXhr(xhr, responseText);
                delegate &&
                delegate.didHttpRequestSuccess &&
                delegate.didHttpRequestSuccess(response, request);
            },
            function(xhr) {
                var response = THIS._getResponseFromXhr(xhr);
                delegate &&
                delegate.didHttpRequestError &&
                delegate.didHttpRequestError(response, request);
            },
            {
                method: requestMethod,
                data: requestData,
                type: requestType,
                header: requestHeader
            }
        );
    },
    /**
     * execute request
     * @param {tupai.net.HttpRequest} request
     * @param {Object} [responseDelegate]
     * @param {Function} [responseDelegate.didHttpRequestSuccess] parameters: response, request
     * @param {Function} [responseDelegate.didHttpRequestError] parameters: response, request
     *
     */
    execute: function(request, responseDelegate) {
        if(!request) {
            throw new Error('missing required parameter.');
        }
        this._execute(request, responseDelegate);
    }
});});
/**
 * @class   tupai.ui.View
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * Requests from the model the information that it needs to generate an output representation to the user.
 *
 *
 * ### simple example
 *     var view = new cp.View();
 *     view.setValue('something');
 *
 * ### template example
 *     var view = new cp.View({
 *         template: '<div data-ch-name='data'><div>',
 *         templateParameters: {data: 'something'}
 *     });
 *     view.setValue('something');
 *
 * ### subView example
 *     var view = new cp.View({
 *         template: '<div><input data-ch-id='txt' value='hello'><div>'
 *     });
 *     var txt = view.findViewById('txt');
 *     console.log(txt.getValue()); // this will output 'hello' to console
 *
 */
Package('tupai.ui')
.use('tupai.util.CommonUtil')
.use('tupai.util.HashUtil')
.use('tupai.events.Events')
.use('tupai.ui.TemplateEngine')
.use('tupai.ui.ViewEvents')
.define('View', function(cp) { return Package.Class.extend({
    _children: undefined,
    _rendered: undefined,
    _element: undefined,
    _baseViewDelete: undefined,
    _events: undefined,

    /**
     * initialize
     * @param {Object} [args]
     *
     * ### args:
     * - {String} [template]: the html template
     * - {Obejct} [templateParameters]: bind templateParameters to template
     *
     */
    initialize : function (args) {
        this._children = [];

        this._events = undefined;
        this._didLoadFlg = false;
        this._templateEngine = cp.TemplateEngine;
        this._viewEvents = cp.ViewEvents;
        if(args) {
            this._template = args.template;
            this._templateParameters = args.templateParameters;
        }
    },

    /**
     * fire event
     * @param {String} type
     * @param {Object} parameter
     *
     * this will fire event listener of this view and parent view.
     * you can stop fire event listener by set e.stop to true.
     * also you can stop fire parent view's event listener by set e.stopParent to true.
     *
     */
    fire: function(type, parameter) {

        if(!this._events) return;

        var e = parameter || {};
        e.target = this;
        e.stopParent = false;
        this._events.fire(type, e);
        if(!e.stopParent && this._parent) this._parent.fire(name, e);
    },

    /**
     * add event listener.
     * @param {String} type
     * @param {Function} listener
     * @param {Boolean} [first=true] add listener to the first of events pool
     *
     */
    addEventListener: function(type, listener, first) {

        if(!this._events) this._events = new cp.Events();
        this._events.addEventListener(type, listener, first);
    },

    /**
     * remove the listener if exists.
     * @param {String} type
     * @param {Function} listener
     *
     */
    removeEventListener: function(type, listener) {

        if(!this._events) return;
        this._events.removeEventListener(type, listener);
    },

    /**
     * set view delegate
     * @param {Object} delegate
     *
     * ### support delegate callbacks
     * -  viewDidLoad(view);
     * -  viewDidUnload(view);
     * -  viewDidShow(view);
     * -  viewDidHide(view);
     */
    setDelegate: function(delegate) {
        this._baseViewDelete = delegate;
    },

    markNeedRender: function() {
        for(var i=0,n=this._children.length;i<n;i++) {
            var child = this._children[i];
            child.markNeedRender();
        }
        this._rendered = false;
    },

    iterateChildren: function(callback) {
        for(var i=0,n=this._children.length;i<n;i++) {
            var child = this._children[i];
            callback(child);
        };
    },

    /**
     * take this view tree to screen
     * @param {Object} args
     *
     */
    render: function (args) {

        if(!this._rendered) {
            if(!this._parent) { throw new Error('no parent.');}
            this._parent.render(args);
        }

        this._onChildrenRender(args);
    },
    _onHTMLRender: function(parentNode, args) {

        if(this._rendered) return false;

        var template = null;

        this._checkElement();
        if(this.willRender) {
            this.willRender();
        }
        parentNode.appendChild(this._element);

        this._rendered = true;

        if(this.didRender) {
            this.didRender();
        }

        if(this._baseViewDelete && this._baseViewDelete.viewDidRender) {
            this._baseViewDelete.viewDidRender(this);
        }

        this.fire('didRender');

        return true;
    },

    _onChildrenRender: function(args) {

        var containerNode = this._getContainerNode();
        var renderView = function(child) {
            var firsttime = child._onHTMLRender(containerNode, args);
            child._onChildrenRender(args);
            if(firsttime) {
                if(child.didLoad) {
                    child.didLoad();
                }
                if(child._baseViewDelete && child._baseViewDelete.viewDidLoad) {
                    child._baseViewDelete.viewDidLoad(child);
                }
                child.fire('didLoad');
                child._didLoadFlg = true;
            }
        };
        for(var i=0,n=this._children.length;i<n;i++) {
            var child = this._children[i];
            renderView(child);
        };
        if(this._viewIDMap) {
            for(var id in this._viewIDMap) {
                var child = this._viewIDMap[id];
                renderView(child);
            }
        }
    },
    _getContainerNode: function() {
        return this._element;
    },

    /**
     * get html template call by render.
     * you can ovveride this method to return custom template of View.
     *
     */
    getTemplate: function() {

        if(typeof this._template === 'function') {
            return this._template();
        } else {
            return this._template;
        }
    },

    /**
     * get template parameter.
     * this template parameter will bind to template.
     * you can ovveride this method to return custom template parameter.
     *
     */
    getTemplateParameters: function() {

        if(typeof this._templateParameters === 'function') {
            return this._templateParameters();
        } else {
            return this._templateParameters;
        }
    },
    _createElementsIDMap: function() {
        if(this._elementsIDMap) return;

        var elementsIDMap = {};
        this._elementsIDMap = elementsIDMap;

        var elements = this._element.querySelectorAll('*[data-ch-id]');
        for (var i=0,len=elements.length; i<len; ++i) {
            var elm = elements[i];
            var id = cp.CommonUtil.getDataSet(elements[i], 'chId');
            elementsIDMap[id] = elm;
        }
    },
    _checkElement: function() {
        if(this._element) return;

        var template = this.getTemplate();
        var data = this.getTemplateParameters();
        this._element = this._templateEngine.createElement(undefined, template, data);
        if(!this._element) throw new Error('cannot create element');

        this._createElementsIDMap();
    },

    /**
     * set template's parameters.
     * see {@link tupai.ui.TemplateEngine#createElement}
     *
     */
    setTemplateParameters: function(parameters) {
        this._templateParameters = parameters;
        if(this._element) {
            var template = this.getTemplate();
            var data = this.getTemplateParameters();
            this._element = this._templateEngine.createElement(this._element, template, data);
        }
    },

    /**
     * see {@link tupai.ui.View#setTemplateParameters}
     *
     */
    setData: function(data) {
        this.setTemplateParameters(data);
    },

    /**
     * see {@link tupai.ui.View#getTemplateParameters}
     * ovveride this method has no effect
     *
     */
    getData: function() {
        return this.getTemplateParameters();
    },

    /**
     * set view's value.
     * see {@link tupai.ui.TemplateEngine#setValue}
     *
     */
    setValue: function(val) {
        this._checkElement();
        return this._templateEngine.setValue(this._element, val);
    },

    /**
     * get view's value.
     * see {@link tupai.ui.TemplateEngine#getValue}
     *
     */
    getValue: function() {
        this._checkElement();
        return this._templateEngine.getValue(this._element);
    },

    /**
     * add sub view
     * @param {tupai.ui.View} subView
     *
     */
    addSubView: function(subView) {

        this._children.push(subView);
        subView._parent = this;
        if (typeof subView.onAppendedToParent === 'function') {
            subView.onAppendedToParent();
        }
    },

    /**
     * get child by index
     * @param {Number} index
     * @return {tupai.ui.View}
     *
     */
    getChildAt: function(index) {
        if(index <0 || index >= this._children.length) return null;
        else return this._children[index];
    },

    /**
     * find view by id (set by data-ch-id)
     * @param {String} id
     * @return {tupai.ui.View}
     *
     */
    findViewById: function(id) {

        this._checkElement();
        if(!this._viewIDMap) this._viewIDMap = {};

        var view = this._viewIDMap[id];
        if(view === undefined) {
            var element = this._elementsIDMap[id];
            if(!element) {
                return undefined;
            }
            view = this._viewIDMap[id] = new cp.View();
            view._element = element;
            view._parent = this;
            view._rendered = true;
        }

        return view;
    },
    _onRemoveChildren: function() {
        for(var i=0,n=this._children.length;i<n;i++) {
            var c = this._children[i];
            this._removeChild(c);
        }
    },
    _removeChild: function(child) {

        child._onRemoveChildren();

        child._parent = null;
        child._rendered = false;
        child._events = null;
        child._element.parentNode.removeChild(child._element);
        if(child.didUnload) {
            child.didUnload();
        }
        if(child._baseViewDelete && child._baseViewDelete.viewDidUnload) {
            child._baseViewDelete.viewDidUnload(child);
        }
        child.fire('didUnload');
    },

    /**
     * get children size
     * @return {Number}
     *
     */
    getChildrenSize: function() {
        return this._children.length;
    },

    /**
     * clear all children
     *
     */
    clearChildren: function() {

        if(this._viewIDMap) {
            for(var id in this._viewIDMap) {
                var child = this._viewIDMap[id];
                this._removeChild(child);
            }
        }
        return this.clearChildrenByRange(0);
    },

    /**
     * clear children
     * @param {Number} [from=0]
     * @param {Number} [to=size of children]
     *
     */
    clearChildrenByRange: function(from, to) {

        var len = this._children.length;
        if(len == 0 || from >= len || to < 0) return true;

        if(from == undefined || from < 0 ) from = 0;
        if(to   == undefined || to >= len) to = len-1;

        if(from > len) return false;
        for(var i=0, n=to-from;i<=n;i++) {
            this._children[from].clearChildren();
            this.removeChildAt(from);
        }

        // do this in removeChildAt
        //this._children = this._children.slice(0, from).concat(this._children.slice(to+1));
        return true;
    },

    /**
     * remove this view from parent and clear children
     *
     */
    clearFromParent: function() {

        this.clearChildren();
        this.removeFromParent();
    },

    /**
     * remove this view from parent only, don't clear children
     *
     */
    removeFromParent: function() {

        if(!this._parent) return false;
        return this._parent.removeChild(this);
    },

    /**
     * remove child
     * @param {tupai.ui.View} child the child will be remove.
     * @return {tupai.ui.View} view removed
     *
     */
    removeChild: function(child) {
        return this.removeChildAt(this._children.indexOf(child));
    },

    /**
     * remove child by index
     * @param {Number} index
     * @return {tupai.ui.View} view removed
     *
     */
    removeChildAt: function(index) {

        var n = this._children.length;
        if(index < 0 || index >= n.length) return null;

        var child = this._children.splice(index, 1);
        if(!child || !child.length) return null;

        child = child[0];
        this._removeChild(child);
        return child;
    },

    /**
     * set style value
     * @param {String} key
     * @param {String} value
     * @return {tupai.ui.View} this view
     *
     */
    setStyle: function(key, value) {
        this._checkElement();
        if (this._isInteger(value) && cp.View.cssNumber[key]) {
            value = value + 'px';
        }
        this._element.style[key] = value;
        return this;
    },

    /**
     * get style value
     * @param {String} key
     * @return {String} value
     *
     */
    getStyle: function(key) {
        this._checkElement();
        return window.getComputedStyle(this._element).getPropertyValue(key);
    },

    /**
     * get attribute value
     * @param {String} key
     * @return {String} value
     *
     */
    getAttribute: function(key) {
        return this._element.getAttribute(key);
    },

    /**
     * set attribute value
     * @param {String} key
     * @param {String} value
     * @return {tupai.ui.View} this view
     *
     */
    setAttribute: function(key, value) {
        this._element.setAttribute(key, value);
        return this;
    },

    attr: function(first, second) {
        if (second === undefined) {
            console.error('attr function is Deprecated, use getAttribute instead');
            return this._element.getAttribute(first);
        } else {
            console.error('attr function is Deprecated, use setAttribute instead');
            this._element.setAttribute(first, second);
            return this;
        }
    },

    /**
     * add class to element
     * @param {String} name
     * @return {tupai.ui.View} this view
     *
     */
    addClass: function(name) {
        this._checkElement();

        this._element.classList.add(name);
        return this;
    },

    /**
     * remove class from element
     * @param {String} name
     * @return {String} the class name removed
     *
     */
    removeClass: function(name) {
        return this._element.classList.remove(name);
    },

    /**
     * detection class name has been added
     * @param {String} name
     * @return {Boolean}
     *
     */
    hasClass: function(name) {
        return this._element.classList.contains(name);
    },

    /**
     * bind event to element
     * see {@link tupai.ui.ViewEvents#bind}
     * @param {String} event
     * @param {Function} callback
     * @param {Boolean} useCapture
     *
     */
    bind: function(event, callback, useCapture) {
        this._checkElement();
        this._viewEvents.bind(this._element, event, callback, useCapture);
    },

    /**
     * unbind event to element
     * see {@link tupai.ui.ViewEvents#unbind}
     * @param {String} event
     * @param {Function} callback
     *
     */
    unbind: function(event, callback) {
        this._checkElement();
        this._viewEvents.unbind(this._element, event, callback);
    },

    /**
     * get view' status
     * @return {String} view status
     * ### status
     * - unrendered
     * - uninitialized
     * - initialized
     *
     */
    getViewStatus: function() {
        if(!this._rendered) return 'unrendered';
        if(!this._parent) return 'uninitialized';
        return 'initialized';
    },

    /**
     * hide this view
     *
     */
    hide: function() {
        this._checkElement();
        if(this.getStyle('display') === 'none') return;
        this.setStyle('display', 'none');
        this.fire('hide');
        if(this._baseViewDelete && this._baseViewDelete.viewDidHide) {
            this._baseViewDelete.viewDidHide(this);
        }
    },

    /**
     * return true if visible, return false otherwise.
     *
     */
    visible: function() {
        var d = this.getStyle('display');
        return d !== 'none';
    },

    /**
     * show this view
     *
     */
    show: function() {
        this._checkElement();

        if(this.getStyle('display') === 'block') return;
        this.setStyle('display', null);
        this.fire('show');
        if(this._baseViewDelete && this._baseViewDelete.viewDidShow) {
            this._baseViewDelete.viewDidShow(this);
        }
    },

    /**
     * show this view if invisible, hide this view otherwise.
     *
     */
    toggle : function () {
        if (this.getStyle('display') === 'block') {
            this.hide();
            return 'hide';
        } else {
            this.show();
            return 'show';
        }
    },

    html: function(str) {
        this._checkElement();
        if (str === undefined) {
            return this._element.innerHTML;
        }
        else {
            this._element.innerHTML = str;
            return this;
        }
        return this._element.innerHTML;
    },

    getTagName: function() {
        this._checkElement();
        return this._element.tagName;
    },

    _isInteger: function(value) {

        if(value == undefined) return 0;
        return (parseInt(value, 10).toString() === value.toString()) ? 1 : 0;
    },

    // not complete
    startAnimation: function() {
        var currentStyle = {};

        var childrenLength = container._children.length;
        container.addSubView(view);
        view.render();

        var THIS = this;
        startCSSAnimation(container, tarView, {
            didAnimationEnd: function() {
                if (THIS._animating === false) { return; }

                if(container._children.length > 1) {
                    var prev = container.getChildAt(0);
                    prev.clearFromParent();
                }

                THIS.render();
                THIS._animating = false;
                finish && finish();
            }
        });
    },

    // not complete
    animate : function (view, container, direction, finish) {
    }

});}).run(function(cp) {

    cp.View.cssNumber = {
        'width': true,
        'height': true,
        'top': true,
        'left': true,
        'columnCount': true,
        'fillOpacity': true,
        'fontWeight': true,
        'lineHeight': true,
        'opacity': true,
        'orphans': true,
        'widows': true,
        'zIndex': true,
        'zoom': true
    };

    (function(properties) {
        var createProperty = function(name, methodName) {
            cp.View.prototype['get'+methodName] = function() {
                return this.getStyle(name);
            }
            cp.View.prototype['set'+methodName] = function(value) {
                this.setStyle(name, value)
            }
        }
        for(var i=0, n=properties.length; i<n; i++) {
            var property = properties[i];
            var methodName = property.charAt(0).toUpperCase() + property.slice(1);
            createProperty(property, methodName);
        }
    })([
        'height',
        'width',
        'top',
        'left'
    ]);

    if (!cp.CommonUtil.haveClassList) {
        cp.View.prototype.addClass = function(name) {
            this._checkElement();

            var nowName = this.attr('class');
            var newName = null;

            if (!nowName) {
                newName = name;
            } else {
                var res = nowName.split(' ');
                res[res.length] = name;
                newName = res.join(' ');
            }
            this.attr('class', newName);

            return this;
        };
        cp.View.prototype.removeClass = function(name) {
            this._checkElement();

            var nowName = this.attr('class');
            if (nowName) {
                if(nowName.indexOf(name) < 0) return this;

                var list = nowName.split(' ');
                var pos = list.indexOf(name);
                if(pos >=0) {
                    newName = list.splice(0, pos).join(' ');
                    if(list.length > 1) newName += ' ' + list.splice(1).join('');
                    this.attr('class', newName);
                }
            }

            return this;
        };
        cp.View.prototype.hasClass = function(name) {
            var nowName = this.attr('class');
            if (!nowName) {
                return false
            } else {
                return (' ' + nowName + ' ').indexOf(' ' + name + ' ') > -1;
            }
        };
    }
    return undefined;
});

/**
 * @class   tupai.ui.TableView
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * An instance of TableView is a means for displaying hierarchical lists of information.
 * You must define some delegate method in your ViewController
 *
 * ### delegate methods
 * -  numberOfRows(tableView);
 * -  cellForRowAtIndexPath(indexPath, tableView);
 * -  cellForRowAtTop(tableView);
 * -  cellForRowAtBottom(tableView);
 *
 * ### simple example
 *     Package()
 *     .use('tupai.ui.View')
 *     .use('tupai.ui.TableView')
 *     .use('tupai.ViewController')
 *     .define('ViewEventsPlugin', function(cp) { return cp.ViewController.extend({
 *         viewInit: function() {
 *             this._data = ['red','blue','green'];
 *             var view = new cp.TableView();
 *             view.setTableViewDelegate(this);
 *             this.setContentView(view);
 *         },
 *         numberOfRows: function() {
 *             return this._data.length;
 *         },
 *         cellForRowAtTop: function() {
 *             if(this._headerView == null) {
 *                 this._headerView = new cp.View();
 *                 this._headerView.setValue('header');
 *             }
 *             return this._headerView;
 *         },
 *         cellForRowAtBottom: function() {
 *             if(this._bottomView == null) {
 *                 this._bottomView = new cp.View();
 *                 this._bottomView.setValue('footer');
 *             }
 *             return this._bottomView;
 *         },
 *         cellForRowAtIndexPath: function(indexPath, tableView) {
 *             var row = indexPath.row;
 *             var cell = tableView.dequeueReusableCell('demo_cell');
 *             if(cell == null) {
 *                 cell = new cp.View();
 *             }
 *             cell.setValue(this._data[row]);
 *             return cell;
 *         }
 *     });});
 *
 */
Package('tupai.ui')
.use('tupai.ui.View')
.define('TableView', function(cp) { return cp.View.extend({
    _tableViewDelegate: undefined,

    /**
     * initialize
     * @param {Object} [args]
     * see {@link tupai.ui.View#initialize}
     *
     */
    initialize : function (args) {

        cp.View.prototype.initialize.apply(this, arguments);
        this._container = this;
    },

    /**
     * set table view delegate
     * @param {Object} delegate
     *
     * ### delegate methods
     * -  numberOfRows(tableView);
     * -  cellForRowAtIndexPath(indexPath, tableView);
     * -  cellForRowAtTop(tableView);
     * -  cellForRowAtBottom(tableView);
     */
    setTableViewDelegate: function(tableViewDelegate) {
        this._tableViewDelegate = tableViewDelegate;
    },

    /**
     * Returns a reusable table-view cell object located by its type
     * @param {String} type
     *
     */
    dequeueReusableCell: function(type) {
        return null;
    },

    /**
     * set filter to tableview to control show and hide the cell
     * @param {Function} callback
     *
     */
    setFilter: function(callback) {
        this.iterateChildren(function(cell) {

            if(callback(cell)) {
                cell.show();
            } else {
                cell.hide();
            }
        });
    },

    /**
     * load the top new data
     *
     */
    loadTopNewData: function() {
        return this.reloadRowsFrom();
    },

    /**
     * load the bottom new data
     *
     */
    loadBottomNewData: function(length) {
        var from=this._numberOfRows || 0;
        if(length !== undefined) {
            var newLength = this._tableViewDelegate.numberOfRows(this);
            from -= (length - (newLength - from));
        }
        return this.reloadRowsFrom(from);
    },

    /**
     * set table view container id
     *
     */
    setContainerId: function(id) {
        var v = this.findViewById(id);
        if(!v) throw new Error('can\'t find view by ' + id);
        this._container = v;
    },

    _addSubView: function(view) {
        this._container.addSubView(view);
    },

    /**
     * reload this tableView
     *
     */
    reloadData: function() {
        return this.reloadRowsFrom(0);
    },

    /**
     * reload this tableView
     *
     */
    reload: function() {
        return this.reloadRowsFrom(0);
    },

    /**
     * reload this tableView
     * @param {Number} [from]
     *
     */
    reloadRowsFrom: function(from) {

        if(from == undefined || from < 0) from = 0;

        var domFrom = from;
        if(this._hasHeader) domFrom ++;
        if(!this._container.clearChildrenByRange(domFrom)) return;

        if(!this._tableViewDelegate) {
            console.warn('table vie delegate not set. Please set it by tableview.setTableViewDelegate');
            return;
        }
        if(this._tableViewDelegate.cellForRowAtTop) {
            cell = this._tableViewDelegate.cellForRowAtTop(this);
            if(cell) {
                if(!this._hasHeader) {
                    this._addSubView(cell);
                }
                this._hasHeader = true;
            } else {
                if(this._hasHeader) {
                    this.removeChildAt(0);
                }
                this._hasHeader = false;
            }
        }

        var numberOfRows = this._tableViewDelegate.numberOfRows(this);
        this._numberOfRows = numberOfRows;
        if(from < numberOfRows) {
            for(var i=from;i<numberOfRows;i++) {
                var cell = this._tableViewDelegate.cellForRowAtIndexPath({row: i}, this);
                if(!cell) throw new Error('you need return view by row ' + i);
                this._addSubView(cell);
            }
        }

        if(this._tableViewDelegate.cellForRowAtBottom) {
            cell = this._tableViewDelegate.cellForRowAtBottom(this);
            cell && this._addSubView(cell);
        }
        this.render();
    }
});});
/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * @deprecated
 * */
Package('tupai.ui')
.use('tupai.ui.View')
.define('TemplateView', function(cp) { return cp.View.extend({
    initialize : function (args) {
        console.error('TemplateView is Deprecated, use View instead');
        cp.View.prototype.initialize.apply(this, arguments);
    },
});});
/*
 * TODO:
 * - sorted CacheEngine
 * */

/**
 * @class   tupai.model.caches.QueueCache
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * cache data in queue
 * see {@link tupai.model.CacheManager}
 *
 */
Package('tupai.model.caches')
.use('tupai.util.MemCache')
.use('tupai.model.caches.QueueCacheDataSet')
.define('QueueCache', function(cp) { return Package.Class.extend({

    /**
     * initialize
     * @param {String} name cache name
     * @param {Object} options
     * @param {Object} [options.memCache] memory cache config
     * @param {Object} [options.uniqField] memory cache config
     * @param {Number} [options.memCache.limit] memory cache limit
     * @param {Number} [options.memCache.overflowRemoveSize] number of remove items when reach limit of cache
     * @param {Object} [options.localStorage] use localStorage
     * @param {Object} [options.sesseionStorage] use sesseionStorage
     * see {@link tupai.model.CacheManager#createCache}
     *
     */
    initialize: function(name, options, delegate) {

        options = options || {};

        var limit, overflowRemoveSize;
        if(options.memCache) {
            var c = options.memCache;
            limit = c.limit;
            overflowRemoveSize = c.overflowRemoveSize;
        }
        this._storage = new cp.MemCache(limit, overflowRemoveSize);
        this._storage.setDelegate(this);
        this._attributes = options.attributes;

        if(options.localStorage) {
            this._nativeStorage = window.localStorage;
        } else if(options.sessionStorage) {
            this._nativeStorage = window.sessionStorage;
        }
        if(this._nativeStorage) {
            this._nativeStorageKey = '__tupai_'+name;
            var dataText = this._nativeStorage[this._nativeStorageKey];
            if(dataText) {
                this._storage.swapStorage(JSON.parse(dataText));
            }
        }

        this._uniqField = options.uniqField;
        this._delegate = delegate;
        this._name = name;
    },
    didMemCacheGC: function() {
        this._saveToNative();
        this._delegate &&
        this._delegate.didCacheGC &&
        this._delegate.didCacheGC(this._name, this);
    },

    /**
     * get cache name
     * @return {String} name
     *
     */
    getName: function() {
        return this._name;
    },

    /**
     * notify cache has been changed
     * @param {Object} [options] custom options
     *
     */
    notifyDataSetChanged : function(options) {
        this._saveToNative();
        this._delegate &&
        this._delegate.didCacheChanged &&
        this._delegate.didCacheChanged(this._name, this, options);
    },
    _saveToNative: function() {
        if(this._nativeStorage) {
            this._nativeStorage[this._nativeStorageKey] = JSON.stringify(this._storage.getStorage());
        }
    },

    /**
     * end edit the cache and notify cache has been changed
     * @param {Object} [options] custom options
     *
     */
    end: function(options) {
        this.notifyDataSetChanged(options);
    },

    /**
     * query cache and return {@link tupai.model.DataSet DataSet}
     * @param {Object} args sess {@link tupai.model.DataSet}
     * @return {tupai.model.DataSet} DataSet
     *
     */
    query: function(args) {
        var set = new cp.QueueCacheDataSet(this._storage, args);
        return set;
    },

    /**
     * get custom attribute by name.
     * @param {String} name attribute name
     * @return {Object} attribute value
     *
     */
    getAttribute: function(name) {
        return this._attributes && this._attributes[name];
    },

    /**
     * push data to cache. the method will not notify cache changed.
     * you need to call end function to end edit and notify cache changed.
     * @param {Object} data
     *
     */
    push: function(data) {

        if(this._uniqField) data = this._removeDup(data);
        if(data instanceof Array) {
            this._storage.concat(data);
        } else {
            this._storage.push(data);
        }
    },

    /**
     * push data to top of cache
     * @param {Object} data
     *
     */
    unshift: function(data) {

        if(this._uniqField) data = this._removeDup(data);

        if(data instanceof Array) {
            this._storage.concatFirst(data);
        } else {
            this._storage.unshift(data);
        }
    },

    _removeDup: function(data) {

        var newKeys = {};
        var uniqField = this._uniqField;
        if(data instanceof Array) {
            var newData=[];
            for(var i=0, n=data.length; i<n; i++) {
                var key = data[uniqField];
                if(!newKeys[key]) {
                    newData.push(data);
                }
                newKeys[key] = true;
            }
            data = newData;
        } else {
            newKeys[data[uniqField]] = true;
        }

        this._storage.filter(function(d) {
            var key = d[uniqField];
            return !(newKeys[key]);
        });

        return data;
    },

    /**
     * Creates a new array with all of the elements of this array for which the provided filtering function returns true.
     * @param {Function} callback
     * @param {Boolean} [noNotify=false] set this parameter to true will not notify cache changed.
     *
     */
    filter: function(callback, noNotify) {
        var oldSize = this.size();
        this._storage.filter(callback);
        if(!noNotify && this.size() != oldSize) {
            this._delegate.didCacheChanged(this._name, this);
        }
    },

    /**
     * iterate cache item
     * @param {Function} callback
     *
     */
    iterator: function(callback) {
        this._storage.iterator(callback);
    },

    /**
     * remove element by index
     * @param {Number} index
     *
     */
    remove: function(index) {
        return this._storage.remove(index);
    },

    /**
     * remove element
     * @param {Object} element
     *
     */
    removeByElement: function(data) {
        return this._storage.remove(data);
    },

    /**
     * clear cache
     *
     */
    clear: function() {
        this._storage.clear();
    },

    /**
     * get cache by index
     * @param {Number} index
     *
     */
    get: function(index) {
        return this._storage.get(index);
    },

    /**
     * get size of cache items
     *
     */
    size: function() {
        return this._storage.size();
    }
});});
/**
 * @class   tupai.model.ApiManager
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 *
 * ### example
 *
 * #### RootViewController.js
 *     @example
 *     Package('demo')
 *     .use('tupai.ui.View')
 *     .use('tupai.ViewController')
 *     .define('RootViewController', function(cp) { return cp.ViewController.extend({
 *         viewInit: function() {
 *             var contentView = new cp.View();
 *             this.setContentView(contentView);
 *         },
 *         viewDidLoad: function() {
 *             this.registerApiObserver('timeline', this);
 *             this.executeApi({
 *                 name: 'timeline',
 *                 requestName: 'search',
 *                 parameters: {q: 'NHK'}
 *             });
 *         },
 *         viewDidUnload: function() {
 *             this.unRegisterApiObserver('timeline', this);
 *         },
 *         didHttpRequestSuccess: function(e) {
 *             var res = e.response;
 *             this.getContentView().setValue(res.responseText);
 *             logOnBody('[RootViewController]: ' + res.responseText);
 *         },
 *         didHttpRequestError: function(e) {
 *             logOnBody(e);
 *         }
 *     });});
 *
 *     Package('demo')
 *     .use('tupai.Application')
 *     .define('ResponseDelegate', function(cp) { return Package.Class.extend({
 *         didHttpRequestSuccess: function(name, reqName, res, req) {
 *
 *             logOnBody('[ResponseDelegate]: ' + res.responseText);
 *         },
 *         didHttpRequestError: function(name, reqName, res, req) {
 *             logOnBody(res.responseText);
 *         }
 *     });});
 *
 *     Package('demo')
 *     .use('tupai.Application')
 *     .use('demo.RootViewController')
 *     .run(function(cp) {
 *         var apiManagerConfig = {
 *             apiParameterMap: {
 *                 timeline: {
 *                     search: {
 *                         method: 'GET',
 *                         url: '/testData.json',
 *                         parameters: {
 *                             'some_parameter': 'hoge'
 *                         }
 *                     }
 *                 }
 *             },
 *             responseDelegate: {
 *                 classzz: "demo.ResponseDelegate"
 *             }
 *         };
 *         var app = new cp.Application({
 *             window: {
 *                 routes: {
 *                     '/root'    : cp.RootViewController,
 *                 }
 *             },
 *             apiManager: apiManagerConfig
 *         });
 *         app.show('/root');
 *     });
 *
 * ### multi ApiManager example
 *     var app = new cp.Application({
 *         apiManagers: {
 *             manager1: apiManagerConfig1,
 *             manager2: apiManagerConfig2,
 *             ...
 *         },
 *         ...
 *     });
 *
 */
Package('tupai.model')
.use('tupai.events.Events')
.use('tupai.util.HashUtil')
.use('tupai.net.HttpClient')
.use('tupai.net.JsonpClient')
.use('tupai.net.HttpRequest')
.define('ApiManager', function(cp) { return Package.Class.extend({

    /**
     * initialize
     * @param {Object} config
     * @param {Object} config.client HttpClient config
     * @param {Object} [config.client.classzz='tupai.net.HttpClient'] HttpClient class
     * @param {Object} [config.client.type] HttpClient type will be jsonp or http
     * @param {String} [config.requestClasszz='tupai.net.HttpRequest'] HttpRequest class
     * @param {Object} [config.responseDelegate] HttpResponseDelegate config
     * @param {String} [config.responseDelegate.classzz] HttpResponseDelegate class
     * @param {Object} [config.apiParameterMap] see {@link tupai.net.HttpRequest#initialize}
     *
     * ### apiParameterMap example
     *     {
     *         timeline: {
     *             search: {
     *                 method: 'GET',
     *                 url: '/api/items',
     *                 parameters: {
     *                     // some parameter
     *                 },
     *             },
     *             ...
     *         },
     *         ...
     *     }
     *
     *
     */
    initialize: function(config) {

        this._events = new cp.Events();
        if(!config) throw new Error('missing config');

        var clientConfig = config.client;
        this._client = this._createClient(config.client);

        var responseDelegateConfig = config.responseDelegate;
        if(responseDelegateConfig) {
            this._responseDelegate = this._createResponseDelegate(responseDelegateConfig);
        }
        if(config.defaultRequestClasszz) {
            console.error('defaultRequestClasszz is Deprecated, use requestClasszz instead');
        }
        this._requestClass = this._createClass(
            config.defaultRequestClasszz || config.requestClasszz,
            cp.HttpRequest
        );

        this._requestParameterMap = config.apiParameterMap || {};
    },
    _createClass: function(classzz, defaultClasszz) {
        if(classzz) {
            if(typeof(classzz) === 'string') {
                return Package.Class.forName(classzz);
            } else if(typeof(classzz) === 'function') {
                return classzz;
            } else {
                throw new Error('cannot create class ' + classzz);
            }
        } else {
            return defaultClasszz;
        }
    },
    _createResponseDelegate: function(responseDelegateConfig) {
        var cls = this._createClass(responseDelegateConfig.classzz);
        if(cls) return new cls(responseDelegateConfig.config);
        else return undefined;
    },
    _createClient: function(clientConfig) {
        var type = clientConfig && clientConfig.type;
        var cls;
        if(type) {
            if(type === 'jsonp') {
                cls = cp.JsonpClient;
            } else if(type === 'default' || type === 'http') {
                cls = cp.HttpClient;
            } else {
                throw new Error('unknow type ' + type);
            }
        } else {
            cls = this._createClass(clientConfig && clientConfig.classzz, cp.HttpClient);
        }
        return new cls(clientConfig && clientConfig.config);
    },
    getRequestParameter: function(name, requestName) {
        var r = this._requestParameterMap[name];
        if(!r) throw new Error('cannot find request for ' + name + ':' + requestName);
        var request = r[requestName];
        if(!request) throw new Error('cannot find request for ' + name + ':' + requestName);
        return request;
    },
    createRequest: function(params) {
        var requestParameter = this.getRequestParameter(params.name, params.requestName);
        var request = new this._requestClass(requestParameter);
        request.addAll(params);
        request.setName(params.name);
        request.setRequestName(params.requestName);

        return request;
    },

    executeRequest: function(name, requestName, request, success, error) {
        var THIS = this;
        this._client.execute(request, {
            didHttpRequestSuccess: function(response, request) {
                THIS._responseDelegate &&
                THIS._responseDelegate.didHttpRequestSuccess &&
                THIS._responseDelegate.didHttpRequestSuccess(name, requestName, response, request);

                THIS.notify(name, requestName, 'didHttpRequestSuccess', response, request);
                if(typeof(success) == 'function') success(name, requestName, response, request);
            },
            didHttpRequestError: function(response, request) {
                THIS._responseDelegate &&
                THIS._responseDelegate.didHttpRequestError &&
                THIS._responseDelegate.didHttpRequestError(name, requestName, response, request);

                THIS.notify(name, requestName, 'didHttpRequestError', response, request);
                if(typeof(error) == 'function') error(name, requestName, response, request);
            },
        });
    },

    /**
     * execute request
     * @param {Object} options
     * @param {String} options.name api name
     * @param {String} options.requestName request name
     * @param {Object} [options.parameters] request parameters
     * @param {Object} [options.queryParameters] request queryParameters
     * @param {Object} [options.formDatas] request formDatas
     * @param {Object} [options.attributes] request custom attributes
     *
     */
    execute: function(obj, requestName, parameters, queryParameters, formDatas, attributes) {
        var params;
        if(typeof(obj) === 'object') {
            // IF DEBUG
            cp.HashUtil.only('ApiManager.execute ', obj, [
                                      'managerName',
                                      'name',
                                      'requestName',
                                      'parameters',
                                      'queryParameters',
                                      'formDatas',
                                      'attributes',
                                      'success',
                                      'error'
                                   ]);
            params = obj;
        } else {
            console.error('this parameter is Deprecated in ApiManager.execute');
            params = {
                name: obj,
                requestName: requestName,
                parameters: parameters,
                queryParameters: queryParameters,
                formDatas: formDatas,
                attributes: attributes
            };
        }
        var request = this.createRequest(params);
        this.executeRequest(params.name, params.requestName, request, params.success, params.error);
    },

    /**
     * register an observer
     * @param {String} name api name to observer
     * @param {Object} observer observer instance
     * @param {Function} [observer.didHttpRequestSuccess]
     * @param {Function} [observer.didHttpRequestError]
     *
     * ### observer methods parameter
     *     {
     *         name: api name
     *         requestname: request name
     *         response: response object
     *         request: request object
     *         attributes: custom attributes
     *     }
     *
     * @param {boolean} [first=true] add listener to the first of events pool
     *
     */
    registerObserver: function(name, observer, first) {
        this._events.addEventListener(name, observer, first);
    },

    /**
     * delete an observer
     * @param {String} name api name to observer
     * @param {Object} observer observer instance
     *
     */
    unRegisterObserver: function(name, observer) {
        this._events.removeEventListener(name, observer);
    },

    /**
     * notify an event to call observer delegate
     * @param {String} name api name
     * @param {String} requestName request name
     * @param {Object} parameters request parameters
     * @param {Object} queryParameters request queryParameters
     * @param {Object} formDatas request formDatas
     * @param {Object} attributes request attributes
     *
     */
    notify: function(name, requestName, methodName, response, request, attributes) {
        var e = {
            name: name,
            requestName: requestName,
            response: response,
            request: request,
            attributes: attributes
        };
        this._events.fireDelegate(name, methodName, e);
    }
});});
/**
 * @class   tupai.Window
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 * A root element of the defaults is body.
 * The element that add attribute called 'data-ch-window' becomes root Element.
 *
 * ### example
 *     <body>
 *         <div data-ch-window='hoge1'>Hoge</div>
 *         <div data-ch-window='hoge2'>Hoge</div>
 *     </body>
 */
Package('tupai')
.use('tupai.TransitManager')
.use('tupai.ui.View')
.use('tupai.TransitManager')
.use('tupai.PushStateTransitManager')
.define('Window', function(cp) { return cp.View.extend({

    /**
     * initialize
     * @param [config] window config
     * @param [config.routes]
     * @param [config.disablePushState] disable html5 history api
     * ### example with TransisManager
     *     new cp.Window({
     *         routes: {
     *             '/root'    : cp.RootViewController,
     *             '/root/timeline': cp.TimeLineViewController
     *         }
     *     });
     *
     * ### example without TransitManager
     *     new cp.Window({
     *         rootViewController: cp.RootViewController
     *     });
     */
	initialize : function(config) {
		cp.View.prototype.initialize.apply(this,[]);

        this._config = config || {};
        if(this._config.routes) {
            if(config.disablePushState || !('state' in window.history)) {
                this._transitManager = new cp.TransitManager(this, config.routes);
            } else {
                this._transitManager = new cp.PushStateTransitManager(this, config.routes, config.pushState);
            }
            this._transitManager.setDelegate(this);
        } else if(this._config.rootViewController) {
            this._rootViewControllerClasszz = this._config.rootViewController;
        }
	},

    /**
     * get the window config object
     * @param [name] config name
     */
    getConfig: function(name) {
        if(name == undefined) return this._config;
        return this._config[name];
    },

    /**
     * {@link tupai.TransitManager#back}
     */
    back: function () {
        if(!this._transitManager) return;
        this._transitManager.back.apply(this._transitManager, arguments);
    },

    /**
     * {@link tupai.TransitManager#transitWithHistory}
     */
    transitWithHistory: function () {
        if(!this._transitManager) return;
        this._transitManager.transitWithHistory.apply(this._transitManager, arguments);
    },

    /**
     * {@link tupai.TransitManager#transit}
     */
    transit: function () {
        if(!this._transitManager) return;
        this._transitManager.transit.apply(this._transitManager, arguments);
    },

    /**
     * show root ViewController.
     * @param [url] root ViewController url
     * @param [options] root ViewController's options
     */
    showRoot: function(url, options) {

        if(this._transitManager) {
            return this.transit(url, options, {entry: true});
        } else if(!this._rootViewControllerClasszz) {
            throw new Error('missing root view controller.');
        }

        var controller = new this._rootViewControllerClasszz(this);
        controller.viewInit(options, '/root', 'root');
        this.transitController(controller, '/root', options,{});
    },

    transitController: function (controller, url, options, transitOptions) {
        //console.log('transit by window ' + url);
        if(!controller) {
            // show 404
            throw new Error('can\t found controller.('+url+')');
        } else {
            var view = controller.getContentView();
            if(!view) throw new Error('cannot get contentView from ViewController');
            this._displayView(view, transitOptions);
            this._currentController = controller;
        }
    },

    getCurrentController: function() {
        return this._currentController;
    },

    _displayView: function (view, transitOptions) {
        this._startDisplayView = true;
        var THIS = this;
        var finish = function () {
            if(THIS._finishDisplayQueue) {
                var q = THIS._finishDisplayQueue;
                while ((m = q.pop())) {
                    m();
                }
            }
            THIS.enableAction && THIS.enableAction();
            THIS._startDisplayView = false;
        };

        this.disableAction && this.disableAction();
        if(transitOptions.animation !== false) {
            /*if (transitOptions.transitType === 1) {
                this.animate(view, this, 'right2left', finish);
            } else if (transitOptions.transitType === 2) {
                this.animate(view, this, 'left2right', finish);
            } else {*/
                this.clearChildren();
                this.addSubView(view);
                this.render();
                finish();
            //}
        }
    },

    _displayViewWithAnimation: function(view, transitOptions) {
    },

    /**
     * call callback when display contentView
     * @param {Function} callback
     */
    doWhenFinishDisplay: function (callback) {
        if (this._startDisplayView) {
            if(!this._finishDisplayQueue) {
                this._finishDisplayQueue = [];
            }
            this._finishDisplayQueue.push(callback);
        } else {
            callback();
        }
    },

    _checkElement: function() {
        if(this._element) return;

        var winConfig = this._config.winConfig;
        if(winConfig) {
            this._element = winConfig.element;
        } else {
            var arr = document.querySelectorAll('*[data-ch-window]');
            if(!arr || arr.length < 1) {
                this._element =  document.getElementsByTagName('body')[0];
            } else {
                this._element = arr[0];
            }
        }
    },

    _onHTMLRender: function() {
        if(this._rendered) return false;
        this._rendered = true;
        return true;
    },

    /**
     * ovveride View's render
     * @param {Object} [args]
     */
	render: function (args) {
        this._checkElement();
        var topElement = this._element;
        var firsttime = this._onHTMLRender(topElement, args);
		this._onChildrenRender(args);
        if(firsttime) {
            this.didLoad && this.didLoad();
        }
	}
});});

/**
 * @class   tupai.model.CacheManager
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * ### example
 *
 * #### RootViewController.js
 *     @example
 *     // RootViewController.js
 *     Package('demo')
 *     .use('tupai.Application')
 *     .use('tupai.ui.View')
 *     .use('tupai.ViewController')
 *     .define('RootViewController', function(cp) { return cp.ViewController.extend({
 *         viewInit: function() {
 *             this._cacheManager = cp.Application.instance.getCacheManager();
 *             var contentView = new cp.View();
 *             this.setContentView(contentView);
 *         },
 *         viewDidLoad: function() {
 *             this._cacheManager.registerObserver('hashCache', this);
 *             this._cacheManager.registerObserver('queueCache', this);
 *
 *             var cache = this._cacheManager.getCache('hashCache');
 *             cache.push({id: 'key1'});
 *             cache.end();
 *
 *             var cache = this._cacheManager.getCache('queueCache');
 *             cache.push({id: 'key1'});
 *             cache.end();
 *         },
 *         viewDidUnload: function() {
 *             this._cacheManager.unRegisterObserver('hashCache', this);
 *         },
 *         didCacheChanged: function(e) {
 *             logOnBody('didCacheChanged: ' + JSON.stringify(e));
 *
 *             var d;
 *             if(e.name === 'queueCache') {
 *                 d = this._cacheManager.getCache('queueCache').get(0);
 *             } else {
 *                 d = this._cacheManager.getCache('hashCache').get('key1');
 *             }
 *             logOnBody("cacheData: " + JSON.stringify(d));
 *         }
 *     });});
 *
 *     // app.js
 *     Package('demo')
 *     .use('tupai.Application')
 *     .use('demo.RootViewController')
 *     .run(function(cp) {
 *         var cacheManager = {
 *             hashCache: {
 *                 type: 'hash', // default for queue
 *                 config: {
 *                     memCache: {
 *                         limit: 100
 *                     }
 *                 }
 *             },
 *             queueCache: {
 *                 config: {
 *                     memCache: {
 *                         limit: 100
 *                     }
 *                 }
 *             }
 *         };
 *         var app = new cp.Application({
 *             window: {
 *                 routes: {
 *                     '/root'    : cp.RootViewController,
 *                 }
 *             },
 *             cacheManager: cacheManager
 *         });
 *         app.show('/root');
 *     });
 *
 *
 */
Package('tupai.model')
.use('tupai.events.Events')
.use('tupai.model.caches.QueueCache')
.use('tupai.model.caches.HashCache')
.define('CacheManager', function(cp) { return Package.Class.extend({

    /**
     * initialize
     * @param {Object} config
     * see {@link tupai.model.CacheManager#createCache}
     *
     */
    initialize: function(config) {

        this._events = new cp.Events();
        this._caches = {};
        if(config) {
            for(var name in config) {
                var cacheConfig = config[name];
                this.createCache(name, cacheConfig);
            }
        }
    },

    /**
     * remove a cache by name
     * @param {String} name
     *
     */
    removeCache: function(name) {
        if(this._caches[name]) {
            delete this._caches[name];
        }
    },

    /**
     * create cache By config
     * @param {String} name
     * @param {Object} cacheConfig
     *
     * ### cacheConfig example
     *     {
     *         timeline: {
     *             type: 'hash', // queue or hash, default is queue
     *             classzz: 'cache.Cache', // cache class path
     *             config: {
     *                 memCache: {
     *                     limit: 100,
     *                     overflowRemoveSize: 20
     *                 },
     *                 localStorage: {},
     *                 sesseionStorage: {}
     *             },
     *             ... // other custom attributes
     *         },
     *         ...
     *     }
     *
     */
    createCache: function(name, cacheConfig) {
        var cacheCls;

        var type = cacheConfig.type;
        if(typeof(type) === 'string') {
            if(type == 'queue') {
                cacheCls = cp.QueueCache;
            } else if(type === 'hash') {
                cacheCls = cp.HashCache;
            } else {
                throw new Error('unkown cache type. ' + type);
            }
        } else {
            var classzz = cacheConfig.classzz;
            if(!classzz) {
                cacheCls = cp.QueueCache;
            } else {
                if(typeof(classzz) === 'string') {
                    cacheCls = Package.Class.forName(classzz);
                } else if(typeof(classzz) === 'function') {
                    cacheCls = classzz;
                } else {
                    throw new Error('cannot create cache class ' + classzz);
                }
            }
        }
        var cache = new cacheCls(name, cacheConfig.config, this);
        this._caches[name] = cache;
        return cache;
    },

    didCacheGC: function(name) {
        this.notifyGC(name);
    },

    didCacheChanged: function(name, cache, options) {
        this.notifyChanged(name, options);
    },

    /**
     * get cache object
     * @param {String} name
     * @return {Object} cache object
     *
     */
    getCache: function(name) {
        var cache = this._caches[name];
        return cache;
    },

    /**
     * iterate cache
     * @param {Function} callback
     *
     */
    cacheIterator: function(callback) {
        var caches = this._caches;
        for(var name in caches) {
            callback(name, caches[name]);
        }
    },

    /**
     * get all caches name array
     * @return {Array} cache names
     *
     */
    getCacheNames: function() {
        var names = [];
        for(var name in this._caches) {
            names.push(name);
        }
        return names;
    },

    getAttribute: function(name, attrName) {
        return this.getCache(name).getAttribute(attrName);
    },

    /**
     * iterate the cache items
     * @param {String} name
     * @param {Function} callback
     *
     */
    iterator: function(name, callback) {
        return this.getCache(name).iterator(callback);
    },

    /**
     * get the cache item by id (HashCache) or index (QueueCache)
     * @param {String} name
     * @param {Object} id/index
     * @return {Object} cached item
     *
     */
    get: function(name, id) {
        return this.getCache(name).get(id);
    },

    /**
     * get the cache items count
     * @param {String} name
     * @return {Number} cached items count
     *
     */
    size: function(name) {
        return this.getCache(name).size();
    },

    /**
     * register an observer
     * @param {String} name cache name to observer
     * @param {Object} observer observer instance
     * @param {Object} [observer.didCacheChanged]
     * @param {Object} [observer.didCacheGC]
     *
     * ### observer methods parameter
     *     {
     *         name: cache name
     *         options: some custom options
     *     }
     *
     * @param {boolean} [first=true] add listener to the first of events pool
     *
     */
    registerObserver: function(name, observer, first) {
        this._events.addEventListener(name, observer, first);
    },

    /**
     * delete an observer
     * @param {String} name cache name to observer
     * @param {Object} observer observer instance
     *
     */
    unRegisterObserver: function(name, observer) {
        this._events.removeEventListener(name, observer);
    },

    /**
     * notify cache has been resized by gc
     * @param {String} name
     *
     */
    notifyGC: function(name) {
        var e = {
            name: name
        };
        this._events.fireDelegate(name, 'didCacheGC', e);
    },

    /**
     * notify cache has been changed
     * @param {String} name
     *
     */
    notifyChanged: function(name, options) {
        var e = {
            name: name,
            options: options
        };
        this._events.fireDelegate(name, 'didCacheChanged', e);
    }
});});
/**
 * @class tupai.Application
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 * This is application.
 * You can get the static instance by use ThisApplication.instance
 */
Package('tupai')
.use('tupai.events.Events')
.use('tupai.model.CacheManager')
.use('tupai.model.ApiManager')
.use('tupai.util.CommonUtil')
.use('tupai.Window')
.define('Application', function(cp) { return Package.Class.extend({
    _window  : undefined,
    _delegate: undefined,
    _events  : undefined,
    DEFAULT_WIN_ID: 'default',

    /**
     * initialize
     * @param config
     * @param delegate
     *
     */
    initialize : function(config, delegate) {

        this._setupWindows(config, delegate);
        this._delegate = delegate;
        if(config) {
            this._attributes = config.attributes;
            this.addApiManagers(config.apiManagers);
            this.addApiManager(config.apiManager);
            this.setupCacheManager(config.cacheManager);
        }

        this._events = new cp.Events();
        cp.Application.instance = this;

        this._delegate &&
        this._delegate.didApplicationLoad &&
        this._delegate.didApplicationLoad();
    },
    _setupWindows: function(config, delegate) {

        this._windows = {};

        var getConfig;
        if(config && config.windows) {
            getConfig = function(id) {
                return config.windows[id];
            };
        } else {
            getConfig = function(id) {
                var ret = config && config.window;
                return ret || {};
            };
        }

        var createWindow;
        if(delegate) {
            createWindow = function(id, element) {
                var config = getConfig(id);
                config.winConfig = {element: element, id: id};
                return delegate.createWindow(config, id);
            };
        } else {
            createWindow = function(id, element) {
                var config = getConfig(id);
                config.winConfig = {element: element, id: id};
                return new cp.Window(config);
            };
        }

        var elements = document.querySelectorAll('*[data-ch-window]');
        if(!elements || elements.length < 1) {
            var element =  document.getElementsByTagName('body')[0];
            this._windows[this.DEFAULT_WIN_ID] = createWindow(this.DEFAULT_WIN_ID, element);
        } else {
            for(var i=0, n=elements.length; i<n; i++) {
                var element = elements[i];
                var id = cp.CommonUtil.getDataSet(element, 'chWindow') || this.DEFAULT_WIN_ID;
                this._windows[id] = createWindow(id, element);
            }
        }
    },

    /**
     * setup application setup CacheManager
     * @param config CacheManager config
     */
    setupCacheManager: function(config) {
        if(!config) return;
        if(this._cacheManager) throw new Error('CacheManager has already setup.');
        this._cacheManager = new cp.CacheManager(config);
    },

    /**
     * add an ApiManager by name
     * @param config ApiManager config
     * @param [name] ApiManager name
     */
    addApiManager: function(config, name) {
        if(!config) return;
        if(!this._apiManagers) this._apiManagers = {};

        name = name || 'default';
        this._apiManagers[name] = new cp.ApiManager(config);
    },

    /**
     * add some ApiManagers
     * @param config ApiManager's configs
     */
    addApiManagers: function(config) {
        if(!config) return;
        for(var name in config) {
            this.addApiManager(config[name], name);
        }
    },

    /**
     * get CacheManager instance
     */
    getCacheManager: function() {
        return this._cacheManager;
    },

    /**
     * get Cache by name
     */
    getCache: function(name) {
        return this._cacheManager.getCache(name);
    },

    /**
     * get an ApiManager by name
     * @param [name] ApiManager name
     */
    getApiManager: function(name) {
        name = name || 'default';
        return this._apiManagers[name];
    },

    /**
     * set a custom attribute
     * @param name attribute name
     * @param value attribute value
     */
    setAttribute: function(name, value) {
        if(!this._attributes) this._attributes = {};
        var old = this._attributes[name];
        this._attributes[name] = value;
        return old;
    },

    /**
     * get the custom attribute by name
     * @param name attribute name
     */
    getAttribute: function(name) {
        return this._attributes && this._attributes[name];
    },

    /**
     * fire application level event
     * @param type event type
     * @param parameter event parameter
     */
    fire: function(type, parameter) {
        this._events.fire(type, parameter);
    },

    /**
     * add event listener
     * @param {String} type event type
     * @param {Object} listener event listener
     * @param {Boolean} [first] add listener to the top of event pool
     */
    addEventListener: function(type, listener, first) {
        this._events.addEventListener(type, listener, first);
    },

    /**
     * remove event listener
     * @param type event type
     * @param listener which listener to remove
     */
    removeEventListener: function(type, listener) {
        this._events.removeEventListener(type, listener);
    },

    /**
     * close this application.
     */
    close: function() {
        this._delegate &&
        this._delegate.didApplicationUnload &&
        this._delegate.didApplicationUnload();
    },

    /**
     * get window by id
     * @param {String} [id] optional
     */
    getWindow: function(id) {
        return this._windows[id || this.DEFAULT_WIN_ID];
    },

    /**
     * show root url
     * @param {String} url root controller url
     * @param {Object} options root controller options
     * @param {String} [id] witch window to show
     */
    show: function(url, options, id) {
        var win = this._windows[id || this.DEFAULT_WIN_ID];
        win && win.showRoot(url, options);
    }
});});

/**
 * @class   tupai.ViewController
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * A controller can send commands to content view to change the view's presentation of the model.
 * It delegate commands from view to update the model's state.
 *
 * ### The delegate commands from Base View:
 * -  viewDidLoad(view);
 * -  viewDidUnload(view);
 * -  viewDidShow(view);
 * -  viewDidHide(view);
 *
 * ### The delegate commands from TransitManager
 * -  viewInit(options, url, name);
 * -  transitController(controller, url, options);
 *
 * ### The delegate commands from TableView
 * -  numberOfRows(tableView);
 * -  cellForRowAtIndexPath(indexPath, tableView);
 * -  cellForRowAtTop(tableView);
 * -  cellForRowAtBottom(tableView);
 *
 */
Package('tupai')
.use('tupai.Application')
.define('ViewController', function(cp) { return Package.Class.extend({
	_view: undefined,
    _window: undefined,
    _app: undefined,

    /**
     * initialize
     * @param {tupai.Window} window object
     *
     */
	initialize: function(windowObject) {
        if(!windowObject) throw new Error('no window');
        this._window = windowObject;
        this._app = cp.Application.instance;
	},

    /**
     * get the window object
     * @return {tupai.Window} window object
     */
    getWindow: function() {
        return this._window;
    },

    /**
     * get the application object
     * @return {tupai.Application} application object
     */
    getApplication: function() {
        return this._app;
    },

    /**
     * register an observer
     * @param {String} name cache name to observer
     * @param {Object} observer observer instance
     * @param {Object} [observer.didCacheChanged]
     * @param {Object} [observer.didCacheGC]
     *
     * ### observer methods parameter
     *     {
     *         name: cache name
     *         options: some custom options
     *     }
     *
     * @param {boolean} [first=true] add listener to the first of events pool
     *
     */
    registerCacheObserver: function(name, observer, first) {
        observer = observer || this;
        if(!this._cacheObservers) {
            this._cacheObservers = [];
        }
        this._cacheObservers.push({
            name: name,
            observer: observer
        });
        return this._app.getCacheManager().registerObserver(name, observer, first);
    },

    /**
     * delete an observer
     * @param {String} name cache name to observer
     * @param {Object} observer observer instance
     *
     */
    unRegisterCacheObserver: function(name, observer) {
        observer = observer || this;
        return this._app.getCacheManager().unRegisterObserver(name, observer);
    },

    /**
     * register an observer
     * @param {String} name api name to observer
     * @param {Object} observer observer instance
     * @param {Function} [observer.didHttpRequestSuccess]
     * @param {Function} [observer.didHttpRequestError]
     *
     * ### observer methods parameter
     *     {
     *         name: api name
     *         requestname: request name
     *         response: response object
     *         request: request object
     *         attributes: custom attributes
     *     }
     *
     * @param {boolean} [first=true] add listener to the first of events pool
     * @param {String} [managerName] ApiManager name
     *
     */
    registerApiObserver: function(name, observer, first, managerName) {
        var apiManager = this._app.getApiManager(managerName);
        if(!apiManager) {
            throw new Error('can\'t found apiManager by name ' + managerName);
        }
        observer = observer || this;
        if(!this._apiObservers) {
            this._apiObservers = [];
        }
        this._apiObservers.push({
            managerName: managerName,
            name: name,
            observer: observer
        });
        return apiManager.registerObserver(name, observer, first);
    },

    /**
     * delete an observer
     * @param {String} name cache name to observer
     * @param {Object} observer observer instance
     * @param {String} [managerName] ApiManager name
     *
     */
    unRegisterApiObserver: function(name, observer, managerName) {
        var apiManager = this._app.getApiManager(managerName);
        if(!apiManager) {
            throw new Error('can\'t found apiManager by name ' + managerName);
        }
        observer = observer || this;
        return apiManager.unRegisterObserver(name, observer);
    },

    /**
     * delete observers that register by registerApiObserver and registerCacheObserver.
     * this method will be called by viewDidUnload
     */
    unRegisterObservers: function() {
        var i,n;
        if(this._cacheObservers) {
            for(i=0,n=this._cacheObservers.length; i<n; i++) {
                var o = this._cacheObservers[i];
                this.unRegisterCacheObserver(o.name, o.observer);
            }
        }

        if(this._apiObservers) {
            for(i=0,n=this._apiObservers.length; i<n; i++) {
                var o = this._apiObservers[i];
                this.unRegisterApiObserver(o.name, o.observer, o.managerName);
            }
        }
    },

    /**
     * execute request
     * @param {Object} options
     * @param {String} options.name api name
     * @param {String} options.requestName request name
     * @param {Object} [options.parameters] request parameters
     * @param {Object} [options.queryParameters] request queryParameters
     * @param {Object} [options.formDatas] request formDatas
     * @param {Object} [options.attributes] request custom attributes
     * @param {Object} [options.managerName] apiManagerName
     *
     */
    executeApi: function(options) {
        if(!options) throw new Error('missing required parameter.');
        var managerName = options.managerName;
        this._app.getApiManager(managerName).execute(options);
    },

    /**
     * get Cache by name
     */
    getCache: function(name) {
        return this._app.getCache(name);
    },

    /**
     * get the content view object
     */
	getContentView: function() {
		return this._view;
	},

    /**
     * set content view.
     * you should do this method in viewInit
     * @param {tupai.ui.View} view content view object
     */
    setContentView: function(view) {
        // TODO bind view's lifecycle to release cache and api delegate.
        if(view) {
            view.setDelegate(this);
        }
        this._view = view;
    },

    /**
     * get content view's status.
     */
    getViewStatus: function() {
        if(!this._view) return null;
        return this._view.getViewStatus();
    },

    /**
     * find view by id in contentView (set by data-ch-id)
     * @param {String} id
     * @return {tupai.ui.View}
     *
     */
    findViewById: function() {
        if(!this._view) return null;
        return this._view.findViewById.apply(this._view, arguments);
    },

    /**
     * will call by View when did loaded.
     * @param {tupai.ui.View} view
     */
    viewDidLoad: function (view) {
    },

    /**
     * will call by View when did unloaded.
     * @param {tupai.ui.View} view
     */
    viewDidUnload: function(view) {
        this.unRegisterObservers();
    },

    /**
     * the start point of ViewController.
     * you should ovveride this function and create a content view by setContentView
     * @param {Object} options
     * @param {String} url
     * @param {String} name
     */
	viewInit: function(options, url, name) {
	}
});});
