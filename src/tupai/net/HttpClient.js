/**
 * @class   tupai.net.HttpClient
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * execute request.
 * see {@link tupai.model.ApiManager}
 *
 * You can ovveride this class to define a special http access
 * #### JSONPClient.js
 *     Package('demo.api')
 *     .define('JSONPClient', function(cp) { return Package.Class.extend({
 *         initialize : function (options) {
 *             this._index = 0;
 *         },
 *         _setupCallback: function(callbackName, request, responseDelegate) {
 *             window[callbackName] = function(json) {
 *                 responseDelegate.didHttpRequestSuccess(json, request);
 *                 delete window[callbackName];
 *             };
 *         },
 *         _setupScriptTag: function(url) {
 *             var s = document.createElement('script');
 *             s.type = 'text/javascript';
 *             s.async = true;
 *             s.src=url;
 *             document.getElementsByTagName('head')[0].appendChild(s);
 *         },
 *         execute: function(request, responseDelegate) {
 *
 *             if(!request) {
 *                 throw new Error('missing required parameter.');
 *             }
 *
 *             this._index ++;
 *             var callbackName = '__jsonpCallbck' + this._index;
 *             var url = request.getUrl();
 *             var queryString = request.getQueryString();
 *             if(url.indexOf('?') > 0) url += '&';
 *             else url += '?';
 *             url += 'callback=' + callbackName;
 *             if(queryString) {
 *                 url += '&' + queryString;
 *             }
 *             this._setupCallback(callbackName, request, responseDelegate);
 *             //setTimeout(this._setupScriptTag, 10, url);
 *             this._setupScriptTag(url);
 *         }
 *     });});
 *
 * #### ApiManagerConfig
 *     Package('demo')
 *     .use('tupai.Application')
 *     .run(function(cp) {
 *         var app = new cp.Application({
 *             apiManager: {
 *                 client: {
 *                     classzz: 'demo.api.JSONPClient',
 *                     ... // other custom attributes
 *                 }
 *             }
 *         });
 *     });
 *
 *
 */
Package('tupai.net')
.use('tupai.util.HttpUtil')
.define('HttpClient', function(cp) { return Package.Class.extend({

    /**
     * initialize
     * @param {Object} config
     * @param {Object} config.defaultRequestHeaders request headers
     *
     */
    initialize : function (config) {

        if(config) {
            this._defaultRequestHeaders = config.defaultRequestHeaders;
        }
        if(!this._defaultRequestHeaders) {
            this._defaultRequestHeaders = {
                'Accept': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
                'If-Modified-Since': 'Thu, 01 Jun 1970 00:00:00 GMT'
            };
        }
    },
    _mergeDefault: function(defaultData, data) {
        data = data || {};
        if(defaultData) {
            for ( var name in defaultData) {
                data[name] = defaultData[name];
            }
        }
        return data;
    },
    _getResponseFromXhr: function(xhr, responseText) {
        return {
            header: xhr.getAllResponseHeaders(),
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: responseText
        };
    },
    _execute: function(request, delegate) {

        var url = request.getUrl();
        var queryString = request.getQueryString();
        if(queryString) {
            if(url.indexOf('?') > 0) url += '&';
            else url += '?';
            url += queryString;
        }

        var requestHeader = this._mergeDefault(
                this._defaultRequestHeaders, request.getHeaders());

        var requestMethod = request.getMethod();
        var requestData = request.getData();
        var requestType = request.getType();

        var THIS = this;
        cp.HttpUtil.ajax(
            url,
            function(responseText, xhr) {
                var response = THIS._getResponseFromXhr(xhr, responseText);
                delegate &&
                delegate.didHttpRequestSuccess &&
                delegate.didHttpRequestSuccess(response, request);
            },
            function(xhr) {
                var response = THIS._getResponseFromXhr(xhr);
                delegate &&
                delegate.didHttpRequestError &&
                delegate.didHttpRequestError(response, request);
            },
            {
                method: requestMethod,
                data: requestData,
                type: requestType,
                header: requestHeader
            }
        );
    },
    /**
     * execute request
     * @param {tupai.net.HttpRequest} request
     * @param {Object} [responseDelegate]
     * @param {Function} [responseDelegate.didHttpRequestSuccess] parameters: response, request
     * @param {Function} [responseDelegate.didHttpRequestError] parameters: response, request
     *
     */
    execute: function(request, responseDelegate) {
        if(!request) {
            throw new Error('missing required parameter.');
        }
        this._execute(request, responseDelegate);
    }
});});
