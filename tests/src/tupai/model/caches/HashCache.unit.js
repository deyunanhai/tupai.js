function createHashTestDataForHashCache(len) {
    var ret = {};
    for(var i=0; i<len; i++) {
        ret['id'+i] = {
            id: 'id'+i,
            value: 'value'+i
        };
    }
    return ret;
}

test('initialize',function() {

    Package()
    .use('tupai.model.caches.HashCache')
    .run(function(cp) {
        var cache = new cp.HashCache();
        ok(cache != undefined, 'initialize HashCache');
    });
});

test('basic functions',function() {

    Package()
    .use('tupai.model.caches.HashCache')
    .run(function(cp) {
        var cache = new cp.HashCache();
        equal(cache.size(), 0, 'check size');

        var data1 = {id: 'id1', value: 'value1'};
        cache.push(data1);
        equal(cache.get('id1'), data1, 'check push');
        equal(cache.size(), 1, 'check size');

        var deletedData;

        deletedData = cache.remove('id1');
        equal(cache.size(), 0, 'check size');
        equal(deletedData, data1, 'check deleted data');
        equal(cache.get('id1'), null, 'check get');
        equal(cache.remove('id1'), null, 'check deleted data');

        cache.unshift(data1);
        equal(cache.size(), 1, 'check size');
        equal(cache.get('id1'), data1, 'check get');
        deletedData = cache.removeByElement(data1);
        equal(cache.size(), 0, 'check size');
        equal(deletedData, data1, 'check deleted data');

        cache.push(data1);
        cache.push(data1);
        equal(cache.size(), 1, 'check size');

        cache.clear();
        equal(cache.size(), 0, 'check clear');
    });
    expect(13);
});

test('query without filter',function() {

    Package()
    .use('tupai.model.caches.HashCache')
    .run(function(cp) {
        var cache = new cp.HashCache();
        var len = 10;
        var testData = createHashTestDataForHashCache(len);
        for(var name in testData) {
            cache.push(testData[name]);
        }
        var dataset = cache.query();
        equal(dataset.size(), len, 'check size');

        for(var name in testData) {
            equal(dataset.get(name), testData[name], 'check push');
        }
    });
    expect(11);
});

test('query with filter',function() {

    Package()
    .use('tupai.model.caches.HashCache')
    .run(function(cp) {
        var cache = new cp.HashCache();
        var len = 10;
        var testData = createHashTestDataForHashCache(len);
        for(var name in testData) {
            cache.push(testData[name]);
        }
        var dataset = cache.query({
            filter: function(data, id) {
                if(id == 'id1') return false;
                return true;
            },
            limit: 8
        });
        equal(dataset.size(), 8, 'check size');

        for(var name in testData) {
            if(name == 'id1' || name == 'id9') {
                equal(dataset.get(name), null, 'check push');
            } else {
                equal(dataset.get(name), testData[name], 'check push');
            }
        }
    });
    expect(11);
});

test('filter and iterate',function() {

    Package()
    .use('tupai.model.caches.HashCache')
    .run(function(cp) {
        var cache = new cp.HashCache();

        var len = 10;
        var testData = createHashTestDataForHashCache(len);
        for(var name in testData) {
            cache.push(testData[name]);
        }

        equal(cache.size(), len, 'check size');
        cache.iterator(function(data) {
            equal(data, testData[data.id], 'check data');
        });
        equal(cache.size(), len, 'check size');

        cache.filter(function(data) {
            equal(data, testData[data.id], 'check data');
            if(data.id == 'id1') return false;
            else return true;
        }, true);
        equal(cache.size(), 9, 'check size');
        cache.iterator(function(data) {
            equal(data, testData[data.id], 'check data');
            if(data.id == 'id1') ok(false, 'cannot deleted');
        });

    });
});

test('gc',function() {

    Package()
    .use('tupai.model.caches.HashCache')
    .run(function(cp) {
        var cache = new cp.HashCache('testCache1', {
            memCache: {
                limit: 100,
                overflowRemoveSize: 10
            }
        });

        for(var i=0; i<100; i++) {
            cache.push({id:'id'+i});
        }
        equal(cache.size(), 100, 'check size');
        cache.push({id:'id999'});
        equal(cache.size(), 91, 'check size'); // clear 10 then add 1
    });
    expect(2);
});

test('notify',function() {

    Package()
    .use('tupai.model.caches.HashCache')
    .run(function(cp) {
        var error = function() {
            //ok(false, 'never execute');
        };
        var delegate = {
            didCacheChanged: error,
            didCacheGC: error
        };

        delete window.localStorage['__tupai_testCache1'];
        var len = 100;
        var cache = new cp.HashCache('testCache1', {
            memCache: {
                limit: len,
                overflowRemoveSize: len/10
            },
            localStorage: true
        }, delegate);

        for(var i=0; i<len; i++) {
            cache.push({id:'id'+i});
        }
        equal(cache.size(), len, 'check size');

        delegate.didCacheGC = function(name, cache) {
            ok(true, 'did gc');
        }
        cache.push({id:'id999'});
        equal(cache.size(), len-(len/10)+1, 'check size');
        delegate.didCacheGC = error;

        var checkOptions = {};
        delegate.didCacheChanged = function(name, cache, options) {
            equal(options, checkOptions, 'check did cache changed');
        }
        cache.end(checkOptions);
        delegate.didCacheChanged = error;
        ok(window.localStorage['__tupai_testCache1'], 'check localStorage');
    });
    expect(5);
});

