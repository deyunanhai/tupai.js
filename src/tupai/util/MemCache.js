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
