/**
 * @class tupai.Application
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 * This is application.
 * You can get the static instance by use ThisApplication.instance
 */
Package('tupai')
.use('tupai.events.Events')
.use('tupai.model.CacheManager')
.use('tupai.model.ApiManager')
.use('tupai.util.CommonUtil')
.use('tupai.Window')
.define('Application', function(cp) { return Package.Class.extend({
    _window  : undefined,
    _delegate: undefined,
    _events  : undefined,
    DEFAULT_WIN_ID: 'default',

    /**
     * initialize
     * @param config
     * @param delegate
     *
     */
    initialize : function(config, delegate) {

        this._setupWindows(config, delegate);
        this._delegate = delegate;
        if(config) {
            this._attributes = config.attributes;
            this.addApiManagers(config.apiManagers);
            this.addApiManager(config.apiManager);
            this.setupCacheManager(config.cacheManager);
        }

        this._events = new cp.Events();
        cp.Application.instance = this;

        this._delegate &&
        this._delegate.didApplicationLoad &&
        this._delegate.didApplicationLoad();
    },
    _setupWindows: function(config, delegate) {

        this._windows = {};

        var getConfig;
        if(config && config.windows) {
            getConfig = function(id) {
                return config.windows[id];
            };
        } else {
            getConfig = function(id) {
                var ret = config && config.window;
                return ret || {};
            };
        }

        var createWindow;
        if(delegate) {
            createWindow = function(id, element) {
                var config = getConfig(id);
                config.winConfig = {element: element, id: id};
                return delegate.createWindow(config, id);
            };
        } else {
            createWindow = function(id, element) {
                var config = getConfig(id);
                config.winConfig = {element: element, id: id};
                return new cp.Window(config);
            };
        }

        var elements = document.querySelectorAll('*[data-ch-window]');
        if(!elements || elements.length < 1) {
            var element =  document.getElementsByTagName('body')[0];
            this._windows[this.DEFAULT_WIN_ID] = createWindow(this.DEFAULT_WIN_ID, element);
        } else {
            for(var i=0, n=elements.length; i<n; i++) {
                var element = elements[i];
                var id = cp.CommonUtil.getDataSet(element, 'chWindow') || this.DEFAULT_WIN_ID;
                this._windows[id] = createWindow(id, element);
            }
        }
    },

    /**
     * setup application setup CacheManager
     * @param config CacheManager config
     */
    setupCacheManager: function(config) {
        if(!config) return;
        if(this._cacheManager) throw new Error('CacheManager has already setup.');
        this._cacheManager = new cp.CacheManager(config);
    },

    /**
     * add an ApiManager by name
     * @param config ApiManager config
     * @param [name] ApiManager name
     */
    addApiManager: function(config, name) {
        if(!config) return;
        if(!this._apiManagers) this._apiManagers = {};

        name = name || 'default';
        this._apiManagers[name] = new cp.ApiManager(config);
    },

    /**
     * add some ApiManagers
     * @param config ApiManager's configs
     */
    addApiManagers: function(config) {
        if(!config) return;
        for(var name in config) {
            this.addApiManager(config[name], name);
        }
    },

    /**
     * get CacheManager instance
     */
    getCacheManager: function() {
        return this._cacheManager;
    },

    /**
     * get Cache by name
     */
    getCache: function(name) {
        return this._cacheManager.getCache(name);
    },

    /**
     * get an ApiManager by name
     * @param [name] ApiManager name
     */
    getApiManager: function(name) {
        name = name || 'default';
        return this._apiManagers[name];
    },

    /**
     * set a custom attribute
     * @param name attribute name
     * @param value attribute value
     */
    setAttribute: function(name, value) {
        if(!this._attributes) this._attributes = {};
        var old = this._attributes[name];
        this._attributes[name] = value;
        return old;
    },

    /**
     * get the custom attribute by name
     * @param name attribute name
     */
    getAttribute: function(name) {
        return this._attributes && this._attributes[name];
    },

    /**
     * {@link tupai.util.Events#fire}
     */
    fire: function() {
        this._events.fire.apply(this._events, arguments);
    },

    /**
     * {@link tupai.util.Events#fireDelegate}
     */
    fireDelegate: function() {
        this._events.fireDelegate.apply(this._events, arguments);
    },

    /**
     * {@link tupai.util.Events#on}
     */
    on: function() {
        this._events.on.apply(this._events, arguments);
    },

    /**
     * {@link tupai.util.Events#once}
     */
    once: function() {
        this._events.once.apply(this._events, arguments);
    },

    /**
     * {@link tupai.util.Events#addEventListener}
     */
    addEventListener: function() {
        this._events.addEventListener.apply(this._events, arguments);
    },

    /**
     * {@link tupai.util.Events#removeEventListener}
     */
    removeEventListener: function() {
        this._events.removeEventListener.apply(this._events, arguments);
    },

    /**
     * {@link tupai.util.Events#off}
     */
    off: function() {
        this._events.off.apply(this._events, arguments);
    },

    /**
     * close this application.
     */
    close: function() {
        this._delegate &&
        this._delegate.didApplicationUnload &&
        this._delegate.didApplicationUnload();
    },

    /**
     * get window by id
     * @param {String} [id] optional
     */
    getWindow: function(id) {
        return this._windows[id || this.DEFAULT_WIN_ID];
    },

    /**
     * show root url
     * @param {String} url root controller url
     * @param {Object} options root controller options
     * @param {String} [id] witch window to show
     */
    show: function(url, options, id) {
        var win = this._windows[id || this.DEFAULT_WIN_ID];
        win && win.showRoot(url, options);
    }
});});

