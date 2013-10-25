/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * not complete
 * */
Package('tupai.animation')
.use('tupai.util.HashUtil')
.define('TransitAnimation', function(cp) { return Package.Class.extend({
    initialize : function (options) {
        this._options = options;
    },
    startCSSAnimation: function(container, tarView, delegate) {

        if(this._animating) {
            return;
        }
        this._animating = true;

        var options = {};
        this.setupCSSAnimation(container, tarView, options);
        var callback = function () { cleanupOnAnimationEnd(); };
        container._element.addEventListener('webkitTransitionEnd',callback , false);
        var timerId = setTimeout(cleanupOnAnimationEnd, this.getCleanupTimeOut());

        var THIS = this;
        function cleanupOnAnimationEnd (e) {

            clearTimeout(timerId);
            container._element.removeEventListener('webkitTransitionEnd', callback, false);

            THIS.cleanupCSSAnimation(container, tarView, options);

            delegate &&
            delegate.didAnimationEnd &&
            delegate.didAnimationEnd(THIS);
        }
    },
    cleanupCSSAnimation: function(container, tarView, options) {

        var currentStyle = options.currentStyle;
        container.css({
            '-webkit-transition-duration' : null,
            '-webkit-transition-property' : null,
            '-webkit-transform' : null
        });
        tarView.css({
            'position' : currentStyle['position'] || null,
            'overflow-y' : currentStyle['overflow-y'] || null,
            'left' : currentStyle['left'],
            'top' : currentStyle['top']
        });
    },
    setupCSSAnimation: function(container, tarView, options) {

        options.currentStyle = {};
        options.currentStyle['overflow-y'] = tarView.css('overflow-y');
        options.currentStyle['top'] = tarView.css('top') || '0px';
        options.currentStyle['left'] = tarView.css('left') || '0px';
        options.currentStyle['position'] = tarView.css('position');
        tarView.css({
            position: 'absolute',
            top: '0px',
            left: direction === 'right2left' ? ( 1 * window.innerWidth) + 'px' : (-1 * window.innerWidth) + 'px',
            'overflow-y': 'hidden'
        });

        container.css({
            '-webkit-transition-property' : '-webkit-transform',
            '-webkit-transition-duration':  300,
            '-webkit-transform' : 'translate3d(' + (direction === 'right2left' ? (-1 * window.innerWidth) + 'px': window.innerWidth + 'px') + ', 0, 0)' // translate3d width % does not work in android (at least with xperia). i.e translated(-100%, 30, 30);
        });

    },
    getCleanupTimeOut: function() {
        return 500;
    },
});});
