/**
 * @class   tupai.net.JsonpClient
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * execute request.
 * see {@link tupai.model.ApiManager}
 * */
Package('tupai.net')
.define('JsonpClient', function(cp) { return Package.Class.extend({

    /**
     * initialize
     * @param {Object} config
     * @param {Object} config.defaultRequestHeaders request headers
     * @param {Boolean} [config.autoIndex=false] auto change callbackName
     *
     */
    initialize : function (options) {

        this._autoIndex = true;
        if(options) {
            if(options.hasOwnProperty('autoIndex')) {
                this._autoIndex = options.autoIndex;
            }
        }
        if(this._autoIndex) {
            this._index = 0;
        }
    },
    _setupCallback: function(callbackName, request, responseDelegate) {
        var THIS = this;
        window[callbackName] = function(json) {
            if(THIS._autoIndex) {
                delete window[callbackName];
            }
            var response = {
                header: {},
                status: 200,
                statusText: 'OK',
                responseText: JSON.stringify(json),
                response: json
            }
            responseDelegate &&
            responseDelegate.didHttpRequestSuccess &&
            responseDelegate.didHttpRequestSuccess(response, request);
        };
    },
    _setupScriptTag: function(url) {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src=url;
        document.getElementsByTagName('head')[0].appendChild(s);
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

        var callbackName = '__tupai_jsonpCallbck';
        if(this._autoIndex) {
            this._index ++;
            callbackName += this._index;
        }
        var url = request.getUrl();
        var queryString = request.getQueryString();
        if(url.indexOf('?') > 0) url += '&';
        else url += '?';
        url += 'callback=' + callbackName;
        if(queryString) {
            url += '&' + queryString;
        }
        this._setupCallback(callbackName, request, responseDelegate);
        //setTimeout(this._setupScriptTag, 10, url);
        this._setupScriptTag(url);
    }
});});
