/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.util')
.define('CommonUtil', function(cp) {
    var elm = document.createElement('div');
    var getDataSet;
    if (!elm.dataset) {
        /*
        var camelize = function(str) {
            return str.replace(/-+(.)?/g, function(match, chr) {
                return chr ? chr.toUpperCase() : '';
            });
        };
        */
        var toDash = function(str) {
            return str.replace(/([A-Z])/g, function(m) { return '-'+m.toLowerCase(); });
        };
        getDataSet = function(element, name) {
            var dataName = 'data-';
            var attrs = element.attributes;
            var attrName  = dataName + toDash(name);

            var attr = attrs[attrName];
            return attr && attr.value;
        }
    } else {
        getDataSet = function(element, name) {
            return element.dataset[name];
        }
    }

    var haveClassList = !!elm.classList;

    var bind = function() {
        var args = Array.prototype.slice.call(arguments);
        var func = args.shift(), object = args.shift();
        return function() {
            return func.apply(object, args.concat(Array.prototype.slice.call(arguments)));
        };
    };
    var isValidUrl = function(url) {
        if(!url) return false;
        return !!url.match(/^(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/);
    };
    var isValidHttpUrl = function(url) {
        if(!url) return false;
        return !!url.match(/^(https?)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/);
    };

    return {
        bind: bind,
        isValidUrl: isValidUrl,
        isValidHttpUrl: isValidHttpUrl,
        haveClassList: haveClassList,
        getDataSet: getDataSet
    };
});
