/**
 * @class   tupai.events.Events
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * ### example
 *     @example
 *     Package('demo')
 *     .use('tupai.events.Events')
 *     .run(function(cp) {
 *         var events = new cp.Events();
 *         events.on('hoge', function(e) {
 *             logOnBody('hoge is fired. message is ' + e.message);
 *         });
 *
 *         events.fire('hoge', {message: 'hoge hoge'});
 *     });
 *
 * ### fireDelegate example
 *     @example
 *     Package('demo')
 *     .use('tupai.events.Events')
 *     .define('Test', function(cp) { return Package.Class.extend({
 *         didReciveMessage: function(e) {
 *             logOnBody('hoge\'s didReciveMessage is fired. message is ' + e.message);
 *         }
 *     });}).run(function(cp) {
 *         var test = new cp.Test();
 *         var events = new cp.Events();
 *         events.on('hoge', test);
 *         events.fireDelegate('hoge', 'didReciveMessage', {message: 'hoge hoge'});
 *     });
 *
 * ### Events base Model
 *     @example
 *     Package('demo')
 *     .use('tupai.events.Events')
 *     .define('Model', function(cp) { return cp.Events.extend({
 *         initialize: function() {
 *             this.SUPER.initialize.apply(this, arguments);
 *             this._map = {};
 *         },
 *         set: function(obj) {
 *             if(!obj) return;
 *             for(var name in obj) {
 *                 var oldV = this._map[name];
 *                 var newV = obj[name];
 *                 this._map[name] = newV;
 *                 var type = (oldV?'change':'add');
 *                 this.fire(type+':'+name, {
 *                     name: name,
 *                     oldValue: oldV,
 *                     newValue: newV
 *                 });
 *             }
 *         }
 *     });}).run(function(cp) {
 *         var test = new cp.Model();
 *         test.on('change:color', function(args) {
 *             logOnBody(args.name + ' is changed. ' + args.oldValue + ' -> ' + args.newValue);
 *         });
 *         test.on('add:color', function(args) {
 *             logOnBody(args.name + ' is added. ' + args.newValue);
 *         });
 *         test.set({
 *             color: 'oldValue'
 *         });
 *         test.set({
 *             color: 'newValue'
 *         });
 *     });
 *
 */
Package('tupai.events')
.define('Events', function(cp) { return Package.Class.extend({

    /**
     * initialize
     *
     */
    initialize : function (args) {
        this._events = {};
    },

    /**
     * fire event
     * @param {String} type
     * @param {Object} [parameter]
     *
     */
    fire: function(type, parameter) {
        var chain = this._events[type];
        if(chain) {
            var e = parameter || {};
            e.eventName = type;
            e.stop = false;
            for(var i=0,n=chain.length;i<n;i++) {
                if(!chain[i]) continue;

                chain[i](e);
                if(e.stop) break;
            }
        }
    },

    /**
     * fire event and execute delegate method
     * @param {String} name event name
     * @param {String} type delegate method name
     * @param {Object} [parameter]
     *
     */
    fireDelegate: function(name, type, parameter) {
        var chain = this._events[name];
        if(chain) {
            var e = parameter || {};
            e.targetName = name;
            e.eventName = type;
            e.stop = false;
            for(var i=0,n=chain.length;i<n;i++) {
                if(!chain[i]) continue;

                if(chain[i][type]) {
                    chain[i][type](e);
                    if(e.stop) break;
                }
            }
        }
    },

    /**
     * same as on.
     * @param {String} type eventType
     * @param {Object} listener function or class instance
     * @param {boolean} [first=true] add listener to the first of events pool
    *  @deprecated 0.4 Use {@link tupai.events.Events#on} instead.
     *
     */
    addEventListener: function(type, listener, first) {
        return this.on(type, listener, first);
    },

    /**
     * add event listener
     * @param {String} type eventType
     * @param {Object} listener function or class instance
     * @param {boolean} [first=true] add listener to the first of events pool
     *
     */
    on: function(type, listener, first) {
        var chain = this._events[type];
        if(!chain) {
            this._events[type] = chain = [];
        } else {
            if(chain.indexOf(listener) >= 0) return false;
        }
        if(first) chain.unshift(listener);
        else chain.push(listener);
        return true;
    },

    /**
     * same as off.
     * @param {String} type eventType
     * @param {Object} listener function or class instance
    *  @deprecated 0.4 Use {@link tupai.events.Events#off} instead.
     *
     */
    removeEventListener: function(type, listener) {
        return this.off(type, listener);
    },

    /**
     * remove listener from events pool
     * @param {String} type eventType
     * @param {Object} listener function or class instance
     *
     */
    off: function(type, listener) {
        var chain = this._events[type];
        if(!chain) return;
        var index;
        if((index=chain.indexOf(listener)) < 0) return false;

        delete chain[index];
        return true;
    },

    /**
     * remove all listeners
     * @param {String} type eventType
     *
     */
    removeAllEventListener: function(type) {
        delete this._events[type];
    },

    /**
     * clear all listeners
     *
     */
    clear: function() {
        this._events = {};
    }
});});
