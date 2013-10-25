/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.util')
.define('LinkedList', function(cp) { return Package.Class.extend({
    _root: undefined,
    _last: undefined,
    initialize: function() {
        this._size = 0;
    },
    _add: function(first, last, head) {
        if(!this._last) {
            this._root = first;
            this._last = last;
        } else {
            if(head) {
                last.next = this._root;
                this._root.prev = last;
                this._root = first;
            } else {
                this._last.next = first;
                first.prev = this._last;
                this._last = last;
            }
        }
    },
    push: function(data) {

        var node = {data: data, next: undefined, prev: undefined};
        this._add(node, node, false);
        this._size++;
    },
    unshift: function(data) {

        var node = {data: data, next: undefined, prev: undefined};
        this._add(node, node, true);
        this._size++;
    },
    clear: function() {
        this._root = undefined;
        this._last = undefined;
        this._size = 0;
    },
    iterator: function(callback) {

        var c = this._root;
        while(c) {
            callback(c.data);
            c = c.next;
        }
    },
    _findByData: function(data) {
        var current = this._root;
        while(current) {
            if(data === current.data) return current;
            current = current.next;
        }
    },
    _findByIndex: function(index) {
        if(index < 0 || index >= this._size) return undefined;
        var current = this._root;
        while(current) {
            if(index == 0) return current;
            current = current.next;
            index--;
        }
    },
    _remove: function(start, last) {
        //console.log('remove ' + start.data + ':' + last.data);
        if(start.prev) {
            if(last.next) {
                start.prev.next = start.next;
                last.next.prev = last.prev;
            } else {
                this._last = start.prev;
                this._last.next = undefined;
            }
        } else {
            if(last.next) {
                this._root = last.next;
                this._root.prev = undefined;
            } else {
                this._root = this._last = undefined;
            }
        }
    },
    removeByElement: function(data) {
        var node = this._findByData(data);
        if(!node) return undefined;

        this._remove(node, node);
        this._size --;
        return data;
    },
    removeByIndex: function(index) {
        var node = this._findByIndex(index);
        if(!node) return undefined;

        this._remove(node, node);
        this._size --;
        return node.data;
    },
    pop: function() {
        return this.removeLast();
    },
    shift: function() {
        return this.removeFirst();
    },
    removeFirst: function() {

        if(!this._root) return;

        var ret = this._root.data;
        this._root = this._root.next;
        if(!this._root) {
            this._last = undefined;
        } else {
            this._root.prev = undefined;
        }
        this._size --;
        return ret;
    },
    removeLast: function() {

        if(!this._last) return;

        var ret = this._last.data;
        this._last = this._last.prev;
        if(!this._last) {
            this._root = undefined;
        } else {
            this._last.next = undefined;
        }
        this._size --;
        return ret;
    },
    filter: function(callback) {

        var current = this._root;
        var start, last, count=0;
        while(current) {
            if(!callback(current.data, count)) {
                if(!start) {
                    start = current;
                }
                count++;
            } else {
                if(start) {
                    this._remove(start, current.prev);
                    this._size -= count;
                    start = undefined;
                    count = 0;
                }
            }
            last = current;
            current = current.next;
        }
        if(start) {
            this._remove(start, last);
            this._size -= count;
        }
    },
    _createNode: function(arr) {
        var r,l,c;
        var n=arr.length;
        for(var i=0;i<n;i++) {
            c = {data: arr[i], next: undefined, prev: undefined};
            if(!l) {
                r = l = c;
            } else {
                l.next = c;
                c.prev = l;
                l = c;
            }
        }
        if(r && l) {
            return {
                root: r, last: l, count: n
            };
        } else {
            return undefined;
        }
    },
    concatFirst: function(arr) {
        var nodes = this._createNode(arr);
        if(nodes) {
            this._add(nodes.root, nodes.last, true);
            this._size += nodes.count;
        }
    },
    concat: function(arr) {
        var nodes = this._createNode(arr);
        if(nodes) {
            this._add(nodes.root, nodes.last, false);
            this._size += nodes.count;
        }
    },
    get: function(index) {
        if(index < 0 || index >= this._size) return undefined;
        var node = this._findByIndex(index);
        return node?node.data:undefined;
    },
    size: function() {
        return this._size;
    }
});});
