/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
(function (global) {

    function copy(targetElement, providers, override) {

        for ( var name in providers) {
            if (override || typeof targetElement[name] === 'undefined') {
                targetElement[name] = providers[name];
            }
        }
        return targetElement;
    }

    function createClass(prototype, properties) {
        var definition = function() {
            this.initialize && this.initialize.apply(this, arguments);
        };
        definition.prototype = prototype || {};
        if(properties) {
            copy(definition, properties);
        }
        return definition;
    }

    var classProvider = {};

    function createPackage(packagename, defaultPackageClass) {

        var packageObj = classProvider;
        var nameArr = packagename ? packagename.split('.') : [];
        for ( var i = 0, n=nameArr.length; i < n; i++) {
            var name = nameArr[i];
            var obj = packageObj[name];
            if (!obj) {
                obj = defaultPackageClass || {};
                packageObj[name] = obj;
            }
            packageObj = obj;
        }
        return packageObj;
    }

    function findClass(classPathArr) {

        var nameArr = classPathArr;
        var className = nameArr[nameArr.length-1];

        var packageObj = classProvider;
        for ( var i = 0, n=nameArr.length; i < n; i++) {
            var name = nameArr[i];
            var obj = packageObj[name];
            if(!obj) return null;
            packageObj = obj;
        }
        return packageObj;
    }

    function mergeClassByClassPath(target, classPath) {

        if(!classPath) return;
        var nameArr = classPath.split('.');
        var className = nameArr[nameArr.length-1];
        if(target[className]) return;

        var classObj = findClass(nameArr)
        if(!classObj) throw new Error('cannot find package!' + classPath);
        target[className] = classObj;
    }

    var packageClass = createClass({
        initialize: function(packageName) {
            packageName = packageName || '';
            //this._packageName = packageName;
            this._packageObj = createPackage(packageName);
            this._classProvider = {};
            this._classObject = undefined;
        },
        use: function(packageName) {
            mergeClassByClassPath(this._classProvider, packageName);
            return this;
        },
        // define(className, callback);
        // define(callback);
        define: function(arg1, arg2) {
            if(typeof arg1 === 'string') {
                var className = arg1;
                var callback = arg2;
                var obj = ((typeof callback !== 'function') ? callback : callback(this._classProvider));
                this._packageObj[className] = obj;
                this._classProvider[className] = obj;
                this._classObject = obj;
            } else {
                var callback = arg1;
                if(!this._classObject) throw new Error('must define with name first.');
                var obj = ((typeof callback !== 'function') ?
                           callback :
                           callback.apply(this._classObject, [this._classProvider]));
                if(obj) {
                    copy(this._classObject, obj, true);
                }
            }
            return this;
        },
        run: function(callback) {
            if(typeof callback !== 'function') throw Error();
            callback(this._classProvider);
            return this;
        }
    });

    var BaseClass = createClass({initialize: function() {}});
    BaseClass.forName = function(name) {

        if(!name) throw new Error('cannot find package!' + name);
        var classObj = findClass(name.split('.'));
        if(!classObj) throw new Error('cannot find package!' + name);
        return classObj;
    };
    BaseClass.extend = function(prototype, properties) {

        var parent = this;
        var extendedClass = createClass(prototype, properties);

        //extendedClass.prototype.__proto__ = parent.prototype;
        copy(extendedClass.prototype, parent.prototype, false);

        //extendedClass.prototype.SUPER = this.prototype;
        //extendedClass.SUPER = this;
        extendedClass.extend = parent.extend;
        return extendedClass;
    };

    global.Package = function(name){
        return new packageClass(name);
    };
    global.Package.Class = BaseClass;
    global.Package.classProvider = classProvider;

})(window);
