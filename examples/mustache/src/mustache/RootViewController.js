Package('mustache')
.use('tupai.ViewController')
.use('tupai.ui.View')
.use('mustache.Templates')
.define('RootViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function() {
        cp.ViewController.prototype.viewInit.apply(this, arguments);
        var view = new cp.View({
            template: cp.Templates.get('mustache.RootViewController.content'),
            templateParameters: {
                obj: {txt: 'obj.helloword'},
                txt: 'helloword'
            }
        });
        this.setContentView(view);
    },
    viewDidLoad: function (view) {
        cp.ViewController.prototype.viewDidLoad.apply(this, arguments);
    },
    viewDidUnload: function (view) {
        cp.ViewController.prototype.viewDidUnload.apply(this, arguments);
    },
    /* call from transisManager */
    transitController: function (controller, url, options, transitOptions) {
    }
});});
