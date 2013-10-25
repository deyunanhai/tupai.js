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
