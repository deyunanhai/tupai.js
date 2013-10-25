Package('mustache')
.use('tupai.ViewController')
.use('tupai.ui.View')
.use('mustache.Templates')
.define('RootViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function() {
        this.SUPER.viewInit.apply(this, arguments);
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
        this.SUPER.viewDidLoad.apply(this, arguments);
    },
    viewDidUnload: function (view) {
        this.SUPER.viewDidUnload.apply(this, arguments);
    },
    /* call from transisManager */
    transitController: function (controller, url, options, transitOptions) {
    }
});});
