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
