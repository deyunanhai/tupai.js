Package('twitter')
.use('tupai.ViewController')
.use('tupai.ui.View')
.use('twitter.Templates')
.define('RootViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function() {
        var view = new cp.View();
        var header = new cp.View({
            template: cp.Templates.get('action_bar')
        });
        view.addSubView(header);
        var body = new cp.View();
        view.addSubView(body);
        this.setContentView(view);

        this._body = body;
    },
    viewDidLoad: function (view) {
        cp.ViewController.prototype.viewDidLoad.apply(this, arguments);
    },
    viewDidUnload: function (view) {
        cp.ViewController.prototype.viewDidUnload.apply(this, arguments);
    },
    /* call from transisManager */
    transitController: function (controller, url, options, transitOptions) {
        var view = controller.getContentView();
        this._body.clearChildren();
        this._body.addSubView(view);
        this._body.render();
    }
});});
