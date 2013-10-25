Package('transit')
.use('tupai.ViewController')
.use('tupai.ui.View')
.use('transit.Templates')
.define('SubViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function(options, url) {
        console.log(url);
        var templateName;
        if(url.match(/sub1$/)) templateName = 'template_sub1';
        else templateName = 'template_sub2';

        var view = new cp.View({
            template: cp.Templates.get(templateName)
        });
        view.setDelegate(this);
        this.setContentView(view);
    },
    viewDidRender: function() {
        console.log('sub view did render');
    },
    viewDidLoad: function() {
        console.log('sub view did load');
    }
});});

