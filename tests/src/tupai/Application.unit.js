Package('test')
.use('tupai.Window')
.define('TestDelegate', function(cp) { return {
    createWindow: function(config, id) {
        return new cp.Window(config);
    }
};});

test('initialize window',function() {

	expect(2);
    Package()
    .use('tupai.Application')
    .use('test.TestDelegate')
    .run(function(cp) {
        var app = new cp.Application(null, cp.TestDelegate);
        ok(app === cp.Application.instance, 'initialize instance');
        ok(app.getWindow(), 'initialize window object');
    });
});

test('initialize api manager',function() {

	expect(1);
    Package()
    .use('tupai.Application')
    .use('test.TestDelegate')
    .run(function(cp) {
        var app = new cp.Application({
            apiManager: {
                apiParameterMap: {
                    test: {
                        search: {
                            method: 'GET',
                            url: '/test',
                            parameters: {
                                hoge: 'hoge parameter'
                            }
                        }
                    }
                }
            }
        }, cp.TestDelegate);
        var api = app.getApiManager();
        ok(api, 'test apiManager');
    });
});

test('initialize api managers',function() {

	expect(3);
    Package()
    .use('tupai.Application')
    .use('test.TestDelegate')
    .run(function(cp) {
        var app = new cp.Application({
            apiManagers: {
                default: {
                    apiParameterMap: {
                        test1: {
                            search: {
                                method: 'GET',
                                url: '/test',
                                parameters: {
                                    hoge: 'hoge parameter'
                                }
                            }
                        }
                    }
                },
                api2: {
                    apiParameterMap: {
                        test2: {
                            search: {
                                method: 'GET',
                                url: '/test',
                                parameters: {
                                    hoge: 'hoge parameter'
                                }
                            }
                        }
                    }
                }
            }
        }, cp.TestDelegate);
        ok(app.getApiManager(), 'test apiManagers');
        ok(app.getApiManager('default'), 'test apiManagers');
        ok(app.getApiManager('api2'), 'test apiManagers');
    });
});

test('initialize cache manager',function() {

	expect(2);
    Package()
    .use('tupai.Application')
    .use('test.TestDelegate')
    .run(function(cp) {
        var app = new cp.Application({
            cacheManager: {
                cache1: {
                    type: 'hash'
                },
                cache2: {
                    type: 'queue'
                }
            }
        }, cp.TestDelegate);
        var caches = app.getCacheManager();
        ok(caches.getCache('cache1'), 'test cacheManager');
        ok(caches.getCache('cache2'), 'test cacheManager');
    });
});

test('initialize attributes',function() {

	expect(2);
    Package()
    .use('tupai.Application')
    .use('test.TestDelegate')
    .run(function(cp) {
        var app = new cp.Application({
            attributes: {
                a: 'attribute_a',
                b: 'attribute_b'
            }
        }, cp.TestDelegate);
        ok(app.getAttribute('a') === 'attribute_a', 'test attributes');
        ok(app.getAttribute('b') === 'attribute_b', 'test attributes');
    });
});

test('events',function() {

	expect(1);
    Package()
    .use('tupai.Application')
    .use('test.TestDelegate')
    .run(function(cp) {
        var app = new cp.Application();
        var event = function(e) {
            ok(e.data === 'data');
        };
        app.addEventListener('event1', event);

        app.fire('event1', {data: 'data'});
        app.removeEventListener('event1', event);
        app.fire('event1', {data: 'data'});
    });
});

test('show',function() {

	expect(1);

    Package('test')
    .use('tupai.ViewController')
    .use('tupai.ui.View')
    .define('RootViewController', function(cp) { return cp.ViewController.extend({
        viewInit: function() {
            ok(1, 'view init');
            this.setContentView(new cp.View());
        }
    });});

    Package()
    .use('tupai.Application')
    .use('test.RootViewController')
    .run(function(cp) {
        var app = new cp.Application({
            window: {
                rootViewController: cp.RootViewController
            }
        });
        app.show();
    });
});
