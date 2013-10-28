/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.ui')
.use('tupai.ui.ViewEvents')
.use('tupai.events.Events')
.use('tupai.util.HashUtil')
.define('CachedViewEvents', function(cp) {

    var cacheKey = '__cached_events';
    var bind = function(tarElement, eventType, callback, useCapture) {
        if(!tarElement || !event || !callback) throw new Error('missing required parameters');
        var events = tarElement[cacheKey];
        if(!events) {
            tarElement[cacheKey] = events = new cp.Events();
        }
        if(events.addEventListener(eventType, callback, useCapture)) {
            return Super.bind.apply(undefined, arguments);
        }
    };

    var unbind = function(tarElement, eventType, callback) {
        if(!tarElement || !event) throw new Error('missing required parameters');
        var events = tarElement[cacheKey];
        if(!events) return;
        events.removeEventListener(eventType, callback);
        return Super.unbind.apply(undefined, arguments);
    };

    var Super = cp.HashUtil.swap(cp.ViewEvents, {
        bind: bind,
        unbind: unbind
    });
});
/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.ui')
.use('tupai.ui.ViewEvents')
.use('tupai.events.Events')
.use('tupai.util.HashUtil')
.define('CachedViewEvents', function(cp) {

    var cacheKey = '__cached_events';
    var bind = function(tarElement, eventType, callback, useCapture) {
        if(!tarElement || !event || !callback) throw new Error('missing required parameters');
        var events = tarElement[cacheKey];
        if(!events) {
            tarElement[cacheKey] = events = new cp.Events();
        }
        if(events.addEventListener(eventType, callback, useCapture)) {
            return Super.bind.apply(undefined, arguments);
        }
    };

    var unbind = function(tarElement, eventType, callback) {
        if(!tarElement || !event) throw new Error('missing required parameters');
        var events = tarElement[cacheKey];
        if(!events) return;
        events.removeEventListener(eventType, callback);
        return Super.unbind.apply(undefined, arguments);
    };

    var Super = cp.HashUtil.swap(cp.ViewEvents, {
        bind: bind,
        unbind: unbind
    });
});
