Package('template_engine')
.use('tupai.ViewController')
.use('tupai.ui.View')
.use('template_engine.Templates')
.define('RootViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function(options, url) {
        this.SUPER.viewInit.apply(this, arguments);
        var view = new cp.View({
            template: cp.Templates.get('template_engine.RootViewController.content')
        });
        this.setContentView(view);
    },
    viewDidLoad: function (view) {
        this.SUPER.viewDidLoad.apply(this, arguments);

        this.getContentView().setData({
            text: 'text',
            input: 'input',
            lbl: 'lbl',
            value: 'value',
            link: {
                href: 'http://www.google.com',
                value: 'google'
            }
        });
        console.log(this.getContentView().getData());

        var This = this;
        this.findViewById('btn').bind('click', function() {
            console.log(This.getContentView().getData());
        });
    },
    viewDidUnload: function (view) {
        this.SUPER.viewDidUnload.apply(this, arguments);
    },
    /* call from transisManager */
    transitController: function (controller, url, options, transitOptions) {
    }
});});
