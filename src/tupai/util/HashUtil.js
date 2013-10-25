/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.util')
.define('HashUtil', function(cp) { return {

    merge: function (dest, src) {
        if(!src) return dest;
        dest = dest || {};
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                dest[key] = src[key];
            }
        }
        return dest;
    },

    equals: function(o1, o2) {

        if(o1 == o2) return true;
        if(!o1 || !o2) return false;

        for (key in o1) {
            if(o1[key] != o2[key]) return false;
        }
        for (key in o2) {
            if(o1[key] != o2[key]) return false;
        }
        return true;
    },
    clone: function(obj) {
        var newObj = {};
        if(obj) {
            for(var name in obj) {
                newObj[name] = obj[name];
            }
        }
        return newObj;
    },
    getValueByName: function(pattern, data) {
        if(!data) return undefined;
        names = pattern.split('.');
        var d = data;
        var name;
        for(var i=0, n=names.length; i<n; i++) {
            var name = names[i];
            d = d[name];
            if(!d) return d;
        }
        return d;
    },
    only: function(funcName, source, keys) {

        if(!source) return false;
        var ret = true;
        for(var key in source) {
            if(keys.indexOf(key) < 0) {
                ret = false;
                console.error(key + ' is unknown parameter in ' + funcName);
            }
        }
        return ret;
    },
    swap: function(dst, src) {
        var n = arguments.length;
        if(!dst || !src) return;

        var old={};
        for(var name in src) {
            old[name] = dst[name];
            dst[name] = src[name];
        }
        return old;
    },
    require: function(source, keys) {

        if(!source) throw new Error('missing required parameter.');
        for(var i=0, n=keys.length; i<n; i++) {
            var key = keys[i];
            if (source[key] == null) {
                throw new Error('key :' + key +' required.');
            }
        }
    }
};});
