/**
 * @class   tupai.util.UserAgent
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * help you to get userAgent easy
 *
 */
Package('tupai.util')
.define('UserAgent', function(cp) {

    var inited = false, ie, firefox, opera, safari, chrome, android, iphone, ipad, mobile, device;
    function init() {
        if (inited) return;
        inited = true;

        var userAgent = navigator.userAgent;
        var pattern = /(?:MSIE.(\d+\.\d+))|(?:(?:Firefox|GranParadiso|Iceweasel).(\d+\.\d+))|(?:Opera(?:.+Version.|.)(\d+\.\d+))|(?:AppleWebKit.(\d+(?:\.\d+)?))/.exec(userAgent)
        iphone = /\b(iPhone|iP[ao]d)/.exec(userAgent);
        if(iphone) {
            var m = userAgent.match(/OS ([_\d\.]+)/);
            if(m && m.length > 1) {
                iphone = parseFloat(m[1].split('_').join('.'));
            } else iphone = 1;
        }
        ipad = /\b(iP[ao]d)/.exec(userAgent);
        android = /Android (\d+(?:\.\d+)+)(-\w+)?;/i.exec(userAgent);
        mobile = /Mobile/i.exec(userAgent);

        android = android && parseFloat(android[1]);
        if(android) {
            device = /Android (\d+(?:\.\d+)+)(-\w+)?; (\w{2,3})\-(\w{2,3});\s([^\/]+)\sBuild/i.exec(userAgent);
            if(device) device = device[5];
        }

        if (pattern) {
            ie = pattern[1] ? parseFloat(pattern[1]) : NaN;
            if (ie && document.documentMode) ie = document.documentMode;

            firefox = pattern[2] ? parseFloat(pattern[2]) : NaN;
            opera = pattern[3] ? parseFloat(pattern[3]) : NaN;
            safari = pattern[4] ? parseFloat(pattern[4]) : NaN;
            if (safari) {
                pattern = /(?:Chrome\/(\d+\.\d+))/.exec(userAgent);
                chrome = pattern && pattern[1] ? parseFloat(pattern[1]) : NaN;
            } else {
                chrome = NaN;
            }
        } else {
            ie = firefox = opera = chrome = safari = NaN;
        }
    }
    return {

        /**
         * get ie version
         * @return {Number} return browser version if is ie
         *
         */
        ie: function() {
            return init() || ie;
        },

        /**
         * get firefox version
         * @return {Number} return browser version if is firefox
         *
         */
        firefox: function() {
            return init() || firefox;
        },

        /**
         * get opera version
         * @return {Number} return browser version if is opera
         *
         */
        opera: function() {
            return init() || opera;
        },

        /**
         * get safari version
         * @return {Number} return browser version if is safari
         *
         */
        safari: function() {
            return init() || safari;
        },

        /**
         * get chrome version
         * @return {Number} return browser version if is chrome
         *
         */
        chrome: function() {
            return init() || chrome;
        },

        /**
         * get iphone browser version
         * @return {Number} return browser version if is iphone browser
         *
         */
        iphone: function() {
            return init() || iphone;
        },

        /**
         * get mobile browser version
         * @return {Number} return browser version if is iphone or ipad or android browser version
         *
         */
        mobile: function() {
            return init() || (iphone || ipad || android || mobile);
        },

        /**
         * get android browser version
         * @return {Number} return browser version if is android browser
         *
         */
        android: function() {
            return init() || android;
        },

        /**
         * get device name. support android only.
         * @return {String} return device name like SC-06D
         *
         */
        device: function() {
            return init() || device;
        },

        /**
         * get ipad browser version
         * @return {Number} return browser version if is ipad browser
         *
         */
        ipad: function() {
            return init() || ipad;
        }
    };
});
