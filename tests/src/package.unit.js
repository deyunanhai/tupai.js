if(!Date.now) Date.now = function(){ return (new Date).getTime()};

test('package',function() {

	expect(7);
    ok(Package,'has Package');
    ok(Package('x'),'creation Package x');
    ok(Package('x.yy'),'creation Package x.yy');
    ok(Package('x.yy.zzz'),'creation Package x.yy.zzz');

    ok(Package.classProvider.x,'Package x exists');
    ok(Package.classProvider.x.yy,'Package x.yy exists');
    ok(Package.classProvider.x.yy.zzz,'Package x.yy.zzz exists');
});

test('define',function() {

	expect(1);
	Package('x.yy.zzz')
	.define('abc', {
	    some_function: function(v) {
	        ok(v, 'function run');
	    }
	}).run(function(cc) {
		cc.abc.some_function(true);
	});
});

test('use',function() {

	expect(1);
	Package('x.yy.zzz')
	.define('UseTest1', {
	});

	Package('x.yy.zzz')
	.use('x.yy.zzz.UseTest1')
	.run(function(cc) {
		ok(cc.UseTest1, 'test use');
	});
});

test('extend',function() {

	expect(4);
	Package('x.yy.zzz')
	.define('Parent', function(cc) { return Package.Class.extend({
		initialize: function(v) {
			ok(v, 'parent initialize run');
		},
	    some_function: function(v) {
	        ok(v, 'parent function run');
	    }
	});});

	Package('x.yy.zzz')
	.define('Child', function(cc) { return Package.classProvider.x.yy.zzz.Parent.extend({
		initialize: function(v) {
			ok(v, 'child initialize run');
			Package.classProvider.x.yy.zzz.Parent.prototype.initialize(v);
		},
	    some_function: function(v) {
	        ok(v, 'child function run');
	        Package.classProvider.x.yy.zzz.Parent.prototype.some_function(v);
	    }
	});}).run(function(cc) {
		new cc.Child(true).some_function(true);
	});
});

test('__class__', function() {
    expect(11);

    Package('X').define('Root', function(cc) { return Package.Class.extend({
        cry: 'Gyao',
        Gyao: function() {
            return 'Root ' + this.cry;
        }
    }); });

    Package('X').define('Child', function(cc) { return Package.classProvider.X.Root.extend({
        cry: 'Nyan',
        Gyao: function() {
            return 'Child ' + this.cry;
        }
    }); });

    Package('X').define('ChildChild', function(cc) { return Package.classProvider.X.Child.extend({
        cry: 'Wan',
        rootGyao: function() {
            return this.__class__.__super__.__super__.prototype.Gyao.apply(this, []);
        }
    }); });

    var root = new Package.classProvider.X.Root();
    var child = new Package.classProvider.X.Child();
    var childchild = new Package.classProvider.X.ChildChild();

    ok(root.__class__.toString() === 'X.Root', 'X.Root');
    ok(child.__class__.toString() === 'X.Child', 'X.Child');
    ok(child.__class__.__super__.toString() === 'X.Root', 'X.Root');
    ok(childchild.__class__.toString() === 'X.ChildChild', 'X.ChildChild');
    ok(childchild.__class__.__super__.toString() === 'X.Child', 'X.Child');
    ok(childchild.__class__.__super__.__super__.toString() === 'X.Root', 'X.Root');
    ok(childchild.__class__.__super__.__super__.__super__ === Object, 'Object');

    ok(root.Gyao() === 'Root Gyao', 'Root Gyao');
    ok(child.Gyao() === 'Child Nyan', 'Child Nyan');
    ok(childchild.Gyao() === 'Child Wan', 'Child Wan');
    ok(childchild.rootGyao() === 'Root Wan', 'Root Wan');
    
});

