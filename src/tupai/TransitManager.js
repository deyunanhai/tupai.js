/**
 * @class   tupai.TransitManager
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * you can use this class to transit ViewController by url.
 *
 * you can initialize this Class by create Window use Config.
 * ### example (also see examples/twitter)
 *     new cp.Window({
 *         routes: {
 *             // call window.tansit('/root') will be show RootViewController
 *             '/root' : cp.RootViewController,
 *             // call window.tansit('/root/sub') will be show RootViewController and call RootViewController's transitController to show SubViewController.
 *             '/root/sub' : cp.SubViewController
 *         }
 *     })
 *
 * ### example
 *      var app = cp.ThisApplication.instance;
 *      var win = app.getWindow();
 *      win.transitWithHistory('/root', {hoge: 'hoge'});
 *
 */
Package('tupai')
.use('tupai.util.HashUtil')
.define('TransitManager', function (cp) { return Package.Class.extend({
    _delegate: undefined,
    initialize : function (windowObject, routes) {
        var name, i;

        if(!routes) {
            throw new Error('missing transit_rules.');
        }

        this._history = [];
        this._titles = {};
        this._window = windowObject;
        this._rootController = undefined;

        this._controllerRefs = {};
        for (name in routes) {

            var url = name.replace(/\*/g, '\\w*');
            var ruleRegExp = url + '$';

            var config = routes[name];
            var classzz;
            if(typeof config === 'string') {
                classzz = config;
            } else if(typeof config === 'function') {
                classzz = config;
            } else {
                classzz = config.classzz;
                this._titles[url] = config.title;
            }
            this._controllerRefs[ruleRegExp] = {
                classzz: classzz
            };
        }
    },
    setDelegate: function (delegate) {
        this._delegate = delegate;
    },
    _getController: function (url) {
        var route, controllerRef;
        for (route in this._controllerRefs) {
            if (url.match(route)) {
                controllerRef = this._controllerRefs[route];
                if (!controllerRef.instance) {
                    var classzz = controllerRef.classzz;
                    if(typeof(classzz) === 'string') {
                        var classPoint = Package.Class.forName(classzz);
                        controllerRef.instance = new classPoint(this._window);
                    } else if(typeof(classzz) === 'function') {
                        controllerRef.instance = new controllerRef.classzz(this._window);
                    } else {
                        throw new Error('cannot create view controller['+classzz+']');
                    }
                }
                return controllerRef.instance;
            }
        }
        return undefined;
    },

    /**
     *  get histories
     *  @return histories
     */
    getHistories: function() {
        var ret = [];
        for(var i=0, n=this._history.length; i<n; i++) {
            var h = this._history[i];
            var title = this._titles[h.url] || h.url;
            ret.push({
                backToIndex: n-i,
                url: h.url,
                options: h.options,
                transitOptions: h.transitOptions,
                title: title
            });
        }

        var c = this._current;
        if(c) {
            var title = this._titles[c.url] || c.url;
            ret.push({
                backToIndex: 0,
                isCurrent: true,
                url: c.url,
                options: c.options,
                transitOptions: c.transitOptions,
                title: title
            });
        }
        return ret;
    },

    size: function() {
        return this._history.length;
    },
    lastIndexOf: function(targetUrl) {
        if(!targetUrl) return -1;
        var h = this._history;
        for(var i=h.length-1; i>=0; i--) {
            if(h[i].url == targetUrl) {
                return i;
            }
        }
        return -1;
    },
    indexOf: function(targetUrl) {
        if(!targetUrl) return -1;
        var h = this._history;
        for(var i=0, n=h.length; i<n; i++) {
            if(h[i].url == targetUrl) {
                return i;
            }
        }
        return -1;
    },
    _removeUntil: function(targetUrl) {
        if(!targetUrl) return;
        var prev;
        do {
            prev = this._history.pop();
            if (!prev || prev.url == targetUrl) {
                break;
            }
        } while (1);
        return prev;
    },

    /**
     * back to previos ViewController
     * @param {String} [targetUrl]
     *   back to targetUrl, if the targetUrl is not in the stack,
     *   will be clear stack and transit the targetUrl
     * @param {Object} [options] ViewController options, used by new transit only.
     * @param {Object} [transitOptions]
     *  @return 0: failed, 1: back success, 2: new transit success
     */
    back: function (targetUrl, options, transitOptions) {
        var prev;
        if (targetUrl) {
            prev = this._removeUntil(targetUrl);
            if(!prev) {
                transitOptions = transitOptions || {};
                transitOptions.newTransit = true;
                prev = {
                    url: targetUrl,
                    options: options
                };
            }
        } else {
            prev = this._history.pop();
        }
        return this._back(prev, transitOptions);
    },

    /**
     * back to a specific URL from the history list.
     * @param {String} index must be positive number
     * @return 0: failed, 1: back success
     */
    backTo: function(index) {

        //console.log('backTo ' + index);
        if(index < 1 || index > this._history.length) return 0;
        var prev;
        while(index>0) {
            prev = this._history.pop();
            index --;
        }
        return this._back(prev);
    },

    _back: function(prev, transitOptions) {
        if (!prev) return 0;
        var url = prev.url;

        var options = prev.options;
        //var current = this._current;

        transitOptions = transitOptions || {};
        transitOptions.transitType = 2; // back
        //console.log('back to ' + url);
        var result = this._transit(url, options, transitOptions);
        this._current = prev;
        if(result) {
            return transitOptions.newTransit?2:1;
        } else {
            return 0;
        }
    },

    /**
     * transit the url and put current to stack.
     * @param {String} url ViewController url
     * @param {Object} [options] ViewController options
     * @param {Object} [transitOptions]
     */
    transitWithHistory: function (url, options, transitOptions) {
        if (!this._current) throw new Error('can\'t transit with history.');

        transitOptions = transitOptions || {};
        transitOptions.transitType = 1; // transit

        var current = this._current;
        if (this._transit(url, options, transitOptions)) {
            this._history.push(current);
            return true;
        } else {
            return false;
        }
    },
    _currentRoute: undefined,
    _current: undefined,
    _computeTransitRoute: function (url) {
        if (!url || url.length < 1) return null;
        var route = url.replace(/(^\s+)|((\/|\s)+$)/g, '').split('/');
        if (route.length < 2) return null;

        var currentRoute = this._currentRoute;
        this._currentRoute = route;

        if (!currentRoute) {
            return {
                root: route[0],
                path: route.slice(1)
            };
        }

        var n = currentRoute.length > route.length ? route.length : currentRoute.length;
        if (n === 0) {
            return null;
        }

        var i=1;
        for (;i<n;i++) {
            if (currentRoute[i] != route[i]) {
                break;
            }
        }
        if (i == n && currentRoute.length == route.length) {
            return {
                root: route.slice(0, route.length-1).join('/'),
                path: route.slice(route.length-1)
            }; // same route
        }

        return {
            root: route.slice(0,i).join('/'),
            path: route.slice(i)
        };
    },

    /**
     * transit the url
     * if you want to tansit with history please see {@link tupai.TransitManager#transitWithHistory}
     * @param {String} url ViewController url
     * @param {Object} [options] ViewController options
     * @param {Object} [transitOptions]
     */
    transit: function (url, options, transitOptions) {
        url = url || '/root';
        return this._transit(url, options, transitOptions);
    },
    _transit: function (url, options, transitOptions) {
    //console.log('tansit ' + url + ',options=' + JSON.stringify(options));
/*
        console.log(JSON.stringify(this._computeTransitRoute('/')));
        console.log(JSON.stringify(this._computeTransitRoute('/root')));
        console.log(JSON.stringify(this._computeTransitRoute('/root/aa')));
        console.log(JSON.stringify(this._computeTransitRoute('/root/aa')));
        console.log(JSON.stringify(this._computeTransitRoute('/root/aa/bb')));
        console.log(JSON.stringify(this._computeTransitRoute('/root/cc/dd')));
        console.log(JSON.stringify(this._computeTransitRoute('/dd/cc/dd')));
*/

        options = options || {}; // make sure the options is not null
        if (this._current &&
            this._current.url == url &&
            cp.HashUtil.equals(this._current.options, options)) {
            //console.log('skip this transit');
            return false;
        }

        var route = this._computeTransitRoute(url);
        if (route == null) {
            // should show 404 page?
            return false;
        }

        var pController = (route.root ? this._getController(route.root) : this._window);
        var pUrl = route.root;
        transitOptions = transitOptions || {};

        var initController = function(controller) {
            if(controller) {
                (controller.viewInit && controller.viewInit(options, url, r));
            }
            if(!pController.transitController)
                throw new Error('container controller must have transitController delegate function. ' + url);

            pController.transitController(controller, controllerUrl, options, transitOptions);
        };

        // controller for /
        if(pUrl === '') {
            var rootController = this._rootController;
            if(rootController === undefined) {
                this._rootController = rootController = this._getController('/');
                if(!rootController) {
                    this._rootController = null; // don't find it twice
                } else {
                    initController(rootController);
                    pController = rootController;
                }
            } else if(rootController) {
                pController = rootController;
            }
        }

        for (var i = 0, n = route.path.length; i < n; i++) {
            var r = route.path[i];
            var controllerUrl = pUrl + '/' + r;
            var controller = this._getController(controllerUrl);

            // show 404 in parent controller that controller is null
            initController(controller);

            if(!controller) break;
            pController = controller;
            pUrl = controllerUrl;
        }

        this._current = {
            url : url,
            options : options
        };
        return true;
    }
});});
