/**
 * @class   tupai.net.HttpRequest
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 * see {@link tupai.model.ApiManager}
 *
 */
Package('tupai.net')
.use('tupai.util.HashUtil')
.define('HttpRequest', function(cp) { return Package.Class.extend({

    /**
     * initialize
     * @param {Object} config
     * @param {String} config.url request url
     * @param {Object} [config.headers] http request headers
     * @param {Object} [config.type='json'] http request type
     * @param {Object} [config.method='GET'] http request method
     * @param {Object} [config.parameters] request parameters
     * @param {Object} [config.queryParameters] request queryParameters
     * @param {Object} [config.formDatas] request formDatas
     * @param {Object} [config.attributes] request custom attributes
     *
     *
     */
    initialize: function(config) {

        cp.HashUtil.require(config, ['url']);
        this._url = config.url;
        this._headers = config.headers || {};
        this._type = config.type;
        this._method = config.method;
        this._attributes = config.attributes;
        this._noFormData = !!(!this._method || this._method.match(/get/i));
        this._parameters = config.parameters;

        this._queryParameters = config.queryParameters;
        this._formData = config.formData;
    },

    /**
     * add some params to request
     * @param {Object} params
     * @param {Object} [params.headers] http request headers
     * @param {Object} [params.parameters] request parameters
     * @param {Object} [params.queryParameters] request queryParameters
     * @param {Object} [params.formDatas] request formDatas
     * @param {Object} [params.attributes] request custom attributes
     *
     */
    addAll: function(params) {
        this.addParameters(params.parameters);
        this.addQueryParameters(params.queryParameters);
        this.addFormDatas(params.formDatas);
        this.addAttributes(params.attributes);
        this.addHeaders(params.headers);
    },

    /**
     * add some headers to request
     * @param {Object} headers http request headers
     *
     */
    addHeaders: function(headers) {
        this._headers = cp.HashUtil.merge(this._headers, headers);
    },

    /**
     * add some custom attributes to request
     * @param {Object} attributes http request custom attributes
     *
     */
    addAttributes: function(attributes) {
        this._attributes = cp.HashUtil.merge(this._attributes, attributes);
    },

    /**
     * add some parameters to request
     * @param {Object} parameters http request parameters
     *
     * those parameters will add to formDatas when method is POST,
     * add to queryParameters otherwise.
     *
     */
    addParameters: function(parameters) {
        this._parameters = cp.HashUtil.merge(this._parameters, parameters);
    },

    /**
     * add some query parameters to request
     * @param {Object} parameters http request query parameters
     *
     */
    addQueryParameters: function(parameters) {
        this._queryParameters = cp.HashUtil.merge(this._queryParameters, parameters);
    },

    /**
     * add some form datas to request
     * @param {Object} parameters http request form data
     *
     * this will ignore if method isn't POST
     *
     */
    addFormDatas: function(parameters) {
        this._formData = cp.HashUtil.merge(this._formData, parameters);
    },

    /**
     * get url
     * @return {String} url
     *
     */
    getUrl: function() {
        return this._url;
    },

    /**
     * get type
     * @return {String} type
     *
     */
    getType: function() {
        return this._type;
    },

    /**
     * get http headers
     * @return {Object} headers
     *
     */
    getHeaders: function() {
        return this._headers;
    },
    getQueryData: function() {
        if(this._noFormData && this._parameters) {
            return cp.HashUtil.merge(this._parameters, this._queryParameters);
        } else {
            return this._queryParameters;
        }
    },
    getQueryString: function() {
        var paramStr='';

        var queryData = this.getQueryData();
        if(queryData) {
            for (var name in queryData) {
                var val = queryData[name];
                if(val === undefined) continue;
                paramStr += name + '=' + encodeURIComponent(val) + '&';
            }
        }

        if(paramStr.length > 1) return paramStr.substring(0, paramStr.length-1);
        else return null;
    },

    /**
     * get custom attributes
     * @return {Object} attributes
     *
     */
    getAttributes: function() {
        return this._attributes;
    },

    /**
     * get custom attribute by name
     * @param {String} name
     * @return {Object} attribute
     *
     */
    getAttribute: function(name) {
        if(!this._attributes) return undefined;
        else return this._attributes[name];
    },

    /**
     * get parameters
     * @return {Object} parameters
     *
     */
    getParameters: function() {
        return this._parameters;
    },

    /**
     * get parameter by name
     * @param {String} name
     * @return {String} parameter
     *
     */
    getParameter: function(name) {
        if(!this._parameters) return undefined;
        else return this._parameters[name];
    },
    getData: function() {

        if(!this._noFormData && this._parameters) {
            return cp.HashUtil.merge(this._parameters, this._formData);
        } else {
            return this._formData;
        }
    },
    setRequestName: function(requestName) {
        this._requestName = requestName;
    },
    getRequestName: function() {
        return this._requestName;
    },
    getName: function() {
        return this._name;
    },
    setName: function(name) {
        this._name = name;
    },
    getName: function() {
        return this._name;
    },

    /**
     * get http method
     * @return {String} http method
     *
     */
    getMethod: function() {
       return this._method;
    }
});});
