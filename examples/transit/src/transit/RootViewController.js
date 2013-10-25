Package('transit')
.use('tupai.ViewController')
.use('tupai.ui.View')
.use('transit.Templates')
.define('RootViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function(options, url) {
        console.log(url);
        var view = new cp.View({
            template: cp.Templates.get('template_root')
        });
        view.setDelegate(this);
        this.setContentView(view);
    },
    transitController: function(controller, url, options, transitOptions) {
        console.log('transitController: ' + url);
        this._container.clearChildren();
        this._container.addSubView(controller.getContentView());
        this._container.render();
    },
    viewDidRender: function() {
        console.log('root did render');
        this._container = this.getContentView().findViewById('container');
        var btn1 = this.getContentView().findViewById('btn1');
        var btn2 = this.getContentView().findViewById('btn2');
        var btnDetail = this.getContentView().findViewById('btnDetail');
        var THIS = this;
        btn1.bind('click', function() {
            THIS._window.transit('/root/sub1');
        });
        btn2.bind('click', function() {
            THIS._window.transit('/root/sub2');
        });
        btnDetail.bind('click', function() {
            THIS._window.transitWithHistory('/detail1');
        });
    },
    viewDidLoad: function() {
        console.log('root did load');
    }
});});
