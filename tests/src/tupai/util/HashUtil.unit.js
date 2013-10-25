test('merge',function() {

    Package()
    .use('tupai.util.HashUtil')
    .run(function(cp) {

        var a,b,c;

        a = {va: '1'};
        b = {vb: '1'};

        c = cp.HashUtil.merge(a, b);
        deepEqual(c, {va: '1', vb: '1'}, 'check merge');
        deepEqual(a, {va: '1', vb: '1'}, 'check merge');
        deepEqual(b, {vb: '1'}, 'check merge');

        a = {va: '1'};
        b = {vb: '1'};
        c = undefined;
        c = cp.HashUtil.merge(c, a);
        c = cp.HashUtil.merge(c, b);
        deepEqual(c, {va: '1', vb: '1'}, 'check merge');
        deepEqual(a, {va: '1'}, 'check merge');
        deepEqual(b, {vb: '1'}, 'check merge');

        c = cp.HashUtil.merge(a);
        equal(c, a, 'check merge');
    });
});

test('equals',function() {

    Package()
    .use('tupai.util.HashUtil')
    .run(function(cp) {

        ok(cp.HashUtil.equals(), 'check equals');
        ok(cp.HashUtil.equals(undefined, null), 'check equals');
        ok(cp.HashUtil.equals('', ''), 'check equals');
        ok(cp.HashUtil.equals('1', 1), 'check equals');

        ok(!cp.HashUtil.equals('1'), 'check equals');
        ok(!cp.HashUtil.equals('1', '2'), 'check equals');

        ok(cp.HashUtil.equals({}, {}), 'check equals');
        ok(cp.HashUtil.equals({a:'11'}, {a:'11'}), 'check equals');

        ok(!cp.HashUtil.equals({}, {a:'11'}), 'check equals');
    });
    //expect(4);
});

test('clone',function() {

    Package()
    .use('tupai.util.HashUtil')
    .run(function(cp) {

        ok(cp.HashUtil.clone(), 'check clone');
        notEqual(cp.HashUtil.clone({a: '1'}), {a: '1'}, 'check clone');
        deepEqual(cp.HashUtil.clone({a: '1'}), {a: '1'}, 'check clone');
    });
    //expect(4);
});

test('getValueByName',function() {

    Package()
    .use('tupai.util.HashUtil')
    .run(function(cp) {

        var d={
            p1: { s1: 's1' },
            p2: 'p2'
        };
        equal(cp.HashUtil.getValueByName('p2', d), 'p2', 'check getValueByName');
        equal(cp.HashUtil.getValueByName('p1.s1', d), 's1', 'check getValueByName');
        equal(cp.HashUtil.getValueByName('p1', d), d.p1, 'check getValueByName');

        equal(cp.HashUtil.getValueByName('p3', d), null, 'check getValueByName');
    });
    //expect(4);
});

test('only',function() {

    Package()
    .use('tupai.util.HashUtil')
    .run(function(cp) {

        var d = {p1: {}, p2: '', p3: 0};

        ok(cp.HashUtil.only('', d, ['p1', 'p2', 'p3']), 'check getValueByName');
        ok(!cp.HashUtil.only('', d, []), 'check getValueByName');
        ok(!cp.HashUtil.only('', d, ['p1']), 'check getValueByName');
        ok(!cp.HashUtil.only('', d, ['p1', 'p2']), 'check getValueByName');
    });
    //expect(4);
});

test('swap',function() {

    Package()
    .use('tupai.util.HashUtil')
    .run(function(cp) {

        var a,b,c;

        a = {p1: 'a'};
        b = {p1: 'b'};

        ok(!cp.HashUtil.swap(), 'swap undefined');
        ok(!cp.HashUtil.swap(a), 'swap undefined');
        ok(!cp.HashUtil.swap(undefined, b), 'swap undefined');

        c = cp.HashUtil.swap(a, b);
        deepEqual(a, {p1: 'b'}, 'check swap');
        deepEqual(c, {p1: 'a'}, 'check swap');
    });
    //expect(4);
});

test('require',function() {

    Package()
    .use('tupai.util.HashUtil')
    .run(function(cp) {

        var d={
            p1: { s1: 's1' },
            p2: 'p2'
        };

        cp.HashUtil.require(d, ['p1']); // no throw
        cp.HashUtil.require(d, ['p2']); // no throw

        throws(function() {
            cp.HashUtil.require(d, ['p3', 'p1']);
        }, Error, 'missing required parameter');

        throws(function() {
            cp.HashUtil.require(d, ['p3']);
        }, Error, 'missing required parameter');

    });
    //expect(2);
});
