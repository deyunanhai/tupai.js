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

test('initialize',function() {

    Package()
    .use('tupai.ui.View')
    .run(function(cp) {
        var view = new cp.View();
        ok(view != undefined, 'initialize view');
    });
});

test('properties',function() {

    Package()
    .use('tupai.ui.View')
    .use('tupai.Window')
    .run(function(cp) {
        var view = new cp.View();

        new cp.Window().addSubView(view);
        view.render();
        view.setStyle("position", "absolute");
        (function(properties) {
            for(var i=0, n=properties.length; i<n; i++) {
                var property = properties[i];
                var methodName = property.charAt(0).toUpperCase() + property.slice(1);

                var v = Math.floor( Math.random() * 100 );
                cp.View.prototype['set'+methodName].apply(view, [v]);
                var ret = cp.View.prototype['get'+methodName].apply(view);
                equal(ret, v+'px', "check set property");
            }
        })([
            'height',
            'width',
            'top',
            'left'
        ]);

        view.addClass('test');
        ok(view.hasClass('test'), "check set property");
        view.removeClass('test');
        ok(!view.hasClass('test'), "check set property");
    });
    expect(6);
});

test('test events',function() {

    expect(1);
    Package()
    .use('tupai.ui.View')
    .run(function(cp) {
        var view = new cp.View();
        var event = function(e) {
            ok(e.test === true, 'test parameter');
        };
        view.on('event1', event);
        view.fire('event1', {test: true});
        view.off('event1', event);
        view.fire('event1', {test: true});
    });
});

test('test delegate',function() {

    expect(6);
    Package()
    .use('tupai.ui.View')
    .use('tupai.Window')
    .run(function(cp) {
        var view = new cp.View();
        view.setDelegate({
            viewDidLoad: function(v) {
                ok(v === view, 'did load');
            },
            viewDidRender: function(v) {
                ok(v === view, 'did render');
                ok(v._element.tagName === 'DIV', 'did render');
            },
            viewDidUnload: function(v) {
                ok(v === view, 'did unload');
            },
            viewDidShow: function(v) {
                ok(v === view, 'did show');
            },
            viewDidHide: function(v) {
                ok(v === view, 'did hide');
            }
        });
        var win = new cp.Window();
        win.addSubView(view);
        view.render();
        view.hide();
        view.show();
        win.removeChild(view);
    });
});

test('template',function() {

    expect(2);
    Package()
    .use('tupai.ui.View')
    .use('tupai.Window')
    .run(function(cp) {
        var view = new cp.View({
            template: '<label data-ch-name="data"></label>',
            templateParameters: {data: 'test'}
        });
        var win = new cp.Window();
        win.addSubView(view);
        view.render();
        ok(view._element.tagName === 'LABEL', 'did render');
        ok(view._element.innerHTML === 'test', 'set value');
    });
});

test('sub template',function() {

    expect(4);
    Package()
    .use('tupai.ui.View')
    .use('tupai.Window')
    .run(function(cp) {
        var view = new cp.View({
            template: '<div><label data-ch-name="data"></label></div>',
            templateParameters: {data: 'test'}
        });
        var win = new cp.Window();
        win.addSubView(view);
        view.render();
        ok(view._element.tagName === 'DIV', 'check root tag name');

        var label = view._element.childNodes[0];
        ok(label, 'has children');
        ok(label.tagName === 'LABEL', 'check sub element tag name');
        ok(label.innerHTML === 'test', 'set value');
    });
});
