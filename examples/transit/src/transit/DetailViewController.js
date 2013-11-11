Package('transit')
.use('tupai.ViewController')
.use('tupai.ui.View')
.use('transit.Templates')
.define('DetailViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function(options, url) {
        console.log(url);
        var templateName;
        if(url.match(/detail1$/)) templateName = 'template_detail1';
        else templateName = 'template_detail2';

        var view = new cp.View({
            template: cp.Templates.get(templateName)
        });
        view.setDelegate(this);
        this.setContentView(view);

        var p1 = options && options['p1'];
        var THIS = this;
        var btnDetail2 = view.findViewById('btnDetail2');
        if(btnDetail2) {
            btnDetail2.bind('click', function() {
                THIS._window.transitWithHistory('/detail2', {p1:p1, p2:'detail'});
            });
        }
        var btnBackRoot = view.findViewById('btnBackRoot');
        if(btnBackRoot) {
            var THIS = this;
            btnBackRoot.bind('click', function() {
                //THIS._window.back('/root/sub1');
                THIS._window._transitManager.back('/root/sub1', {info: 'back from details'});
            });
        }
    },
    viewDidRender: function() {
        console.log('detail view did render');
    },
    viewDidLoad: function() {
        console.log('detail view did load');
    }
});});

