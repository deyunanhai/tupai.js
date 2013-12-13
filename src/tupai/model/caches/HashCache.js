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
                    this._storage = d.d;
                    this._meta = d.m;
                } else {
                    console.warn('unknow native storage format!');
                }
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
     * get the storage data created timestamp
     * this function will return null when memory cache only.
     *
     */
    getCreated: function() {
        return this._meta && this._meta.created;
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
                d: this._storage
            };
            this._nativeStorage.setItem(this._nativeStorageKey, JSON.stringify(d));
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
