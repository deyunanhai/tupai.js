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
