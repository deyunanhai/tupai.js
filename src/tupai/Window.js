/**
 * @class   tupai.Window
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 * A root element of the defaults is body.
 * The element that add attribute called 'data-ch-window' becomes root Element.
 *
 * ### example
 *     <body>
 *         <div data-ch-window='hoge1'>Hoge</div>
 *         <div data-ch-window='hoge2'>Hoge</div>
 *     </body>
 */
Package('tupai')
.use('tupai.TransitManager')
.use('tupai.ui.View')
.use('tupai.TransitManager')
.use('tupai.PushStateTransitManager')
.define('Window', function(cp) { return cp.View.extend({

    /**
     * initialize
     * @param [config] window config
     * @param [config.routes]
     * @param [config.disablePushState] disable html5 history api
     * ### example with TransisManager
     *     new cp.Window({
     *         routes: {
     *             '/root'    : cp.RootViewController,
     *             '/root/timeline': cp.TimeLineViewController
     *         }
     *     });
     *
     * ### example without TransitManager
     *     new cp.Window({
     *         rootViewController: cp.RootViewController
     *     });
     */
	initialize : function(config) {
		cp.View.prototype.initialize.apply(this,[]);

        this._config = config || {};
        if(this._config.routes) {
            if(config.disablePushState || !('state' in window.history)) {
                this._transitManager = new cp.TransitManager(this, config.routes);
            } else {
                this._transitManager = new cp.PushStateTransitManager(this, config.routes);
            }
            this._transitManager.setDelegate(this);
        } else if(this._config.rootViewController) {
            this._rootViewControllerClasszz = this._config.rootViewController;
        }
	},

    /**
     * get the window config object
     * @param [name] config name
     */
    getConfig: function(name) {
        if(name == undefined) return this._config;
        return this._config[name];
    },

    /**
     * {@link tupai.TransitManager#back}
     */
    back: function () {
        if(!this._transitManager) return;
        this._transitManager.back.apply(this._transitManager, arguments);
    },

    /**
     * {@link tupai.TransitManager#transitWithHistory}
     */
    transitWithHistory: function () {
        if(!this._transitManager) return;
        this._transitManager.transitWithHistory.apply(this._transitManager, arguments);
    },

    /**
     * {@link tupai.TransitManager#transit}
     */
    transit: function () {
        if(!this._transitManager) return;
        this._transitManager.transit.apply(this._transitManager, arguments);
    },

    /**
     * show root ViewController.
     * @param [url] root ViewController url
     * @param [options] root ViewController's options
     */
    showRoot: function(url, options) {

        if(this._transitManager) {
            return this.transit(url, options, {entry: true});
        } else if(!this._rootViewControllerClasszz) {
            throw new Error('missing root view controller.');
        }

        var controller = new this._rootViewControllerClasszz(this);
        controller.viewInit(options, '/root', 'root');
        this.transitController(controller, '/root', options,{});
    },

    transitController: function (controller, url, options, transitOptions) {
        //console.log('transit by window ' + url);
        if(!controller) {
            // show 404
            throw new Error('can\t found controller.('+url+')');
        } else {
            var view = controller.getContentView();
            if(!view) throw new Error('cannot get contentView from ViewController');
            this._displayView(view, transitOptions);
            this._currentController = controller;
        }
    },

    getCurrentController: function() {
        return this._currentController;
    },

    _displayView: function (view, transitOptions) {
        this._startDisplayView = true;
        var THIS = this;
        var finish = function () {
            if(THIS._finishDisplayQueue) {
                var q = THIS._finishDisplayQueue;
                while ((m = q.pop())) {
                    m();
                }
            }
            THIS.enableAction && THIS.enableAction();
            THIS._startDisplayView = false;
        };

        this.disableAction && this.disableAction();
        if(transitOptions.animation !== false) {
            /*if (transitOptions.transitType === 1) {
                this.animate(view, this, 'right2left', finish);
            } else if (transitOptions.transitType === 2) {
                this.animate(view, this, 'left2right', finish);
            } else {*/
                this.clearChildren();
                this.addSubView(view);
                this.render();
                finish();
            //}
        }
    },

    _displayViewWithAnimation: function(view, transitOptions) {
    },

    /**
     * call callback when display contentView
     * @param {Function} callback
     */
    doWhenFinishDisplay: function (callback) {
        if (this._startDisplayView) {
            if(!this._finishDisplayQueue) {
                this._finishDisplayQueue = [];
            }
            this._finishDisplayQueue.push(callback);
        } else {
            callback();
        }
    },

    _checkElement: function() {
        if(this._element) return;

        var winConfig = this._config.winConfig;
        if(winConfig) {
            this._element = winConfig.element;
        } else {
            var arr = document.querySelectorAll('*[data-ch-window]');
            if(!arr || arr.length < 1) {
                this._element =  document.getElementsByTagName('body')[0];
            } else {
                this._element = arr[0];
            }
        }
    },

    _onHTMLRender: function() {
        if(this._rendered) return false;
        this._rendered = true;
        return true;
    },

    /**
     * ovveride View's render
     * @param {Object} [args]
     */
	render: function (args) {
        this._checkElement();
        var topElement = this._element;
        var firsttime = this._onHTMLRender(topElement, args);
		this._onChildrenRender(args);
        if(firsttime) {
            this.didLoad && this.didLoad();
        }
	}
});});

