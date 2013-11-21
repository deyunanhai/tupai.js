Package('transit')
.use('tupai.ViewController')
.use('tupai.ui.View')
.use('transit.Templates')
.define('TabViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function(options, url) {
        var view = new cp.View({
            template: cp.Templates.get('template_tab'),
            templateParameters: options
        });
        this.setContentView(view);
    },
    transitController: function(controller, url, options, transitOptions) {
        this._container.clearChildren();
        this._container.addSubView(controller.getContentView());
        this._container.render();
    },
    viewDidRender: function() {
        console.log('tab did render');
        this._container = this.getContentView().findViewById('container');
        var btn1 = this.getContentView().findViewById('btn1');
        var btn2 = this.getContentView().findViewById('btn2');
        var btnDetail = this.getContentView().findViewById('btnDetail');
        var THIS = this;
        btn1.bind('click', function() {
            THIS._window.back('/tab/sub1');
        });
        btn2.bind('click', function() {
            THIS._window.back('/tab/sub2');
        });
        btnDetail.bind('click', function() {
            THIS._window.transitWithHistory('/detail1', {p1:'tab'});
        });
    },
    viewDidLoad: function() {
        console.log('tab did load');
    }
});});
