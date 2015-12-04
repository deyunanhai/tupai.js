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

test('className', function() {
	expect(2);

	Package('X').define('Parent', function(cc) { return Package.Class.extend({}); });
	Package('X').define('Child', function(cc) { return Package.classProvider.X.Parent.extend({}); });
    var parent = new Package.classProvider.X.Parent();
    var child = new Package.classProvider.X.Child();

    ok(parent.__className__, 'X.Parent');
    ok(child.__className__, 'X.Child');
});
