#! /usr/bin/env node

var fs = require('fs');

var createClass = function(prototype, properties) {
    var definition = function() {
        this.initialize && this.initialize.apply(this, arguments);
    };
    definition.prototype = prototype || {};
    if(properties) {
        copy(definition, properties);
    }
    return definition;
}

var packageClass = createClass({
    initialize: function(packageName) {
        this.packageName = packageName || '';
        this.useList=[];
        this.defineNames=[];
    },
    use: function(packageName) {
        this.useList.push(packageName);
        return this;
    },
    // define(className, callback);
    // define(callback);
    define: function(arg1, arg2) {
        if(typeof arg1 === 'string') {
            this.defineNames.push(arg1);
        }
        return this;
    },
    run: function(callback) {
        return this;
    }
});

var packages=[];
Package=function(name) {
    var ret = new packageClass(name);
    packages.push(ret);
    return ret;
};
window={};

require('./src/tupai/ui/TableView.js');

console.log(packages);
