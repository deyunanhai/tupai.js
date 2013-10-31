Package(<%if(packageName){%>'<%=packageName%>'<%}%>)
.use('tupai.ViewController')
.use('tupai.ui.View')
.use('<%=templateFullClassName%>')
.define('<%=className%>', function(cp) { return cp.ViewController.extend({
    viewInit: function(options, url) {
        this.SUPER.viewInit.apply(this, arguments);
        var view = new cp.View({
            template: cp.<%=templateClassName%>.get('<%=templateName%>'),
            templateParameters: {
                lbl: 'Hello World!'
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
