function createArrayTestDataForQueueCache(len) {
    var ret = [];
    for(var i=0; i<len; i++) {
        ret[i] = {
            id: 'id'+i,
            index: i,
            value: 'value'+i
        };
    }
    return ret;
}

test('initialize',function() {

    Package()
    .use('tupai.model.caches.QueueCache')
    .run(function(cp) {
        var cache = new cp.QueueCache();
        ok(cache != undefined, 'initialize QueueCache');
    });
});

test('basic functions',function() {

    Package()
    .use('tupai.model.caches.QueueCache')
    .run(function(cp) {
        var cache = new cp.QueueCache();
        equal(cache.size(), 0, 'check size');

        var data1 = {id: 'id1', value: 'value1'};
        cache.push(data1);
        equal(cache.get(0), data1, 'check push');
        equal(cache.size(), 1, 'check size');

        var deletedData;

        deletedData = cache.remove(0);
        equal(cache.size(), 0, 'check size');
        equal(deletedData, data1, 'check deleted data');
        equal(cache.get(0), null, 'check get');
        equal(cache.remove(0), null, 'check deleted data');

        cache.unshift(data1);
        equal(cache.size(), 1, 'check size');
        equal(cache.get(0), data1, 'check get');
        deletedData = cache.removeByElement(data1);
        equal(cache.size(), 0, 'check size');
        equal(deletedData, data1, 'check deleted data');

        cache.push(data1);
        cache.push(data1);
        equal(cache.size(), 2, 'check size');

        cache.clear();
        equal(cache.size(), 0, 'check clear');
    });
    expect(13);
});

test('query without filter',function() {

    Package()
    .use('tupai.model.caches.QueueCache')
    .run(function(cp) {
        var cache = new cp.QueueCache();
        var len = 10;
        var testData = createArrayTestDataForQueueCache(len);
        for(var i=0; i<len; i++) {
            cache.push(testData[i]);
        }
        var dataset = cache.query();
        equal(dataset.size(), len, 'check size');

        for(var i=0; i<len; i++) {
            equal(dataset.get(i), testData[i], 'check data');
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
        var testData = createArrayTestDataForQueueCache(len);
        for(var i=0; i<len; i++) {
            cache.push(testData[i]);
        }
        var dataset = cache.query({
            filter: function(data, index) {
                if(index == 0) return false;
                return true;
            },
            limit: 8
        });
        equal(dataset.size(), 8, 'check size');

        for(var i=0; i<len; i++) {
            if(i == 0 || i == 9) {
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
    .use('tupai.model.caches.QueueCache')
    .run(function(cp) {
        var cache = new cp.QueueCache();

        var len = 10;
        var testData = createArrayTestDataForQueueCache(len);
        for(var i=0; i<len; i++) {
            cache.push(testData[i]);
        }

        equal(cache.size(), len, 'check size');
        cache.iterator(function(data) {
            equal(data, testData[data.index], 'check data');
        });
        equal(cache.size(), len, 'check size');

        cache.filter(function(data) {
            equal(data, testData[data.index], 'check data');
            if(data.id == 'id1') return false;
            else return true;
        }, true);
        equal(cache.size(), 9, 'check size');
        cache.iterator(function(data) {
            equal(data, testData[data.index], 'check data');
            if(data.id == 'id1') ok(false, 'cannot deleted');
        });

    });
    //expect(3);
});

test('gc top',function() {

    Package()
    .use('tupai.model.caches.QueueCache')
    .run(function(cp) {
        var len = 100;
        var cache = new cp.QueueCache('testCache1', {
            memCache: {
                limit: len,
                overflowRemoveSize: len/10
            }
        });

        for(var i=0; i<len; i++) {
            cache.push({id:'id'+i});
        }
        equal(cache.size(), len, 'check size');
        cache.push({id:'id999'});

        var size = len-(len/10)+1;
        equal(cache.size(), size, 'check size'); // clear 10 then add 1
        for(var i=0; i<size-1; i++) {
            var d = cache.get(i);
            equal(d['id'], 'id'+(i+10), 'check contents');
        }
        equal(cache.get(size-1)['id'], 'id999', 'check contents');
    });
    expect(93);
});

test('gc buttom',function() {

    Package()
    .use('tupai.model.caches.QueueCache')
    .run(function(cp) {
        var len = 100;
        var cache = new cp.QueueCache('testCache1', {
            memCache: {
                limit: len,
                overflowRemoveSize: len/10
            }
        });

        for(var i=0; i<len; i++) {
            cache.push({id:'id'+i});
        }
        equal(cache.size(), len, 'check size');
        cache.unshift({id:'id999'});

        var size = len-(len/10)+1;
        equal(cache.size(), size, 'check size'); // clear 10 then add 1
        for(var i=1; i<size; i++) {
            var d = cache.get(i);
            equal(d['id'], 'id'+(i-1), 'check contents');
        }
        equal(cache.get(0)['id'], 'id999', 'check contents');
    });
    expect(93);
});

test('notify',function() {

    Package()
    .use('tupai.model.caches.QueueCache')
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
        var cache = new cp.QueueCache('testCache1', {
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
    //expect(5);
});

