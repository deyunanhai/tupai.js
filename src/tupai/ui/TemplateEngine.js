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

    var loopChName = function(tarElement, cb) {

        if(!tarElement) throw new Error('loopChName failed. because element is undefined');
        var elements = tarElement.querySelectorAll('*[data-ch-name]');
        for (var i=0,len=elements.length; i<len; ++i) {
            var child = elements[i];
            var name = cp.CommonUtil.getDataSet(elements[i], 'chName');

            cb(name, child, tarElement);
        }
        var name = cp.CommonUtil.getDataSet(tarElement, 'chName');
        if(name) {
            cb(name, tarElement, tarElement);
        }
    };

    var bindToElement = function(tarElement, data) {

        if(!tarElement) throw new Error('bindToElement failed. because element is undefined');
        loopChName(tarElement, function(name, child) {
            var value = cp.HashUtil.getValueByName(name, data);
            setValue(child, value);
        });
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
            var rootTag = 'div';
            if(template.match(/^<(tr|th)/)) {
                rootTag = 'tbody';
            } else if(template.match(/^<(tbody|thead)/)) {
                rootTag = 'table';
            }
            var root = document.createElement(rootTag);
            root.innerHTML = template;
            var elem = root.children[0];
            bindToElement(elem, data);
            return elem;
        } else {
            return document.createElement('div');
        }
    };

    var getBindedValue = function(tarElement, data) {
        data = data || {};
        loopChName(tarElement, function(name, child) {
            var value = getValue(child);
            data[name] = value;
        });
        return data;
    };

    /**
     * set element value
     *
     */
    var setValue = function(elm, value) {
        if (elm.length !== undefined) {
            // select
            var values;
            if(value instanceof Array) {
                values = value;
            } else if(typeof value === 'object') {
                var config = value;
                var fields = config.fields;
                var html = '';
                if(fields) {
                    fields.forEach(function(f) {
                        html += '<option value="'+f.value+'">'+f.text+'</option>';
                    });
                }
                elm.innerHTML=html;
                return setValue(elm, config.value);
            } else {
                values = [value];
            }
            for(var i=0, n=elm.length; i<n; i++) {
                var selm = elm[i];
                if (values.indexOf(selm.value) != -1) {
                    selm.selected = true;
                } else {
                    selm.selected = false;
                }
            }
        } else if (elm.value !== undefined) {
            // input system
            if (/radio|checkbox/.test(elm.type)) {
                elm.checked = value;
            } else {
                elm.value = ((value===undefined)?'':value);
            }
        } else if(elm.src !== undefined) {
            if(value !== undefined) {
                elm.src = value;
            } else {
                elm.removeAttribute('src');
            }
        } else if(elm.tagName === 'A') {
            var href = value;
            if(typeof value === 'object') {
                href = value.href;
                elm.innerHTML = (value.text===undefined?'':value.text);
            }

            if(href !== undefined) {
                elm.href = href;
            } else {
                elm.removeAttribute('href');
            }
        } else {
            // other
            if(value === undefined) {
                elm.innerHTML = '';
            } else {
                elm.innerHTML = ((value===undefined)?'':value);
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
        } else if(elm.tagName === 'A') {
            return {
                href: elm.getAttribute('href'),
                value: elm.innerHTML
            }
        } else {
            return elm.innerHTML;
        }

        return null;
    };

    return {
        createElement: createElement,
        getBindedValue: getBindedValue,
        setValue: setValue,
        getValue: getValue
    };
});
