test('initialize',function() {

    Package()
    .use('tupai.model.CacheManager')
    .run(function(cp) {
        var cm = new cp.CacheManager();
        ok(cm != undefined, 'initialize CacheManager');
    });
});

test('create cache',function() {

    Package('test')
    .define('CustomCache', function(cp) { return Package.Class.extend({
        _customCacheFlg: true
    });});

    Package()
    .use('tupai.model.CacheManager')
    .run(function(cp) {
        var cm = new cp.CacheManager({
            hashCache: {
                type: 'hash',
                config: {memCache: {limit: 100}}
            },
            queueCache: {
                type: 'queue',
                config: {memCache: {limit: 100}}
            },
            defaultCache: {
                config: {memCache: {limit: 100}}
            },
            customCache: {
                classzz: 'test.CustomCache',
                config: {memCache: {limit: 100}}
            }
        });

        var hashCache = cm.getCache('hashCache');
        ok(hashCache._idField, 'check hashCache');

        var queueCache = cm.getCache('queueCache');
        equal(queueCache._storage._storage.length, 0, 'check queueCache');

        var defaultCache = cm.getCache('defaultCache');
        equal(defaultCache._storage._storage.length, 0, 'check defaultCache');

        var customCache = cm.getCache('customCache');
        equal(customCache._customCacheFlg, true, 'check customCache');
    });
    expect(4);
});

test('basic functions',function() {

    Package()
    .use('tupai.model.CacheManager')
    .run(function(cp) {
        var cm = new cp.CacheManager({
            hashCache: {
                type: 'hash',
                config: {
                    memCache: {limit: 100},
                    attributes: {flg: 'hash'}
                }
            },
            queueCache: {
                type: 'queue',
                config: {memCache: {limit: 100}}
            }
        });

        ok(cm.getCache('queueCache'), 'check queueCache');
        cm.removeCache('queueCache');
        ok(!cm.getCache('queueCache'), 'check queueCache');

        cm.createCache('queueCache', {
            type: 'queue',
            config: {
                memCache: {limit: 100},
                attributes: {flg: 'queue'}
            }
        });
        ok(cm.getCache('queueCache'), 'check queueCache');

        cm.cacheIterator(function(name, cache) {
            equal(name, cache.getName(), 'check iterator');
        });

        equal(cm.getAttribute('queueCache', 'flg'), 'queue', 'check attributes');
        equal(cm.getAttribute('hashCache', 'flg'), 'hash', 'check attributes');

        cm.getCache('queueCache').push({id: 0, type: 'queue'});
        cm.getCache('hashCache').push({id: 0, type: 'hash'});

        equal(cm.get('queueCache', 0).type, 'queue', 'get');
        equal(cm.get('hashCache', 0).type, 'hash', 'get');

        equal(cm.size('queueCache'), 1, 'size');
        equal(cm.size('hashCache'), 1, 'size');

        cm.iterator('hashCache', function(data) {
            equal(data.type, 'hash', 'iterator hash');
        });

        cm.iterator('queueCache', function(data) {
            equal(data.type, 'queue', 'iterator queue');
        });

        deepEqual(cm.getCacheNames(), ['hashCache', 'queueCache']);
    });
    expect(14);
});

test('observer',function() {

    Package()
    .use('tupai.model.CacheManager')
    .run(function(cp) {
        var cm = new cp.CacheManager({
            hashCache: {
                type: 'hash',
                config: { memCache: {limit: 2, overflowRemoveSize: 1} }
            },
            queueCache: {
                type: 'queue',
                config: { memCache: {limit: 2, overflowRemoveSize: 1} }
            }
        });

        var hashCacheObserver = {
            didCacheChanged: function(e) {
                equal(e.name, 'hashCache', 'check name');
                equal(e.options, 'check', 'check name');
            },
            didCacheGC: function(e) {
                equal(e.name, 'hashCache', 'check name');
            }
        };
        var queueCacheObserver = {
            didCacheChanged: function(e) {
                equal(e.name, 'queueCache', 'check name');
                equal(e.options, 'check', 'check name');
            },
            didCacheGC: function(e) {
                equal(e.name, 'queueCache', 'check name');
            }
        };
        cm.registerObserver('hashCache', hashCacheObserver);
        cm.registerObserver('queueCache', queueCacheObserver);

        var hashCache = cm.getCache('hashCache');
        hashCache.push({id: 0, value: 'value'});
        hashCache.end('check'); // run 2
        hashCache.push({id: 1, value: 'value'});
        hashCache.push({id: 2, value: 'value'}); // run gc
        hashCache.end('check'); // run 2

        var queueCache = cm.getCache('queueCache');
        queueCache.push({id: 0, value: 'value'});
        queueCache.end('check'); // run 2
        queueCache.push({id: 1, value: 'value'});
        queueCache.push({id: 2, value: 'value'}); //run gc
        queueCache.end('check'); // run 2


        cm.unRegisterObserver('hashCache', hashCacheObserver);
        cm.unRegisterObserver('queueCache', queueCacheObserver);

        var error = function() {ok(false, 'never');};
        queueCacheObserver = { didCacheChanged: error, didCacheGC: error };
        hashCacheObserver = { didCacheChanged: error, didCacheGC: error };
        queueCache.push({id: 0, value: 'value'});
        queueCache.end('check');
        hashCache.push({id: 0, value: 'value'});
        hashCache.end('check');
    });
    expect(10);
});
