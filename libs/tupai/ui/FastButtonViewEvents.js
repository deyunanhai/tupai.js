/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.ui')
.use('tupai.util.FastButton')
.use('tupai.ui.ViewEvents')
.use('tupai.util.HashUtil')
.define('FastButtonViewEvents', function(cp) {

    var bind = function(tarElement, event, callback, useCapture) {
        if(event === 'click') {
            cp.FastButton.bind(tarElement, callback);
        } else {
            return Super.bind.apply(undefined, arguments);
        }
    };

    var unbind = function(tarElement, event, callback) {
        if(event === 'click') {
            cp.FastButton.unbind(tarElement);
        } else {
            return Super.unbind.apply(undefined, arguments);
        }
    };

    var Super = cp.HashUtil.swap(cp.ViewEvents, {
        bind: bind,
        unbind: unbind
    });
});
