Package('test.window')
.use('tupai.ViewController')
.use('tupai.ui.View')
.define('RootViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function(options, url) {
        deepEqual(options, {test:true}, 'validation window initialize options');
        ok(url === '/root' || url === '/root1', 'validation window initialize url');
        this.setContentView(new cp.View());
    },
    viewDidLoad: function(view) {
        ok(true, 'view didload');
    },
    viewDidRender: function(view) {
        ok(true, 'view didRender');
    },
    viewDidUnload: function(view) {
        ok(true, 'view didload');
    }
});});

test('initialize window by RootViewController',function() {

	expect(8);
    Package()
    .use('tupai.Window')
    .use('test.window.RootViewController')
    .run(function(cp) {
        var win = new cp.Window({
            extra_config: {someconfig: true},
            rootViewController: cp.RootViewController
        });
        win.doWhenFinishDisplay(function() {
            ok(true, 'do when finish diaplay before show');
        });
        win.showRoot('/root', {test: true});
        win.doWhenFinishDisplay(function() {
            ok(true, 'do when finish diaplay after show');
        });
        deepEqual(win.getConfig('extra_config'), {someconfig: true}, 'get extra_config');
        deepEqual(win, win.getCurrentController().getWindow(), 'get extra_config');
    });
});

test('initialize window by TransitManager',function() {

	expect(13);
    Package()
    .use('tupai.Window')
    .use('test.window.RootViewController')
    .run(function(cp) {
        var win = new cp.Window({
            extra_config: {someconfig: true},
            routes: {
                '/root'    : cp.RootViewController,
                '/root1'   : cp.RootViewController
            }
        });
        win.doWhenFinishDisplay(function() {
            ok(true, 'do when finish diaplay before show');
        });
        win.transit('/root', {test: true});
        win.doWhenFinishDisplay(function() {
            ok(true, 'do when finish diaplay after show');
        });
        deepEqual(win.getConfig('extra_config'), {someconfig: true}, 'get extra_config');
        deepEqual(win.getConfig('extra_config'), {someconfig: true}, 'get extra_config');

        win.transit('/root1', {test: true});
    });
});

