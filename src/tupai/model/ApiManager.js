/**
 * @class   tupai.model.ApiManager
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 *
 * ### example
 *
 * #### RootViewController.js
 *     @example
 *     Package('demo')
 *     .use('tupai.ui.View')
 *     .use('tupai.ViewController')
 *     .define('RootViewController', function(cp) { return cp.ViewController.extend({
 *         viewInit: function() {
 *             var contentView = new cp.View();
 *             this.setContentView(contentView);
 *         },
 *         viewDidLoad: function() {
 *             this.registerApiObserver('timeline', this);
 *             this.executeApi({
 *                 name: 'timeline',
 *                 requestName: 'search',
 *                 parameters: {q: 'NHK'}
 *             });
 *         },
 *         viewDidUnload: function() {
 *             this.unRegisterApiObserver('timeline', this);
 *         },
 *         didHttpRequestSuccess: function(e) {
 *             var res = e.response;
 *             this.getContentView().setValue(res.responseText);
 *             logOnBody('[RootViewController]: ' + res.responseText);
 *         },
 *         didHttpRequestError: function(e) {
 *             logOnBody(e);
 *         }
 *     });});
 *
 *     Package('demo')
 *     .use('tupai.Application')
 *     .define('ResponseDelegate', function(cp) { return Package.Class.extend({
 *         didHttpRequestSuccess: function(name, reqName, res, req) {
 *
 *             logOnBody('[ResponseDelegate]: ' + res.responseText);
 *         },
 *         didHttpRequestError: function(name, reqName, res, req) {
 *             logOnBody(res.responseText);
 *         }
 *     });});
 *
 *     Package('demo')
 *     .use('tupai.Application')
 *     .use('demo.RootViewController')
 *     .run(function(cp) {
 *         var apiManagerConfig = {
 *             apiParameterMap: {
 *                 timeline: {
 *                     search: {
 *                         method: 'GET',
 *                         url: '/testData.json',
 *                         parameters: {
 *                             'some_parameter': 'hoge'
 *                         }
 *                     }
 *                 }
 *             },
 *             responseDelegate: {
 *                 classzz: "demo.ResponseDelegate"
 *             }
 *         };
 *         var app = new cp.Application({
 *             window: {
 *                 routes: {
 *                     '/root'    : cp.RootViewController,
 *                 }
 *             },
 *             apiManager: apiManagerConfig
 *         });
 *         app.show('/root');
 *     });
 *
 * ### multi ApiManager example
 *     var app = new cp.Application({
 *         apiManagers: {
 *             manager1: apiManagerConfig1,
 *             manager2: apiManagerConfig2,
 *             ...
 *         },
 *         ...
 *     });
 *
 */
Package('tupai.model')
.use('tupai.events.Events')
.use('tupai.util.HashUtil')
.use('tupai.net.HttpClient')
.use('tupai.net.JsonpClient')
.use('tupai.net.HttpRequest')
.define('ApiManager', function(cp) { return Package.Class.extend({

    /**
     * initialize
     * @param {Object} config
     * @param {Object} config.client HttpClient config
     * @param {Object} [config.client.classzz='tupai.net.HttpClient'] HttpClient class
     * @param {Object} [config.client.type] HttpClient type will be jsonp or http
     * @param {String} [config.requestClasszz='tupai.net.HttpRequest'] HttpRequest class
     * @param {Object} [config.responseDelegate] HttpResponseDelegate config
     * @param {String} [config.responseDelegate.classzz] HttpResponseDelegate class
     * @param {Object} [config.apiParameterMap] see {@link tupai.net.HttpRequest#initialize}
     *
     * ### apiParameterMap example
     *     {
     *         timeline: {
     *             search: {
     *                 method: 'GET',
     *                 url: '/api/items',
     *                 parameters: {
     *                     // some parameter
     *                 },
     *             },
     *             ...
     *         },
     *         ...
     *     }
     *
     *
     */
    initialize: function(config) {

        this._events = new cp.Events();
        if(!config) throw new Error('missing config');

        var clientConfig = config.client;
        this._client = this._createClient(config.client);

        var responseDelegateConfig = config.responseDelegate;
        if(responseDelegateConfig) {
            this._responseDelegate = this._createResponseDelegate(responseDelegateConfig);
        }
        if(config.defaultRequestClasszz) {
            console.error('defaultRequestClasszz is Deprecated, use requestClasszz instead');
        }
        this._requestClass = this._createClass(
            config.defaultRequestClasszz || config.requestClasszz,
            cp.HttpRequest
        );

        this._requestParameterMap = config.apiParameterMap || {};
    },
    _createClass: function(classzz, defaultClasszz) {
        if(classzz) {
            if(typeof(classzz) === 'string') {
                return Package.Class.forName(classzz);
            } else if(typeof(classzz) === 'function') {
                return classzz;
            } else {
                throw new Error('cannot create class ' + classzz);
            }
        } else {
            return defaultClasszz;
        }
    },
    _createResponseDelegate: function(responseDelegateConfig) {
        var cls = this._createClass(responseDelegateConfig.classzz);
        if(cls) return new cls(responseDelegateConfig.config);
        else return undefined;
    },
    _createClient: function(clientConfig) {
        var type = clientConfig && clientConfig.type;
        var cls;
        if(type) {
            if(type === 'jsonp') {
                cls = cp.JsonpClient;
            } else if(type === 'default' || type === 'http') {
                cls = cp.HttpClient;
            } else {
                throw new Error('unknow type ' + type);
            }
        } else {
            cls = this._createClass(clientConfig && clientConfig.classzz, cp.HttpClient);
        }
        return new cls(clientConfig && clientConfig.config);
    },
    getRequestParameter: function(name, requestName) {
        var r = this._requestParameterMap[name];
        if(!r) throw new Error('cannot find request for ' + name + ':' + requestName);
        var request = r[requestName];
        if(!request) throw new Error('cannot find request for ' + name + ':' + requestName);
        return request;
    },
    createRequest: function(params) {
        var requestParameter = this.getRequestParameter(params.name, params.requestName);
        var request = new this._requestClass(requestParameter);
        request.addAll(params);
        request.setName(params.name);
        request.setRequestName(params.requestName);

        return request;
    },

    executeRequest: function(name, requestName, request, success, error) {
        var THIS = this;
        this._client.execute(request, {
            didHttpRequestSuccess: function(response, request) {
                THIS._responseDelegate &&
                THIS._responseDelegate.didHttpRequestSuccess &&
                THIS._responseDelegate.didHttpRequestSuccess(name, requestName, response, request);

                THIS.notify(name, requestName, 'didHttpRequestSuccess', response, request);
                if(typeof(success) == 'function') success(name, requestName, response, request);
            },
            didHttpRequestError: function(response, request) {
                THIS._responseDelegate &&
                THIS._responseDelegate.didHttpRequestError &&
                THIS._responseDelegate.didHttpRequestError(name, requestName, response, request);

                THIS.notify(name, requestName, 'didHttpRequestError', response, request);
                if(typeof(error) == 'function') error(name, requestName, response, request);
            },
        });
    },

    /**
     * execute request
     * @param {Object} options
     * @param {String} options.name api name
     * @param {String} options.requestName request name
     * @param {Object} [options.parameters] request parameters
     * @param {Object} [options.queryParameters] request queryParameters
     * @param {Object} [options.formDatas] request formDatas
     * @param {Object} [options.attributes] request custom attributes
     *
     */
    execute: function(obj, requestName, parameters, queryParameters, formDatas, attributes) {
        var params;
        if(typeof(obj) === 'object') {
            // IF DEBUG
            cp.HashUtil.only('ApiManager.execute ', obj, [
                                      'managerName',
                                      'name',
                                      'requestName',
                                      'parameters',
                                      'queryParameters',
                                      'formDatas',
                                      'attributes',
                                      'success',
                                      'error'
                                   ]);
            params = obj;
        } else {
            console.error('this parameter is Deprecated in ApiManager.execute');
            params = {
                name: obj,
                requestName: requestName,
                parameters: parameters,
                queryParameters: queryParameters,
                formDatas: formDatas,
                attributes: attributes
            };
        }
        var request = this.createRequest(params);
        this.executeRequest(params.name, params.requestName, request, params.success, params.error);
    },

    /**
     * register an observer
     * @param {String} name api name to observer
     * @param {Object} observer observer instance
     * @param {Function} [observer.didHttpRequestSuccess]
     * @param {Function} [observer.didHttpRequestError]
     *
     * ### observer methods parameter
     *     {
     *         name: api name
     *         requestname: request name
     *         response: response object
     *         request: request object
     *         attributes: custom attributes
     *     }
     *
     * @param {boolean} [first=true] add listener to the first of events pool
     *
     */
    registerObserver: function(name, observer, first) {
        this._events.addEventListener(name, observer, first);
    },

    /**
     * delete an observer
     * @param {String} name api name to observer
     * @param {Object} observer observer instance
     *
     */
    unRegisterObserver: function(name, observer) {
        this._events.removeEventListener(name, observer);
    },

    /**
     * notify an event to call observer delegate
     * @param {String} name api name
     * @param {String} requestName request name
     * @param {Object} parameters request parameters
     * @param {Object} queryParameters request queryParameters
     * @param {Object} formDatas request formDatas
     * @param {Object} attributes request attributes
     *
     */
    notify: function(name, requestName, methodName, response, request, attributes) {
        var e = {
            name: name,
            requestName: requestName,
            response: response,
            request: request,
            attributes: attributes
        };
        this._events.fireDelegate(name, methodName, e);
    }
});});
