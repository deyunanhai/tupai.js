/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.util')
.define('HttpUtil', function(cp) {

    function parseOptionsFromQueryString(paramsStr, options) {

        if(!paramsStr) return options;
        var pairs = paramsStr.split('&');
        options = options || {};
        for(var i=0, n=pairs.length; i<n; i++) {
            var c = pairs[i].split('=');
            options[c[0]] = decodeURIComponent(c[1]);
        }
        return options;
    }
    function createQueryString(options) {

        var qs = '';
        if(typeof options !== 'object') return qs;
        for(var name in options) {
            var val = options[name];
            qs += '&' + name + '=' + encodeURIComponent(val);
        }
        if(qs.length > 0) qs = qs.substring(1);
        return qs;
    }
    function parseOptionsFromUrl(url) {

        if(typeof url !== 'string') return;
        var pos = url.indexOf('#');
        if(pos >= 0) url = url.substring(0, pos);

        var options = {};
        matches = url.match(/^(.*)\?(.*)$/);
        if(matches) {
            url = matches[1];
            var params = matches[2];
            options = parseOptionsFromQueryString(params, options);
        }
        return {
            url: url,
            options: options
        };
    }

    function createRequester() {
        var xhr;
        try { xhr = new XMLHttpRequest(); } catch(e) {
            try { xhr = new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {
                try { xhr = new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {
                    try { xhr = new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {
                        try { xhr = new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {
                            throw new Error( 'This browser does not support XMLHttpRequest.' );
                        }
                    }
                }
            }
        }
        return xhr;
    }

    function encode(obj) {
        var set = [], key;

        for ( key in obj ) {
            var val = obj[key];
            if(val === undefined) continue;
            set.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }

        return set.join('&');
    }

    function encodeJson(obj) {

        if( typeof obj === 'object' && obj !== null ) {
            var d;
            if (obj instanceof Array) {
                d = [];
                for(var i=0,n=obj.length;i<n;i++) {
                    d.push(encodeJson(obj[i]));
                }
            } else {
                d = {};
                for ( var key in obj ) {
                    d[key] = encodeJson(obj[key]);
                }
            }
            return d;
        } else {
            if(!obj) return obj;
            else return encodeURIComponent(obj);
        }
    }

    function doAjax(url, success, error, options) {
        var xhr = createRequester(),
            options = options || {},
            success = success || function() {},
            error = error || function() {},
            method = options.method || 'GET',
            header = options.header || {},
            ctype = options.ctype || (( method === 'POST' ) ? 'application/x-www-form-urlencoded' : ''),
            data = options.data || '',
            key;

        xhr.onreadystatechange = function() {
            if ( xhr.readyState === 4 ) {
                if ( (xhr.status >= 200 && xhr.status < 300) || xhr.status == 0 ) {
                    success(xhr.responseText, xhr);
                } else {
                    error(xhr);
                }
            }
        };

        if ( typeof data === 'object' ) {
            if(options.type === 'json') {
                data = JSON.stringify(encodeJson(data));
            } else {
                data = encode(data);
            }
        }

        //console.log(method + ' ' + url + ' -- ' + data);
        xhr.open(method, url, true);

        if ( ctype ) {
            xhr.setRequestHeader('Content-Type', ctype);
        }

        for ( key in header ) {
            xhr.setRequestHeader(key, header[key]);
        }

        //console.log(method + ' ' + url + ' -- ' + data);
        xhr.send(data);

        return xhr;
    }

    var loadFlg = false;
    var ajaxQueue = [];
    var onLoadFunc = function() {
        setTimeout(function(){
            loadFlg = true;
            var item;
            while((item=ajaxQueue.shift())) {
                doAjax.apply(this, item.param);
            }
        },10);
    }
    if(window.addEventListener) {
        window.addEventListener('load', onLoadFunc, false);
    } else {
        window.attachEvent('onload', onLoadFunc);
    }

    function doAfterLoad(param) {
        if(!loadFlg) ajaxQueue.push({param: param});
        else doAjax.apply(this, param);
    }

    return {
        encode: encode,
        parseOptionsFromQueryString: parseOptionsFromQueryString,
        parseOptionsFromUrl: parseOptionsFromUrl,
        createQueryString: createQueryString,
        ajax: function(url, success, error, options) {
            doAfterLoad([url, success, error, options]);
        }
    };
});
