/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.util')
.use('tupai.util.UserAgent')
.define('FastButton', function(cp) {

    var coordinates = [];
    function clickbuster_pop() {
        coordinates.splice(0, 2);
    };

    function clickbuster_onClick(event) {
        for ( var i = 0; i < coordinates.length; i += 2) {
            var x = coordinates[i];
            var y = coordinates[i + 1];
            if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    };
    function preventGhostClick(x, y) {
        coordinates.push(x, y);
        window.setTimeout(clickbuster_pop, 2500);
    };

    var inited = false;
    function init() {
        if(inited) return;

        if(window.__tupai && __tupai.enableClickBuster) {
            if(cp.UserAgent.android())
                document.addEventListener('click', clickbuster_onClick, true);
        }

        inited = true;
        /*
        document.addEventListener('touchstart', function(event) {
            var str='';
            for(var name in event) {
                str += name + ':' + event[name] + '\n';
            }
        //console.log(str);
            console.log(
                event.target.getAttribute('class')  + ';' +
                event.srcElement.getAttribute('class')  + ';' +
                event.touches[0].clientX + ':' + event.touches[0].clientY );
        }, true);
        */
    }

    return Package.Class.extend({
        initialize: function(element, handler) {
            init();
            this.element = element;
            this.handler = handler;

            if(cp.UserAgent.android()) {
                element.addEventListener('touchstart', this, false);

                if(window.__tupai && __tupai.enableClickBuster) {
                    element.addEventListener('click', this, false);
                }
            } else {
                element.addEventListener('click', this, false);
            }
        },
        handleEvent: function(event) {
            switch (event.type) {
            case 'touchstart':
                this.onTouchStart(event);
                break;
            case 'touchmove':
                this.onTouchMove(event);
                break;
            case 'touchend':
                this.onClick(event);
                break;
            case 'click':
                this.onClick(event);
                break;
            }
        },
        onTouchStart: function(event) {
//console.log('touch start ' + this.element.getAttribute('class'));
            event.stopPropagation();

            this.element.addEventListener('touchend', this, false);
            document.body.addEventListener('touchmove', this, false);

            this.startX = event.touches[0].clientX;
            this.startY = event.touches[0].clientY;
        },
        onTouchMove: function(event) {
            if (Math.abs(event.touches[0].clientX - this.startX) >= 25
                    || Math.abs(event.touches[0].clientY - this.startY) > 10) {
//console.log('reset client:[' + event.touches[0].clientX + ',' + event.touches[0].clientY +
//            '; start:[' + this.startX + ',' + this.startY + ']' +
//            this.element.getAttribute('class'));
                this.reset();
            }
        },
        onClick: function(event) {
//console.log('onclick');
            event.stopPropagation();

            this.reset();
            this.handler(event);

            if(window.__tupai && __tupai.enableClickBuster) {
                if (event.type == 'touchend') {
                    preventGhostClick(this.startX, this.startY);
                }
            }
        },
        reset: function() {
            this.element.removeEventListener('touchend', this, false);
            document.body.removeEventListener('touchmove', this, false);
        },
        clear: function() {
            this.reset();
            this.element.removeEventListener('touchstart', this, false);
            this.element.removeEventListener('click', this, false);
        }
    });

}).define(function(cp) { return {
    bind: function(element, handler) {
        if(!element) return;
        if(element._element) {
            if(element._element) return cp.FastButton.bind(element._element, handler);
        } else {
            if(!window.addEventListener) {
                element.attachEvent('onclick', handler);
                element['fastbutton'] = handler;
            } else {
                element['fastbutton'] = new cp.FastButton(element, handler);
            }
        }
    },
    childBind: function() {
        if(cp.UserAgent.android()) {
            var parent = arguments[0];
            var parentHandler = arguments[1];
            cp.FastButton.bind(parent, parentHandler);
        } else {
            for(var i=2,n=arguments.length;i<n;i+=2) {
                var child = arguments[i];
                var childHandler = arguments[i+1];
                cp.FastButton.bind(child, childHandler);
            }
        }
    },
    unbind: function(element) {
        if(!element) return;
        if(element._element) {
            return cp.FastButton.unbind(element._element);
        } else {
            var fastButton = element['fastbutton'];
            if(!fastButton) return;
            if(fastButton.clear) {
                fastButton.clear();
            } else {
                element.detachEvent('onclick', fastButton);
            }
            element['fastbutton'] = undefined;
        }
    }
};});
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
