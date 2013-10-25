/**
 * @class   tupai.ui.ViewEvents
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * bind and unbind HTML events
 * you can make a plugin by override the methods
 * also you can override the all of methods or some of it.
 *
 * ### plugin example
 *     Package('plugin')
 *     .use('tupai.ui.ViewEvents')
 *     .use('tupai.util.HashUtil')
 *     .define('ViewEventsPlugin', function(cp) {
 *         var bind = function(tarElement, event, callback, useCapture) {
 *             console.log('bind');
 *             return Super.bind.apply(undefine, arguments);
 *         };
 *
 *         var unbind = function(tarElement, event, callback) {
 *             console.log('unbind');
 *             return Super.unbind.apply(undefine, arguments);
 *         };
 *
 *         var Super = cp.HashUtil.swap(cp.ViewEvents, {
 *             bind: bind,
 *             unbind: unbind
 *         })
 *     });
 *
 */
Package('tupai.ui')
.define('ViewEvents', function(cp) {

    /**
     * bind event to element
     * @param {String} event
     * @param {Function} callback
     * @param {Boolean} useCapture
     *
     */
    var bind = function(tarElement, event, callback, useCapture) {
        if(!tarElement || !event || !callback) throw new Error('missing required parameters');
        return tarElement.addEventListener(event, callback, useCapture);
    };

    /**
     * unbind event to element
     * @param {String} event
     * @param {Function} callback
     *
     */
    var unbind = function(tarElement, event, callback) {
        if(!tarElement || !event || !callback) throw new Error('missing required parameters');
        return tarElement.removeEventListener(event, callback);
    };

    return {
        bind: bind,
        unbind: unbind
    };
});
