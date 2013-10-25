/**
 * @class   tupai.ui.TemplateEngine
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * Create element by template and bindingData
 *
 * you can make a plugin by override the methods
 * also you can override the all of methods or some of it.
 *
 * ### plugin example
 *     Package('plugin')
 *     .use('tupai.ui.TemplateEngine')
 *     .use('tupai.util.HashUtil')
 *     .define('TemplateEnginePlugin', function(cp) {
 *         var createElement = function(element, template, data) {
 *             console.log('createElement');
 *             return Super.createElement.apply(undefine, arguments);
 *         };
 *
 *         var setValue = function(element, value) {
 *             console.log('setValue');
 *             return Super.setValue.apply(undefine, arguments);
 *         };
 *
 *         var getValue = function(element) {
 *             console.log('getValue');
 *             return Super.getValue.apply(undefine, arguments);
 *         };
 *
 *         var Super = cp.HashUtil.swap(cp.TemplateEngine, {
 *             createElement: createElement,
 *             setValue: setValue,
 *             getValue: getValue
 *         })
 *     });
 *
 */
Package('tupai.ui')
.use('tupai.util.CommonUtil')
.use('tupai.util.HashUtil')
.define('TemplateEngine', function(cp) {

    var bindToElement = function(tarElement, data) {
        var elements = tarElement.querySelectorAll('*[data-ch-name]');
        for (var i=0,len=elements.length; i<len; ++i) {
            var elm = elements[i];
            var name = cp.CommonUtil.getDataSet(elements[i], 'chName');

            var value = cp.HashUtil.getValueByName(name, data);
            setValue(elm, value);
        }
        var name = cp.CommonUtil.getDataSet(tarElement, 'chName');
        if(name) {
            var value = cp.HashUtil.getValueByName(name, data);
            setValue(tarElement, value);
        }
    };

    /**
     * create element
     *
     */
    var createElement = function(element, template, data) {
        if(element) {
            bindToElement(element, data);
            return element;
        } else if(template) {
            var root = document.createElement('div');
            root.innerHTML = template;
            var elem = root.children[0];
            bindToElement(elem, data);
            return elem;
        } else {
            return document.createElement('div');
        }
    };

    /**
     * set element value
     *
     */
    var setValue = function(elm, value) {
        if (elm.length) {
            // select
            var values = (value instanceof Array) ? value : [value];
            Array.prototype.forEach.call(elm, function(elm) {
                if (values.indexOf(elm.value) != -1) {
                    elm.selected = true;
                } else {
                    elm.selected = false;
                }
            });
        } else if (elm.value !== undefined) {
            // input system
            if (/radio|checkbox/.test(elm.type)) {
                elm.checked = value;
            }
            else {
                elm.value = value;
            }
        } else if(elm.src !== undefined) {
            elm.src = value;
        } else {
            // other
            if(value === undefined) {
                elm.innerHTML = '';
            } else {
                elm.innerHTML = value;
            }
        }
    };

    /**
     * get element value
     *
     */
    var getValue = function(elm) {
        if(!elm) return null;

        if (elm.length) {
            if(elm.getAttribute('multiple')) {
                var ret=[];
                Array.prototype.forEach.call(elm, function(elm) {
                    if(elm.selected) {
                        ret.push(elm.value);
                    }
                });
                return ret;
            } else {
                return elm.value;
            }
        } else if (elm.value !== undefined) {
            // input system
            if (/radio|checkbox/.test(elm.type)) {
                return elm.checked;
            }
            else {
                return elm.value;
            }
        } else if (elm.src !== undefined) {
            return elm.src;
        } else {
            return elm.innerHTML;
        }

        return null;
    };

    return {
        createElement: createElement,
        setValue: setValue,
        getValue: getValue
    };
});
