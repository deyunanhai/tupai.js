/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.util')
.define('CommonUtil', function(cp) {
    var elm = document.createElement('div');
    var getDataSet, getDataSets;
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
        var toCamel = function(str) {
            var tokens = str.split('-');
            for(var i=1, n=tokens.length; i<n; i++) {
                var s = tokens[i];
                if(!s[0]) continue;
                tokens[i] = s[0].toUpperCase()+s.substring(1);
            }
            return tokens.join('');
        };
        getDataSet = function(element, name) {
            var dataName = 'data-';
            var attrs = element.attributes;
            var attrName  = dataName + toDash(name);

            var attr = attrs[attrName];
            return attr && attr.value;
        };
        getDataSets = function(element, matchName) {
            var attrs = element.attributes;
            var datasets = {};
            var regexp;
            if(matchName) {
                regexp = new RegExp(matchName);
            }
            for(var i=0, n=attrs.length; i<n; i++) {
                var attr = attrs[i];
                var name = attr.name;
                if(/^data-/.test(name)) {
                    var attrName  = toCamel(name.substring(5));
                    if(regexp && !regexp.test(attrName)) continue;
                    datasets[attrName] = attr.value;
                }
            }
            return datasets;
        };
    } else {
        getDataSet = function(element, name) {
            return element.dataset[name];
        };
        getDataSets = function(element, matchName) {

            if(!matchName) {
                return element.dataset;
            }
            var ret = {};
            var datasets = element.dataset;
            var regexp = new RegExp(matchName);
            for(var name in datasets) {
                if(!regexp.test(name)) continue;
                ret[name] = datasets[name];
            }
            return ret;
        };
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

    var trim;
    if(String.prototype.trim) {
        trim = function(s) {
            return s.trim();
        };
    } else {
        trim = function(s) {
            return s.replace(/(^\s+)|(\s+$)/g, "");
        };
    }

    return {
        bind: bind,
        isValidUrl: isValidUrl,
        isValidHttpUrl: isValidHttpUrl,
        haveClassList: haveClassList,
        trim: trim,
        getDataSets: getDataSets,
        getDataSet: getDataSet
    };
});
