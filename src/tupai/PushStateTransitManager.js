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
.use('tupai.util.HttpUtil')
.use('tupai.TransitManager')
.define('PushStateTransitManager', function (cp) { return cp.TransitManager.extend({
    _delegate: undefined,
    initialize : function (windowObject, rules, config) {

        cp.TransitManager.prototype.initialize.apply(this, arguments);

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
        var prev = cp.TransitManager.prototype._removeUntil.apply(this, arguments);

        this._enterStopPopStateEvent();
        window.history.go(bi*-1);
        // this can clear forward history. but will push two same state ........
        //window.history.pushState("","","");
        this._exitStopPopStateEvent();

        return prev;
    },
    _back: function (prev, transitOptions) {
        var ret = cp.TransitManager.prototype._back.apply(this, arguments);
        if(ret === 2) { // new transit success
            // need do this window history is really backed.
            // do this will replace the last current url.
            this._enterStopPopStateEvent();
            window.history.replaceState(
                this._current, "",
                this._createUrl(this._current.url, this._current.options)
            );
            this._exitStopPopStateEvent();
        }
    },
    transitWithHistory: function (url, options, transitOptions) {
        var result = cp.TransitManager.prototype.transitWithHistory.apply(this, arguments);
        if(result) {
            window.history.pushState({
                url:url,
                options:options,
                transitOptions: transitOptions
            }, "", this._createUrl(url, options));
        }
        return result;
    },
    _createUrl: function(url, options) {

        var qs = cp.HttpUtil.createQueryString(options);
        if(qs.length > 0) {
            if(url.indexOf('?') < 0) url += '?';
            url += qs;
        }
        return this._separator + url;
    },
    _parseFromLocation: function() {

        var escapeRegExp = function (string) {
            return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
        };
        var regexp = new RegExp("^(.*)"+escapeRegExp(this._separator)+"(.*)");
        var matches = (window.location.href+'').match(regexp);
        if(matches) {
            return cp.HttpUtil.parseOptionsFromUrl(matches[2]);
        }
    },
    transit: function (url, options, transitOptions) {
        if(transitOptions && transitOptions.entry) {
            // entry point
            var entry = this._parseFromLocation();

            if(entry) {
                url = entry.url;
                options = entry.options;
            }
        }
        var result = cp.TransitManager.prototype.transit.apply(this, [url, options, transitOptions]);
        if(result) {
            window.history.replaceState(this._current, "", this._createUrl(url, options));
        }
        return result;
    }
});});
