/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.net.engines')
.use('tupai.util.HttpUtil')
.use('tupai.net.HttpListenEngine')
.define('CrossDomainAjaxListenEngine', function(cp) { return cp.HttpListenEngine.extend({
    METHOD: 'POST',
    _xhr: undefined,
    initialize: function(url) {
        cp.HttpListenEngine.prototype.initialize.apply(this, arguments);
        this._url = url;
    },
    start: function(params, successCallback, errorCallback) {
        var THIS = this;
        this._xhr = cp.HttpUtil.ajax(
                THIS._url,
                function (responseText) {

                    var response = null;
                    if(responseText) {
                        try {
                            response = JSON.parse(responseText); // this need json lib
                        } catch(e) {
                            errorCallback(-2, 'json parse error');
                            return; // TODO handle json parse error
                        }
                    } else if(!xhr.getAllResponseHeaders() && !xhr.responseType) {
                        // bad response because cross domain
                        errorCallback(-3, 'no response');
                        return;
                    }

                    successCallback(response);
                },
                function (xhr) {
                    errorCallback(xhr.status, xhr.statusText);
                },{
                    method : THIS.METHOD,
                    data : params
                }
        );
    },
    stop: function() {
        if(this._xhr) {
            this._xhr.abort();
            this._xhr = undefined;
        }
    }
});});
