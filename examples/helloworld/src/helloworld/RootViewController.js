Package('helloworld')
.use('tupai.ViewController')
.use('tupai.ui.View')
.use('helloworld.Templates')
.define('RootViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function() {
        this.SUPER.viewInit.apply(this, arguments);
        var view = new cp.View({
            template: cp.Templates.get('helloworld.RootViewController.content'),
            templateParameters: {
                lbl: 'RootViewController'
            }
        });
        this.setContentView(view);
    },
    viewDidLoad: function (view) {
        this.SUPER.viewDidLoad.apply(this, arguments);
        var This = this;
        view.findViewById('btnGotoSub').bind('click', function() {
            This._window.transitWithHistory('/sub');
        });
    },
    viewDidUnload: function (view) {
        this.SUPER.viewDidUnload.apply(this, arguments);
    },
    /* call from transisManager */
    transitController: function (controller, url, options, transitOptions) {
    }
});});
