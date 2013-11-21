Package('transit')
.use('tupai.ViewController')
.use('tupai.ui.View')
.use('transit.Templates')
.define('NaviViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function(options, url) {
        var view = new cp.View({
            template: cp.Templates.get('template_navi')
        });
        view.setAttribute('aa', 'nav');
        this.setContentView(view);
        this._container = view.findViewById('container');
        this._navbar = view.findViewById('navbar');
        this.getWindow().on('transit', this);
    },
    didWindowBackTo: function(e) {
        var This = this;
        // call render when push state complete
        setTimeout(function() {
            This.renderNavBar();
        }, 10);
    },
    didWindowBack: function(e) {
        var This = this;
        // call render when push state complete
        setTimeout(function() {
            This.renderNavBar();
        }, 10);
    },
    didWindowTransit: function(e) {
        var This = this;
        // call render when push state complete
        setTimeout(function() {
            This.renderNavBar();
        }, 10);
    },
    didWindowTransitWithHistory: function(e) {
        var This = this;
        // call render when push state complete
        setTimeout(function() {
            This.renderNavBar();
        }, 10);
    },
    renderNavBar: function() {
        var win = this.getWindow();
        var histories = win.getTransitHistories();
        this._navbar.clearChildren();

        var bindEvent = function(view, index) {
            view.bind('click', function() {
                win.backTo(index);
            });
        };
        for(var i=0, n=histories.length; i<n; i++) {
            var h = histories[i];
            if(h.isCurrent) {
                this._navbar.addSubView(new cp.View({
                    template: cp.Templates.get('navbar_item_current'),
                    templateParameters: {
                        item: h.title
                    }
                }));
            } else {
                var item = new cp.View({
                    template: cp.Templates.get('navbar_item'),
                    templateParameters: {
                        item: {
                            href: 'javascript:void(0)',
                            text: h.title
                        }
                    }
                });
                this._navbar.addSubView(item);
                bindEvent(item, h.backToIndex);
            }
        }
        this._navbar.render();
    },
    transitController: function(controller, url, options, transitOptions) {
        if(!controller) {
            console.log('404 can\'t found controller ' + url);
            return;
        }
        this._container.clearChildren();
        this._container.addSubView(controller.getContentView());
        this._container.render();
    },
    viewDidRender: function() {
        console.log('nav did render');
    },
    viewDidLoad: function() {
        console.log('nav did load');
    }
});});
