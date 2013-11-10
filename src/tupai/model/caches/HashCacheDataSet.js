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

        cp.DataSet.prototype.initialize.apply(this, arguments);
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
