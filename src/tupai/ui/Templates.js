/**
 * @class   tupai.ui.Templates
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * read template from html
 *
 * ### simple initialize from html
 * var templates = new cp.Templates({
 *     html: '<div data-ch-template='template1'>something<div>'
 * });
 *
 * ### simple initialize from remote
 * var templates = new cp.Templates({
 *     url: 'http://demo.local/demo.html'
 * });
 *
 */
Package('tupai.ui')
.use('tupai.util.HttpUtil')
.define('Templates', function(cp) { return Package.Class.extend({
    /**
     * initialize
     * @param {Object} [args]
     *
     * ### args:
     * - {String} [html]: the html template
     * - {String} [url]: this url to download html
     * - {String} [element]: the element's outerHTML will be used
     * - {String} [elementId]: the element's outerHTML will be used
     *
     */
    initialize : function (args) {
        if(!args) throw new Error('missing required parameters.');

        if(args.html) {
            this._parseHtml(args.html);
        } else if(args.url) {
            var THIS = this;
            this._loading = true;
            cp.HttpUtil.ajax(args.url,
                function(html) {
                    try {
                        THIS._parseHtml(html);
                    } finally {
                        THIS._loading = false;
                    }
                },
                function(xhr) {
                    THIS._loading = false;
                    args.error && args.error(xhr);
                }
            );
        } else if(args.element) {
            this._parseHtml(args.element.outerHTML);
        } else if(args.elementId) {
            var elem = document.getElementById(args.elementId);
            if(elem) {
                this._parseHtml(elem.outerHTML);
            } else {
                throw new Error('cannot find [' + args.elementId + '] to create Templates');
            }
        }
    },
    _parseHtml: function(htmlTemplate) {
        var root = document.createElement('div');
        root.innerHTML = htmlTemplate;
        var elements = root.querySelectorAll('*[data-ch-template]');
        var templates={};
        for (var i=0,len=elements.length; i<len; ++i) {
            var element = elements[i];
            var templateId = element.getAttribute('data-ch-template');
            if(!templateId) {
                continue;
            }
            element.removeAttribute('data-ch-template');

            var excludeSubTemplates = true;
            var includeSubTemplatesAttr = element.getAttribute('data-ch-include-sub-templates');
            if(includeSubTemplatesAttr) {
                element.removeAttribute('data-ch-include-sub-templates');
                if(includeSubTemplatesAttr === 'true') {
                    excludeSubTemplates = false;
                }
            }

            if(excludeSubTemplates) {
                element = element.cloneNode(true);
                this._removeSubTemplates(element);
            }

            var html = element.outerHTML;
            templates[templateId] = html;
        }
        this._templates = templates;
        this._onReady();
    },
    _removeSubTemplates: function(element) {
        var subElements = element.getElementsByTagName('*');
        var removeQueue = [];
        for(var i=0, n=subElements.length; i<n; i++) {
            var subElement = subElements[i];
            if(!subElement) continue;
            var templateId = subElement.getAttribute('data-ch-template');
            if(!templateId) {
                continue;
            }
            removeQueue.push(subElement);
        }

        for(var i=0, n=removeQueue.length; i<n; i++) {
            var elem = removeQueue[i];
            //var templateId = elem.getAttribute('data-ch-template');
            //console.log(JSON.stringify({log: 'remove ' + templateId}));
            elem.parentNode.removeChild(elem);
        }
    },
    _onReady: function() {
        this._ready = true;
        if(this._templates && this._waitingQueue) {
            while(true) {
                var q = this._waitingQueue.shift();
                if(!q) break;
                q.callback && q.callback(this._templates[q.id]);
            }
        }
    },

    /**
     * get template by id
     * @param {String} id
     * @param {String} callback
     *
     */
    get: function(id, callback) {
        if(this._ready) {
            var ret = this._templates[id];
            callback && callback(ret);
            return ret;
        } else {
            if(!this._waitingQueue) this._waitingQueue = [];
            this._waitingQueue.push({id: id, callback: callback});
            return undefined;
        }
    }
});}).define(function(cp) { return ({
    register: function(name, args) {
        if(!cp.Templates.instances) {
            cp.Templates.instances={};
        }
        cp.Templates.instances[name] = new cp.Templates(args);
    },
    getInstance: function(name) {
        if(!cp.Templates.instances) {
            return undefined;
        } else {
            return cp.Templates.instances[name];
        }
    },
    getTemplate: function(name, templateId, callback) {
        var instance = cp.Templates.getInstance(name);
        if(!instance) return undefined;

        return instance.get(templateId, callback);
    }
});});

