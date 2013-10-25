/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.net')
.use('tupai.util.HttpUtil')
.use('tupai.util.UserAgent')
.use('tupai.net.engines.CrossDomainAjaxListenEngine')
.use('tupai.net.engines.JSONPListenEngine')
.define('HttpListener', function(cp) { return Package.Class.extend({
    _options: undefined,
    _successCallbacks: undefined,
    _errorCallbacks: undefined,
    _listenEngine: undefined,
    _retry: undefined,
    RETRY_INTERVAL: 500,
    initialize: function(options) {
        if(!options || !options.urls || !options.urls.poll || !options.urls.jsonp) throw new Error('missing require parameter!')

        this._options = options;
        this._successCallbacks = [];
        this._errorCallbacks = [];
        this._retry = 99;
        this._retryInterval = this.RETRY_INTERVAL;
        this.setupListenEngine();
    },
    setupListenEngine: function() {

        var androidVer = cp.UserAgent.android();
        var opera = cp.UserAgent.opera();
        var ie = cp.UserAgent.ie();
        if((androidVer && androidVer < 2) || opera || ie) {
            this._listenEngine = new cp.JSONPListenEngine(this._options.urls.jsonp);
        } else {
            this._listenEngine = new cp.CrossDomainAjaxListenEngine(this._options.urls.poll);
        }
    },
    listen: function(callback) {

        if(typeof callback !== 'function') throw new Error('invalid parameter!');
        this._successCallbacks.push(callback);
        return this;
    },
    error: function(callback) {

        if(typeof callback !== 'function') throw new Error('invalid parameter!');
        this._errorCallbacks.push(callback);
        return this;
    },
    _fireCallbacks: function(result) {

        try {
            for(var i=0,n=this._successCallbacks.length; i<n; i++) {
                this._successCallbacks[i](result);
            }
        } catch(e) {
            //console.log(e);
        }
    },
    onError: function(status, statusText) {

        for(var i=0,n=this._errorCallbacks.length; i<n; i++) {
            this._errorCallbacks[i](status, statusText);
        }
    },
    prepareParameter: function() { // you can override this function
        var params = this._options.params || '';
        if(params === 'object') {
            params = cp.HttpUtil.encode(params);
        }
        return params;
    },
    isTimeOutMessage: function(responseText) { // you must override this function
        return !responseText;
    },
    willContinue: function(response) { // you can override this function
        return true;
    },
    _start: function() {

        var THIS = this;
        this._listenEngine.start(this.prepareParameter(),
            function (response) {
                try {
                    if(!THIS.isTimeOutMessage(response)) {
                        THIS._fireCallbacks(response);
                    }
                } finally {
                    if(THIS.willContinue(response)) {
                        setTimeout(function(){THIS._start();}, 1);
                    }
                }
            },
            function (status, statusText) {
                if(THIS._retry && THIS._retry>0) {
                    THIS._retry -= 1;
                    setTimeout(function(){THIS._start();}, THIS._retryInterval);
                    //THIS._retryInterval *= 2;
                    THIS._retryInterval += 10;
                } else {
                    THIS.onError(status, statusText);
                }
            }
        );
    },
    start: function() {

        var THIS = this;
        setTimeout(function(){THIS._start();}, 1);
        return this;
    },
    stop: function(callback) {
        this._retry = 0;
        this._listenEngine.stop();
    }
});});
