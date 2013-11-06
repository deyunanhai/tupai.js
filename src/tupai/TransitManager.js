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
        this._window = windowObject;

        this._controllerRefs = {};
        for (name in routes) {

            var ruleRegExp = name.replace(/\*/g, '\\w*') + '$';
            var s = name.split('/');

            this._controllerRefs[ruleRegExp] = {
                classzz: routes[name]
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
                        throw new Error('cannot create view controller.' + classzz);
                    }
                }
                return controllerRef.instance;
            }
        }
        return undefined;
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
            if (!prev) {
                break;
            } else if(prev.url == targetUrl) {
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
     * @param {Object} [transitOptions]
     */
    back: function (targetUrl, transitOptions) {
        var prev;
        if (targetUrl) {
            prev = this._removeUntil(targetUrl);
            if(!prev) prev = {url: targetUrl};
        } else {
            prev = this._history.pop();
            if (!prev) return;
        }
        var url = prev.url;

        var options = prev.options;
        var current = this._current;

        transitOptions = transitOptions || {};
        transitOptions.transitType = 2; // back
        //console.log('back to ' + url);
        var ret = this._transit(url, options, transitOptions);
        this._current = prev;
        return ret;
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
        var rootController = (route.root ? this._getController(route.root) : this._window);
        var rootUrl = route.root;
        transitOptions = transitOptions || {};
        for (var i = 0, n = route.path.length; i < n; i++) {
            var r = route.path[i];
            var controllerUrl = rootUrl + '/' + r;
            var controller = this._getController(controllerUrl);

            if(controller) {
                (controller.viewInit && controller.viewInit(options, url, r));
            }
            if(!rootController.transitController) throw new Error('root controller must have transitController delegate function. ' + url);
            rootController.transitController(controller, controllerUrl, options, transitOptions);

            if(!controller) break;
            rootController = controller;
            rootUrl = controllerUrl;
        }

        this._current = {
            url : url,
            options : options
        };
        return true;
    }
});});
