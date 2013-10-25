test('basic',function() {

    Package()
    .use('tupai.ViewController')
    .run(function(cp) {
        var win = {};
        var c = new cp.ViewController(win);

        deepEqual(c.getWindow(), win, 'get window');
        ok(!c.getViewStatus(), 'get view status');

        var viewStatus = 'customViewStatus';
        var view = {
            setDelegate: function(controller) {
                deepEqual(controller, c, 'set view delegate');
            },
            getViewStatus: function() {
                return viewStatus;
            }
        };
        c.setContentView(view);
        deepEqual(c.getContentView(), view, 'get view');

        deepEqual(c.getViewStatus(), viewStatus, 'get view status');
    });
	expect(5);
});

