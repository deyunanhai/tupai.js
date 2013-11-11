/**
 * @class   tupai.PushStateTransitManager
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.3
 *
 * html5 history api are support by this class.
 * this class is default tansitManager.
 * if you don't want to use html5 history api for you application
 * you can set the window options like bellow.
 *
 *     new cp.Window({
 *         routes: {
 *             '/root'    : cp.RootViewController,
 *             '/root/timeline': cp.TimeLineViewController
 *         },
 *         disablePushState: true
 *     });
 *
 */
Package('tupai')
.use('tupai.util.HashUtil')
.use('tupai.TransitManager')
.define('PushStateTransitManager', function (cp) { return cp.TransitManager.extend({
    _delegate: undefined,
    initialize : function (windowObject, rules, config) {

        this.SUPER.initialize.apply(this, arguments);

        this._separator = (config && config.separator) || "#!";
        var initialURL = location.href;
        var THIS = this;
        window.addEventListener("popstate", function(jsevent) {
            if(this._stopPopStateEventStatus) return;
            //console.log(jsevent);
            var state = jsevent.state;
            if(!state) return;
            var url = state.url;
            if(!url) return;

            THIS._transit(
                url,
                state.options,
                state.transitOptions);
        });
    },
    _enterStopPopStateEvent: function() {
        if(!this._stopPopStateEventStatus) {
            this._stopPopStateEventStatus = 1;
        } else {
            this._stopPopStateEventStatus++;
        }
        //console.log("_entry " + this._stopPopStateEventStatus);
    },
    _exitStopPopStateEvent: function() {
        //console.log("_exit");
        if(this._stopPopStateEventStatus) this._stopPopStateEventStatus--;
    },
    _removeUntil: function(targetUrl) {
        if(!targetUrl) return;
        var index = this.lastIndexOf(targetUrl);
        if(index < 0) return;
        var bi = this.size() - index;
        var prev = this.SUPER._removeUntil.apply(this, arguments);

        this._enterStopPopStateEvent();
        window.history.go(bi*-1);
        // this can clear forward history. but will push two same state ........
        //window.history.pushState("","","");
        this._exitStopPopStateEvent();

        return prev;
    },
    back: function (targetUrl, transitOptions) {
        var ret = this.SUPER.back.apply(this, arguments);
        if(ret) {
            /*
            need do this window history is really backed.
            this._enterStopPopStateEvent();
            window.history.replaceState(
                this._current, "",
                this._createUrl(this._current.url, this._current.options)
            );
            this._exitStopPopStateEvent();
            */
        }
    },
    transitWithHistory: function (url, options, transitOptions) {
        var result = this.SUPER.transitWithHistory.apply(this, arguments);
        if(result) {
            window.history.pushState({
                url:url,
                options:options,
                transitOptions: transitOptions
            }, "", this._createUrl(url, options));
        }
        return result;
    },
    _createOptionsFromStr: function(paramsStr, options) {

        if(!paramsStr) return options;
        var pairs = paramsStr.split('&');
        options = options || {};
        for(var i=0, n=pairs.length; i<n; i++) {
            var c = pairs[i].split('=');
            options[c[0]] = decodeURIComponent(c[1]);
        }
        return options;
    },
    _createQueryString: function(options) {

        var qs = '';
        if(typeof options !== 'object') return qs;
        for(var name in options) {
            var val = options[name];
            qs += '&' + name + '=' + encodeURIComponent(val);
        }
        if(qs.length > 0) qs = qs.substring(1);
        return qs;
    },
    _createUrl: function(url, options) {

        var qs = this._createQueryString(options);
        if(qs.length > 0) {
            if(url.indexOf('?') < 0) url += '?';
            url += qs;
        }
        return this._separator + url;
    },
    transit: function (url, options, transitOptions) {
        if(transitOptions && transitOptions.entry) {
            // entry point

            var escapeRegExp = function (string) {
                return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
            };
            var entryUrl;
            var regexp = new RegExp("^(.*)"+escapeRegExp(this._separator)+"(.*)");
            var matches = (window.location.href+'').match(regexp);
            if(matches) {
                entryUrl = matches[2];
            }

            if(entryUrl) {
                options = {};
                matches = entryUrl.match(/^(.*)\?(.*)$/);
                if(matches) {
                    entryUrl = matches[1];
                    var params = matches[2];
                    options = this._createOptionsFromStr(params, options);
                }

                url = entryUrl;
                Array.prototype.slice.call(arguments).splice(0, 2, entryUrl, options);
            }
        }
        var result = this.SUPER.transit.apply(this, arguments);
        if(result) {
            window.history.replaceState(this._current, "", this._createUrl(url, options));
        }
        return result;
    }
});});
