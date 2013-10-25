/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * not complete
 * */
Package('tupai.animation')
.use('tupai.util.HashUtil')
.define('Transition', function(cp) { return Package.Class.extend({
    initialize : function (options) {
        this._options = options;
    },
    getTransformation: function() {
        return {
            alpha: {
            },
            matrix: {
            }
        }
    },
    startCSSAnimation: function(view, delegate) {

        this.setupCSSAnimation(view);
        var callback = function () { cleanupOnAnimationEnd(); };
        this._element.addEventListener('webkitTransitionEnd',callback , false);
        var timerId = setTimeout(cleanupOnAnimationEnd, this.getCleanupTimeOut());

        var THIS = this;
        function cleanupOnAnimationEnd (e) {

            clearTimeout(timerId);
            view._element.removeEventListener('webkitTransitionEnd', callback, false);

            THIS.cleanupCSSAnimation(view);

            delegate &&
            delegate.didAnimationEnd &&
            delegate.didAnimationEnd(THIS);
        }
    },
    cleanupCSSAnimation: function(view) {
        view.css({
            '-webkit-transition-duration' : null,
            '-webkit-transition-property' : null,
            '-webkit-transform' : null
        });
        if(view._children.length > 1) {
            var prev = view.getChildAt(0);
            prev.clearFromParent();
        }
    },
    setupCSSAnimation: function(view) {
        view.css({
            '-webkit-transition-property' : '-webkit-transform',
            '-webkit-transition-duration':  300,
            '-webkit-transform' : 'translate3d(' + (direction === 'right2left' ? (-1 * window.innerWidth) + 'px': window.innerWidth + 'px') + ', 0, 0)' // translate3d width % does not work in android (at least with xperia). i.e translated(-100%, 30, 30);
        });
    },
    getCleanupTimeOut: function() {
        return 500;
    },
});});
