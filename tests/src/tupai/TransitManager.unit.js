Package('test.transit')
.use('tupai.ViewController')
.use('tupai.ui.View')
.define('RootViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function(options, url) {
        this.setContentView(new cp.View());
    },
    transitController: function(controller, url, options, transitOptions) {
        ok(url.match('/root/sub[0-9]+$'), 'transit by RootViewController');
    }
});});

Package('test.transit')
.use('tupai.ViewController')
.use('tupai.ui.View')
.define('SubViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function(options, url) {
        this.setContentView(new cp.View());
    },
    transitController: function(controller, url, options, transitOptions) {
        ok(0, 'never call SubViewController\'s transitController');
    }
});});

Package('test.transit')
.define('MockWindow', function(cp) { return Package.Class.extend({
    transitController: function(controller, url, options, transitOptions) {
        if(!controller) ok(false);
        ok(url === '/root' || url === '/sub', 'transit by window');
    }
});});

function runTest(callback) {
    Package()
    .use('tupai.TransitManager')
    .use('test.transit.RootViewController')
    .use('test.transit.SubViewController')
    .use('test.transit.MockWindow')
    .run(function(cp) {
        var win = new cp.MockWindow();
        var tsManager = new cp.TransitManager(win, {
            '/root': cp.RootViewController,
            '/sub': cp.SubViewController,
            '/root/sub1': cp.SubViewController,
            '/root/sub2': cp.SubViewController
        });

        callback(tsManager);
    });
}

test('transit by window',function() {

	expect(1);
    runTest(function(tsManager) {
        tsManager.transit('/root');
    });
});

test('transit by RootViewController',function() {

    expect(3);
    runTest(function(tsManager) {
        tsManager.transit('/sub');
        tsManager.transit('/root/sub1');
    });
});

test('transit by cached RootViewController',function() {

	expect(3);
    runTest(function(tsManager) {
        tsManager.transit('/root');
        tsManager.transit('/root/sub1');
        tsManager.transit('/root/sub2');
    });
});

test('transit by cached RootViewController 1',function() {

    Package('test2.transit')
    .use('tupai.ViewController')
    .use('tupai.ui.View')
    .define('RootViewController', function(cp) { return cp.ViewController.extend({
        viewInit: function(options, url) {
            this.setContentView(new cp.View());
        },
        transitController: function(controller, url, options, transitOptions) {
        }
    });});

    Package()
    .use('tupai.TransitManager')
    .use('test2.transit.RootViewController')
    .use('test.transit.SubViewController')
    .use('test.transit.MockWindow')
    .run(function(cp) {
        var win = new cp.MockWindow();
        var tsManager = new cp.TransitManager(win, {
            '/root': cp.RootViewController,
            '/sub': cp.SubViewController,
            '/root/sub1': cp.SubViewController,
            '/root/sub2': cp.SubViewController
        });

        tsManager.transit('/root/aa');
    });
    ok(true);
});
