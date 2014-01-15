/**
 * @class   tupai.ViewController
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * A controller can send commands to content view to change the view's presentation of the model.
 * It delegate commands from view to update the model's state.
 *
 * ### The delegate commands from Base View:
 * -  viewDidLoad(view);
 * -  viewDidUnload(view);
 * -  viewDidShow(view);
 * -  viewDidHide(view);
 *
 * ### The delegate commands from TransitManager
 * -  viewInit(options, url, transitOptions);
 * -  transitController(controller, url, options, transitOptions);
 *
 * ### The delegate commands from TableView
 * -  numberOfRows(tableView);
 * -  cellForRowAtIndexPath(indexPath, tableView);
 * -  cellForRowAtTop(tableView);
 * -  cellForRowAtBottom(tableView);
 *
 */
Package('tupai')
.use('tupai.Application')
.define('ViewController', function(cp) { return Package.Class.extend({
	_view: undefined,
    _window: undefined,
    _app: undefined,

    /**
     * initialize
     * @param {tupai.Window} window object
     *
     */
	initialize: function(windowObject) {
        if(!windowObject) throw new Error('no window');
        this._window = windowObject;
        this._app = cp.Application.instance;
	},

    /**
     * get the window object
     * @return {tupai.Window} window object
     */
    getWindow: function() {
        return this._window;
    },

    /**
     * get the application object
     * @return {tupai.Application} application object
     */
    getApplication: function() {
        return this._app;
    },

    /**
     * {@link tupai.Window#back}
     */
    back: function (targetUrl, options, transitOptions) {
        return this._window.back.apply(this._window, arguments);
    },

    /**
     * {@link tupai.Window#backTo}
     */
    backTo: function(index) {
        return this._window.backTo.apply(this._window, arguments);
    },

    /**
     * {@link tupai.Window#transitWithHistory}
     */
    transitWithHistory: function (url, options, transitOptions) {
        return this._window.transitWithHistory.apply(this._window, arguments);
    },

    /**
     * {@link tupai.Window#getTransitHistories}
     */
    getTransitHistories: function () {
        return this._window.getTransitHistories.apply(this._window, arguments);
    },

    /**
     * {@link tupai.Window#transit}
     */
    transit: function (url, options, transitOptions) {
        return this._window.transit.apply(this._window, arguments);
    },

    /**
     * register an observer
     * @param {String} name cache name to observer
     * @param {Object} observer observer instance
     * @param {Object} [observer.didCacheChanged]
     * @param {Object} [observer.didCacheGC]
     *
     * ### observer methods parameter
     *     {
     *         name: cache name
     *         options: some custom options
     *     }
     *
     * @param {boolean} [first=true] add listener to the first of events pool
     *
     */
    registerCacheObserver: function(name, observer, first) {
        observer = observer || this;
        if(!this._cacheObservers) {
            this._cacheObservers = [];
        }
        this._cacheObservers.push({
            name: name,
            observer: observer
        });
        return this._app.getCacheManager().registerObserver(name, observer, first);
    },

    /**
     * delete an observer
     * @param {String} name cache name to observer
     * @param {Object} observer observer instance
     *
     */
    unRegisterCacheObserver: function(name, observer) {
        observer = observer || this;
        return this._app.getCacheManager().unRegisterObserver(name, observer);
    },

    /**
     * register an observer
     * @param {String} name api name to observer
     * @param {Object} observer observer instance
     * @param {Function} [observer.didHttpRequestSuccess]
     * @param {Function} [observer.didHttpRequestError]
     *
     * ### observer methods parameter
     *     {
     *         name: api name
     *         requestname: request name
     *         response: response object
     *         request: request object
     *         attributes: custom attributes
     *     }
     *
     * @param {boolean} [first=true] add listener to the first of events pool
     * @param {String} [managerName] ApiManager name
     *
     */
    registerApiObserver: function(name, observer, first, managerName) {
        var apiManager = this._app.getApiManager(managerName);
        if(!apiManager) {
            throw new Error('can\'t found apiManager by name ' + managerName);
        }
        observer = observer || this;
        if(!this._apiObservers) {
            this._apiObservers = [];
        }
        this._apiObservers.push({
            managerName: managerName,
            name: name,
            observer: observer
        });
        return apiManager.registerObserver(name, observer, first);
    },

    /**
     * delete an observer
     * @param {String} name cache name to observer
     * @param {Object} observer observer instance
     * @param {String} [managerName] ApiManager name
     *
     */
    unRegisterApiObserver: function(name, observer, managerName) {
        var apiManager = this._app.getApiManager(managerName);
        if(!apiManager) {
            throw new Error('can\'t found apiManager by name ' + managerName);
        }
        observer = observer || this;
        return apiManager.unRegisterObserver(name, observer);
    },

    /**
     * delete observers that register by registerApiObserver and registerCacheObserver.
     * this method will be called by viewDidUnload
     */
    unRegisterObservers: function() {
        var i,n;
        if(this._cacheObservers) {
            for(i=0,n=this._cacheObservers.length; i<n; i++) {
                var o = this._cacheObservers[i];
                this.unRegisterCacheObserver(o.name, o.observer);
            }
        }

        if(this._apiObservers) {
            for(i=0,n=this._apiObservers.length; i<n; i++) {
                var o = this._apiObservers[i];
                this.unRegisterApiObserver(o.name, o.observer, o.managerName);
            }
        }
    },

    /**
     * execute request
     * @param {Object} options
     * @param {String} options.name api name
     * @param {String} options.requestName request name
     * @param {Object} [options.parameters] request parameters
     * @param {Object} [options.queryParameters] request queryParameters
     * @param {Object} [options.formDatas] request formDatas
     * @param {Object} [options.attributes] request custom attributes
     * @param {Object} [options.managerName] apiManagerName
     *
     */
    executeApi: function(options) {
        if(!options) throw new Error('missing required parameter.');
        var managerName = options.managerName;
        this._app.getApiManager(managerName).execute(options);
    },

    /**
     * get Cache by name
     */
    getCache: function(name) {
        return this._app.getCache(name);
    },

    /**
     * get Cache by name
     */
    getCacheManager: function() {
        return this._app.getCacheManager();
    },

    /**
     * get Cache by name
     */
    getApiManager: function(name) {
        return this._app.getApiManager(name);
    },

    /**
     * get the content view object
     */
	getContentView: function() {
		return this._view;
	},

    /**
     * set content view.
     * you should do this method in viewInit
     * @param {tupai.ui.View} view content view object
     */
    setContentView: function(view) {
        // TODO bind view's lifecycle to release cache and api delegate.
        if(view) {
            view.setDelegate(this);
        }
        this._view = view;
    },

    /**
     * get content view's status.
     */
    getViewStatus: function() {
        if(!this._view) return null;
        return this._view.getViewStatus();
    },

    /**
     * find view by id in contentView (set by data-ch-id)
     * @param {String} id
     * @return {tupai.ui.View}
     *
     */
    findViewById: function() {
        if(!this._view) return null;
        return this._view.findViewById.apply(this._view, arguments);
    },

    /**
     * will call by View when did loaded.
     * @param {tupai.ui.View} view
     */
    viewDidLoad: function (view) {
    },

    /**
     * will call by View when did unloaded.
     * @param {tupai.ui.View} view
     */
    viewDidUnload: function(view) {
        this.unRegisterObservers();
    },

    /**
     * the start point of ViewController.
     * you should ovveride this function and create a content view by setContentView
     * @param {Object} options
     * @param {String} url
     * @param {Object} transit options
     */
	viewInit: function(options, url, transitOptions) {
	}
});});
