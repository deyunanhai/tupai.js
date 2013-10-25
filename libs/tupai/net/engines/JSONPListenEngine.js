/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.net.engines')
.use('tupai.net.HttpListenEngine')
.define('JSONPListenEngine', function(cp) { return cp.HttpListenEngine.extend({
	ID: 'TUPAI-JSONP-ENGINE',
	TIMEOUT: 35000,
	_successCallback: undefined,
	_errorCallback: undefined,
	_timeoutAfter: undefined,
	_checkHandlerTimerId: undefined,
	initialize: function(url) {
		if(cp.JSONPListenEngine.__INSTANCE) throw Error('this class can having only one instance.');

		cp.HttpListenEngine.prototype.initialize.apply(this, arguments);

		cp.JSONPListenEngine.__INSTANCE = this;
        this._url = url;
	},
	recv: function(result) {
		if(this._checkHandlerTimerId) {
			clearTimeout(this._checkHandlerTimerId);
		}
        if(result && result['error_code']) this._errorCallback(result['error_code'], result['reson']);
        else this._successCallback(result);
	},
	start: function(params, successCallback, errorCallback) {

		this._successCallback = successCallback;
		this._errorCallback = errorCallback;

		var script = document.getElementById(this.ID);
		if(script) {
			script.parentNode.removeChild(script);
		}

		script = document.createElement('script');
		script.type = 'text/javascript';
		script.id = this.ID;

        var url = this._url;
        if(url.match(/\?/)) url += '&';
        else url += '?';
	    script.src = url + Date.now();
	    script.async = true;
	    //script.charset = 'UTF-8';

	    document.getElementsByTagName('head')[0].appendChild(script);

	    this._timeoutAfter = this.TIMEOUT;

	    this._checkHandlerTimerId = setTimeout(function() {
	    	errorCallback(0, '');
	    }, this.TIMEOUT);
	},
	stop: function() {
		if(this._checkHandlerTimerId) {
			clearTimeout(this._checkHandlerTimerId);
		}
		cp.JSONPListenEngine.__INSTANCE = undefined;
	}
}, {
	__INSTANCE: undefined,
	recv: function(result) {
		if(cp.JSONPListenEngine.__INSTANCE) {
			cp.JSONPListenEngine.__INSTANCE.recv(result);
		}
	}
});});
