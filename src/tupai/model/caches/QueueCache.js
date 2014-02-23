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
            this._nativeStorageDefaultMeta = { version: 1 };
        } else if(options.sessionStorage) {
            this._nativeStorage = window.sessionStorage;
            this._nativeStorageDefaultMeta = { version: 1 };
        }
        if(this._nativeStorage) {
            this._nativeStorageKey = '__tupai_'+name;
            var dataText = this._nativeStorage.getItem(this._nativeStorageKey);
            if(dataText) {
                var d = JSON.parse(dataText);
                if(d.m && d.d) {
                    this._storage.swapStorage(d.d);
                    this._meta = d.m;
                } else {
                    console.warn('unknow native storage format!');
                }
            }
        }

        this._uniqField = options.uniqField;
        this._delegate = delegate;
        this._name = name;
    },

    /**
     * get the storage data created timestamp
     * this function will return null when memory cache only.
     */
    getCreated: function() {
        return this._meta && this._meta.created;
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
            var meta = this._meta;
            if(!meta) {
                meta = this._meta = {};
                for(var name in this._nativeStorageDefaultMeta) {
                    meta[name] = this._nativeStorageDefaultMeta[name];
                }
            }
            meta.created = (Date.now?Date.now():(+new Date()));
            var d = {
                m: meta,
                d: this._storage.getStorage()
            };
            this._nativeStorage.setItem(this._nativeStorageKey, JSON.stringify(d));
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
     * set custom attribute by name.
     * @param {String} name attribute name
     * @param {Object} value attribute value
     * @return {Object} old attribute value
     *
     */
    setAttribute: function(name, value) {
        if(!this._attributes) {
            this._attributes = {};
        }
        var old = this._attributes[name];
        this._attributes[name] = value;
        return old;
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
                var r = data[i];
                var key = r[uniqField];
                if(!newKeys[key]) {
                    newData.push(r);
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
    forEach: function(callback) {
        this._storage.iterator(callback);
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
