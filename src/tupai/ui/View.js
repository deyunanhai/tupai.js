/**
 * @class   tupai.ui.View
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * Requests from the model the information that it needs to generate an output representation to the user.
 *
 *
 * ### simple example
 *     var view = new cp.View();
 *     view.setValue('something');
 *
 * ### template example
 *     var view = new cp.View({
 *         template: '<div data-ch-name='data'><div>',
 *         templateParameters: {data: 'something'}
 *     });
 *     view.setValue('something');
 *
 * ### subView example
 *     var view = new cp.View({
 *         template: '<div><input data-ch-id='txt' value='hello'><div>'
 *     });
 *     var txt = view.findViewById('txt');
 *     console.log(txt.getValue()); // this will output 'hello' to console
 *
 */
Package('tupai.ui')
.use('tupai.util.CommonUtil')
.use('tupai.util.HashUtil')
.use('tupai.events.Events')
.use('tupai.ui.TemplateEngine')
.use('tupai.ui.ViewEvents')
.define('View', function(cp) { return Package.Class.extend({
    _children: undefined,
    _rendered: undefined,
    _element: undefined,
    _baseViewDelegate: undefined,
    _events: undefined,

    /**
     * initialize
     * @param {Object} [args]
     *
     * ### args:
     * - {String} [template]: the html template
     * - {Obejct} [templateParameters]: bind templateParameters to template
     *
     */
    initialize : function (args) {
        this._children = [];

        this._events = undefined;
        this._didLoadFlg = false;
        this._viewIDMap = undefined;
        this._spViews = undefined;
        this._templateEngine = cp.TemplateEngine;
        this._viewEvents = cp.ViewEvents;
        if(args) {
            this._template = args.template;
            this._templateParameters = args.templateParameters;
        }
    },

    /**
     * fire event
     * @param {String} type
     * @param {Object} parameter
     *
     * this will fire event listener of this view and parent view.
     * you can stop fire event listener by set e.stop to true.
     * also you can stop fire parent view's event listener by set e.stopParent to true.
     *
     */
    fire: function(type, parameter) {

        if(!this._events) return;

        var e = parameter || {};
        e.target = this;
        e.stopParent = false;
        this._events.fire(type, e);
        if(!e.stopParent && this._parent) this._parent.fire(name, e);
    },

    /**
     * {@link tupai.util.Events#on}
     */
    on: function() {

        if(!this._events) this._events = new cp.Events();
        this._events.on.apply(this._events, arguments);
    },

    /**
     * {@link tupai.util.Events#once}
     */
    once: function() {

        if(!this._events) this._events = new cp.Events();
        this._events.once.apply(this._events, arguments);
    },

    /**
     * {@link tupai.util.Events#addEventListener}
     */
    addEventListener: function() {

        if(!this._events) this._events = new cp.Events();
        this._events.addEventListener.apply(this._events, arguments);
    },

    /**
     * {@link tupai.util.Events#off}
     */
    off: function() {

        if(!this._events) return;
        this._events.off.apply(this._events, arguments);
    },

    /**
     * {@link tupai.util.Events#removeEventListener}
     */
    removeEventListener: function() {
        if(!this._events) return;
        this._events.removeEventListener.apply(this._events, arguments);
    },

    /**
     * set view delegate
     * @param {Object} delegate
     *
     * ### support delegate callbacks
     * -  viewDidLoad(view);
     * -  viewDidUnload(view);
     * -  viewDidShow(view);
     * -  viewDidHide(view);
     */
    setDelegate: function(delegate) {
        this._baseViewDelegate = delegate;
    },

    /*
    markNeedRender: function() {
        for(var i=0,n=this._children.length;i<n;i++) {
            var child = this._children[i];
            child.markNeedRender();
        }
        this._rendered = false;
    },
    */

    iterateChildren: function(callback) {
        for(var i=0,n=this._children.length;i<n;i++) {
            var child = this._children[i];
            callback(child);
        };
    },

    /**
     * take this view tree to screen
     * @param {Object} args
     *
     */
    render: function (args) {

        if(!this._rendered) {
            if(!this._parent) { throw new Error('no parent.');}
            this._parent.render(args);
        }

        this._onChildrenRender(args);
    },

    _onHTMLRender: function(parentNode, args) {

        if(this._rendered) return false;

        this._checkElement();
        if(this.willRender) {
            this.willRender();
        }
        if(!this._parentAdded) {
            parentNode.appendChild(this._element);
            this._parentAdded = true;
            this.bindEvents(this._baseViewDelegate);
        }

        this._didRender();

        return true;
    },

    _didRender: function() {
        this._rendered = true;
        if(this.didRender) {
            this.didRender();
        }
        if(this._baseViewDelegate && this._baseViewDelegate.viewDidRender) {
            this._baseViewDelegate.viewDidRender(this);
        }
        this.fire('didRender');
    },

    _didLoad: function() {
        if(this.didLoad) {
            this.didLoad();
        }
        if(this._baseViewDelegate && this._baseViewDelegate.viewDidLoad) {
            this._baseViewDelegate.viewDidLoad(this);
        }
        this.fire('didLoad');
        this._didLoadFlg = true;
    },

    _onChildrenRender: function(args) {

        var containerNode = this._element;
        var renderView = function(child) {
            if(!child) return;
            var firsttime = child._onHTMLRender(containerNode, args);
            child._onChildrenRender(args);
            if(firsttime) {
                child._didLoad();
            }
        };
        for(var i=0,n=this._children.length;i<n;i++) {
            var child = this._children[i];
            renderView(child);
        };
        if(this._viewIDMap) {
            for(var id in this._viewIDMap) {
                renderView(this._viewIDMap[id]);
            }
        }
        if(this._spViews) {
            for(var i=0, n=this._spViews.length; i<n; i++) {
                renderView(this._spViews[i]);
            }
        }
    },

    /**
     * get html template call by render.
     * you can ovveride this method to return custom template of View.
     *
     */
    getTemplate: function() {

        if(typeof this._template === 'function') {
            return this._template();
        } else {
            return this._template;
        }
    },

    /**
     * get template parameter.
     * this template parameter will bind to template.
     * you can ovveride this method to return custom template parameter.
     *
     */
    getTemplateParameters: function() {

        if(typeof this._templateParameters === 'function') {
            return this._templateParameters();
        } else {
            return this._templateParameters;
        }
    },
    _createViewIDMap: function() {
        if(this._viewIDMap) return;

        var createView = function(elm) {
            var viewClsNm = cp.CommonUtil.getDataSet(elements[i], 'chView');
            var view;
            if(viewClsNm) {
                var cls = Package.Class.forName(viewClsNm);
                view = new cls();
            } else {
                view = new cp.View();
            }
            view._element = elm;
            view._parent = this;
            view._parentAdded = true;
            return view;
        };

        var viewIDMap = {};
        var elements = this._element.querySelectorAll('*[data-ch-id]');
        for (var i=0,len=elements.length; i<len; ++i) {
            var elm = elements[i];
            var id = cp.CommonUtil.getDataSet(elements[i], 'chId');
            if(!id) continue;
            viewIDMap[id] = createView(elm);
        }

        var arr = [];
        var elements = this._element.querySelectorAll('*[data-ch-view]');
        for (var i=0,len=elements.length; i<len; ++i) {
            var elm = elements[i];
            var id = cp.CommonUtil.getDataSet(elements[i], 'chId');
            if(id) continue;
            arr.push(createView(elm));
        }

        this._viewIDMap = viewIDMap;
        this._spViews = (arr.length>0?arr:undefined);
    },
    _checkElement: function() {
        if(this._element) return;

        var template = this.getTemplate();
        var data = this.getTemplateParameters();
        this._element = this._templateEngine.createElement(undefined, template, data);
        if(!this._element) throw new Error('cannot create element');

        this._createViewIDMap();
    },

    /**
     * set template's parameters.
     * see {@link tupai.ui.TemplateEngine#createElement}
     *
     */
    setTemplateParameters: function(parameters) {
        this._templateParameters = parameters;
        if(this._element) {
            var template = this.getTemplate();
            var data = this.getTemplateParameters();
            this._element = this._templateEngine.createElement(this._element, template, data);
        }
    },

    /**
     * see {@link tupai.ui.View#setTemplateParameters}
     *
     */
    setData: function(data) {
        this.setTemplateParameters(data);
    },

    /**
     * see {@link tupai.ui.View#getTemplateParameters}
     * ovveride this method has no effect
     *
     */
    getData: function() {
        var data = this.getTemplateParameters();
        if(this._element) {
            return this._templateEngine.getBindedValue(this._element, data);
        } else {
            return data;
        }
    },

    /**
     * set view's value.
     * see {@link tupai.ui.TemplateEngine#setValue}
     *
     */
    setValue: function(val) {
        this._checkElement();
        return this._templateEngine.setValue(this._element, val);
    },

    /**
     * get view's value.
     * see {@link tupai.ui.TemplateEngine#getValue}
     *
     */
    getValue: function() {
        this._checkElement();
        return this._templateEngine.getValue(this._element);
    },

    /**
     * add sub view
     * @param {tupai.ui.View} subView
     *
     */
    addSubView: function(subView) {

        this._children.push(subView);
        subView._parent = this;
        if (typeof subView.onAppendedToParent === 'function') {
            subView.onAppendedToParent();
        }
    },

    /**
     * get child by index
     * @param {Number} index
     * @return {tupai.ui.View}
     *
     */
    getChildAt: function(index) {
        if(index <0 || index >= this._children.length) return null;
        else return this._children[index];
    },

    /**
     * find view by id (set by data-ch-id)
     * @param {String} id
     * @return {tupai.ui.View}
     *
     */
    findViewById: function(id) {

        this._checkElement();
        return (this._viewIDMap && this._viewIDMap[id]);
    },

    /**
     * get children size
     * @return {Number}
     *
     */
    getChildrenSize: function() {
        return this._children.length;
    },

    /**
     * clear all children
     *
     */
    clearChildren: function() {

        if(this._viewIDMap) {
            for(var id in this._viewIDMap) {
                var child = this._viewIDMap[id];
                child.clearChildren();
                this._removeChild(child);
            }
            this._viewIDMap = {};

            if(this._spViews) {
                for(var i=0, n=this._spViews.length; i<n; i++) {
                    var child = this._spViews[i];
                    child.clearChildren();
                    this._removeChild(child);
                }
                this._spViews = undefined;
            }
        }
        return this.clearChildrenByRange(0);
    },

    /**
     * clear children
     * @param {Number} [from=0]
     * @param {Number} [to=size of children]
     *
     */
    clearChildrenByRange: function(from, to) {

        var len = this._children.length;
        if(len == 0 || from >= len || to < 0) return true;

        if(from == undefined || from < 0 ) from = 0;
        if(to   == undefined || to >= len) to = len-1;

        if(from > len) return false;
        for(var i=0, n=to-from;i<=n;i++) {
            this._children[from].clearChildren();
            this.removeChildAt(from);
        }

        // do this in removeChildAt
        //this._children = this._children.slice(0, from).concat(this._children.slice(to+1));
        return true;
    },

    /**
     * remove this view from parent and clear children
     *
     */
    clearFromParent: function() {

        this.clearChildren();
        this.removeFromParent();
    },

    /**
     * remove this view from parent only, don't clear children
     *
     */
    removeFromParent: function() {

        if(!this._parent) return false;
        return this._parent.removeChild(this);
    },

    /**
     * remove child
     * @param {tupai.ui.View} child the child will be remove.
     * @return {tupai.ui.View} view removed
     *
     */
    removeChild: function(child) {

        if(!child) return child;

        var index = this._children.indexOf(child);
        if(index < 0) {
            for(var id in this._viewIDMap) {
                if(this._viewIDMap[id] === child) {
                    this._removeChild(child);
                    delete this._viewIDMap[id];
                    return child;
                }
            }
            if(this._spViews) {
                for(var i=0, n=this._spViews.length; i<n; i++) {
                    if(child === this._spViews[i]) {
                        this._removeChild(child);
                        delete this._spViews[i];
                        return child;
                    }
                }
            }
            return null;
        } else {
            return this.removeChildAt(this._children.indexOf(child));
        }
    },

    /**
     * remove child by index
     * @param {Number} index
     * @return {tupai.ui.View} view removed
     *
     */
    removeChildAt: function(index) {

        var n = this._children.length;
        if(index < 0 || index >= n.length) return null;

        var child = this._children.splice(index, 1);
        if(!child || !child.length) return null;

        child = child[0];
        this._removeChild(child);

        return child;
    },

    _removeChild: function(child) {
        child._parent = null;
        child._rendered = false;
        child._events = null;
        if(!child._element) {
            return;
        }
        if(child._element.parentNode) {
            child._element.parentNode.removeChild(child._element);
        } else {
            //allready removed from dom.
        }
        if(child.didUnload) {
            child.didUnload();
        }
        if(child._baseViewDelegate && child._baseViewDelegate.viewDidUnload) {
            child._baseViewDelegate.viewDidUnload(child);
        }
        child.fire('didUnload');
    },

    /**
     * set style value
     * @param {String} key
     * @param {String} value
     * @return {tupai.ui.View} this view
     *
     */
    setStyle: function(key, value) {
        this._checkElement();
        if (this._isInteger(value) && cp.View.cssNumber[key]) {
            value = value + 'px';
        }
        this._element.style[key] = value;
        return this;
    },

    /**
     * get style value
     * @param {String} key
     * @return {String} value
     *
     */
    getStyle: function(key) {
        this._checkElement();
        return window.getComputedStyle(this._element).getPropertyValue(key);
    },

    /**
     * get attribute value
     * @param {String} key
     * @return {String} value
     *
     */
    getAttribute: function(key) {
        this._checkElement();
        return this._element.getAttribute(key);
    },

    /**
     * set attribute value
     * @param {String} key
     * @param {String} value
     * @return {tupai.ui.View} this view
     *
     */
    setAttribute: function(key, value) {
        this._checkElement();
        this._element.setAttribute(key, value);
        return this;
    },

    /**
     * remove attribute value
     * @param {String} key
     * @return {tupai.ui.View} this view
     *
     */
    removeAttribute: function(key) {
        this._checkElement();
        this._element.removeAttribute(key);
        return this;
    },

    attr: function(first, second) {
        if (second === undefined) {
            console.error('attr function is Deprecated, use getAttribute instead');
            return this._element.getAttribute(first);
        } else {
            console.error('attr function is Deprecated, use setAttribute instead');
            this._element.setAttribute(first, second);
            return this;
        }
    },

    /**
     * add class to element
     * @param {String} name
     * @return {tupai.ui.View} this view
     *
     */
    addClass: function(name) {
        this._checkElement();

        this._element.classList.add(name);
        return this;
    },

    /**
     * remove class from element
     * @param {String} name
     * @return {String} the class name removed
     *
     */
    removeClass: function(name) {
        return this._element.classList.remove(name);
    },

    /**
     * detection class name has been added
     * @param {String} name
     * @return {Boolean}
     *
     */
    hasClass: function(name) {
        return this._element.classList.contains(name);
    },

    /**
     * bind event to element and children
     * <div>
     *     <button data-ch-click="didClickButton">click me!<button>
     * </div>
     * see {@link tupai.ui.ViewEvents#bind}
     * @param {String} event
     * @param {Function} callback
     * @param {Boolean} useCapture
     *
     */
    bindEvents: function(delegate) {
        if(!delegate) return;

        this._checkElement();
        var elements = this._element.querySelectorAll('*[data-ch-click]');
        for (var i=0,len=elements.length; i<len; ++i) {
            var elm = elements[i];
            var click = cp.CommonUtil.getDataSet(elements[i], 'chClick');
            var fn = this._parseFn(click);
            if(!fn) {
                throw new Error('can\'t parse click event. ' + click);
            }
            fn.args.push(elm);
            this._bindEventToFn(elm, 'click', fn, delegate);
        }
    },

    _bindEventToFn: function(elm, type, fnObj, delegate) {

        var fn = delegate[fnObj.name];
        if(typeof fn !== 'function') {
            throw new Error('can\'t find function ' + fnObj.name + ' in baseViewDelegate.');
        }
        this._viewEvents.bind(elm, type, function() {
            fn.apply(delegate, fnObj.args);
        });
    },

    _parseFn: function(str) {

        str = cp.CommonUtil.trim(str);
        var matchs = str.match(/^(\w+)([(]?)([^()]*)([)]?)$/);
        if(!matchs) return undefined;
        if(!matchs[1] ||
           (matchs[2] && !matchs[4]) ||
           (!matchs[2] && matchs[4])
          ) return undefined;

        var fnName = matchs[1];
        var params = cp.CommonUtil.trim(matchs[3]);
        var args=[];
        var checkers = [
            function(s) {
                var m = s.match(/^['"]{1}(.*)['"]{1}$/);
                if(!m) return;
                args.push(m[1]);
                return true;
            },
            function(s) {
                var i = parseFloat(s);
                if(!Number.isNaN(i)) {
                    args.push(i);
                    return true;
                }
            }
        ];

        if(params) {
            params = params.split(',');
            for(var i=0, n=params.length; i<n; i++) {
                //check params
                var p = cp.CommonUtil.trim(params[i]);
                var m=false;
                for(var j=0, jn=checkers.length; j<jn; j++) {
                    var c = checkers[j];
                    if(c(p)) {
                        m=true;
                        break;
                    }
                }
                if(!m) {
                    throw new Error('can\'t parse parameter ' + p);
                }
            }
        }

        return {
            name: fnName,
            args: args
        };
    },

    /**
     * bind event to element
     * see {@link tupai.ui.ViewEvents#bind}
     * @param {String} event
     * @param {Function} callback
     * @param {Boolean} useCapture
     *
     */
    bind: function(event, callback, useCapture) {
        this._checkElement();
        this._viewEvents.bind(this._element, event, callback, useCapture);
    },

    /**
     * unbind event to element
     * see {@link tupai.ui.ViewEvents#unbind}
     * @param {String} event
     * @param {Function} callback
     *
     */
    unbind: function(event, callback) {
        if(!this._element) return;
        this._viewEvents.unbind(this._element, event, callback);
    },

    /**
     * get view' status
     * @return {String} view status
     * ### status
     * - unrendered
     * - uninitialized
     * - initialized
     *
     */
    getViewStatus: function() {
        if(!this._rendered) return 'unrendered';
        if(!this._parent) return 'uninitialized';
        return 'initialized';
    },

    /**
     * hide this view
     *
     */
    hide: function() {
        this._checkElement();
        if(this.getStyle('display') === 'none') return;
        this.setStyle('display', 'none');
        this.fire('hide');
        if(this._baseViewDelegate && this._baseViewDelegate.viewDidHide) {
            this._baseViewDelegate.viewDidHide(this);
        }
    },

    /**
     * return true if visible, return false otherwise.
     *
     */
    visible: function() {
        var d = this.getStyle('display');
        return d !== 'none';
    },

    /**
     * show this view
     *
     */
    show: function() {
        this._checkElement();

        if(this.getStyle('display') === 'block') return;
        this.setStyle('display', null);
        this.fire('show');
        if(this._baseViewDelegate && this._baseViewDelegate.viewDidShow) {
            this._baseViewDelegate.viewDidShow(this);
        }
    },

    /**
     * show this view if invisible, hide this view otherwise.
     *
     */
    toggle : function () {
        if (this.getStyle('display') === 'block') {
            this.hide();
            return 'hide';
        } else {
            this.show();
            return 'show';
        }
    },

    html: function(str) {
        this._checkElement();
        if (str === undefined) {
            return this._element.innerHTML;
        }
        else {
            this._element.innerHTML = str;
            return this;
        }
        return this._element.innerHTML;
    },

    getTagName: function() {
        this._checkElement();
        return this._element.tagName;
    },

    _isInteger: function(value) {

        if(value == undefined) return 0;
        return (parseInt(value, 10).toString() === value.toString()) ? 1 : 0;
    },

    // not complete
    startAnimation: function() {
        var currentStyle = {};

        var childrenLength = container._children.length;
        container.addSubView(view);
        view.render();

        var THIS = this;
        startCSSAnimation(container, tarView, {
            didAnimationEnd: function() {
                if (THIS._animating === false) { return; }

                if(container._children.length > 1) {
                    var prev = container.getChildAt(0);
                    prev.clearFromParent();
                }

                THIS.render();
                THIS._animating = false;
                finish && finish();
            }
        });
    },

    // not complete
    animate : function (view, container, direction, finish) {
    }

});}).define(function(cp) {

    cp.View.cssNumber = {
        'width': true,
        'height': true,
        'top': true,
        'left': true,
        'columnCount': true,
        'fillOpacity': true,
        'fontWeight': true,
        'lineHeight': true,
        'opacity': true,
        'orphans': true,
        'widows': true,
        'zIndex': true,
        'zoom': true
    };

    (function(properties) {
        var createProperty = function(name, methodName) {
            cp.View.prototype['get'+methodName] = function() {
                return this.getStyle(name);
            }
            cp.View.prototype['set'+methodName] = function(value) {
                this.setStyle(name, value)
            }
        }
        for(var i=0, n=properties.length; i<n; i++) {
            var property = properties[i];
            var methodName = property.charAt(0).toUpperCase() + property.slice(1);
            createProperty(property, methodName);
        }
    })([
        'height',
        'width',
        'top',
        'left'
    ]);

    if (!cp.CommonUtil.haveClassList) {
        cp.View.prototype.addClass = function(name) {
            this._checkElement();

            var nowName = this.attr('class');
            var newName = null;

            if (!nowName) {
                newName = name;
            } else {
                var res = nowName.split(' ');
                res[res.length] = name;
                newName = res.join(' ');
            }
            this.attr('class', newName);

            return this;
        };
        cp.View.prototype.removeClass = function(name) {
            this._checkElement();

            var nowName = this.attr('class');
            if (nowName) {
                if(nowName.indexOf(name) < 0) return this;

                var list = nowName.split(' ');
                var pos = list.indexOf(name);
                if(pos >=0) {
                    newName = list.splice(0, pos).join(' ');
                    if(list.length > 1) newName += ' ' + list.splice(1).join('');
                    this.attr('class', newName);
                }
            }

            return this;
        };
        cp.View.prototype.hasClass = function(name) {
            var nowName = this.attr('class');
            if (!nowName) {
                return false
            } else {
                return (' ' + nowName + ' ').indexOf(' ' + name + ' ') > -1;
            }
        };
    }
    return undefined;
});

