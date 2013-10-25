test('bind',function() {

    Package()
    .use('tupai.util.CommonUtil')
    .run(function(cp) {

        var THIS = {};
        var func = function(p1, p2, p3) {
            equal(p1, 'p1Value', 'check value');
            equal(p2, 'p2Value', 'check value');
            equal(p3, 'cValue', 'check value');
            equal(THIS, this, 'check this object');
        }

        cp.CommonUtil.bind(func, THIS, 'p1Value', 'p2Value')('cValue');
    });
    expect(4);
});

test('isValidUrl',function() {

    Package()
    .use('tupai.util.CommonUtil')
    .run(function(cp) {

        ok(cp.CommonUtil.isValidUrl('http://www.google.com'), 'check isValidUrl');
        ok(cp.CommonUtil.isValidUrl('http://www.google.com/'), 'check isValidUrl');
        ok(cp.CommonUtil.isValidUrl('http://www.google.com/index.html'), 'check isValidUrl');
        ok(cp.CommonUtil.isValidUrl('https://www.google.com/index.html'), 'check isValidUrl');
        ok(cp.CommonUtil.isValidUrl('ftp://www.google.com/index.html'), 'check isValidUrl');
        ok(cp.CommonUtil.isValidUrl('http://www.google.com:8080/index.html'), 'check isValidUrl');
        ok(cp.CommonUtil.isValidUrl('https://www.google.com:8080/index.html'), 'check isValidUrl');
        ok(cp.CommonUtil.isValidUrl('ftp://www.google.com:8080/index.html'), 'check isValidUrl');
        ok(cp.CommonUtil.isValidUrl('ftp://user@www.google.com:8080/index.html'), 'check isValidUrl');
        ok(cp.CommonUtil.isValidUrl('ftp://user:password@www.google.com:8080/index.html'), 'check isValidUrl');

        ok(!cp.CommonUtil.isValidUrl(), 'check isValidUrl');
        ok(!cp.CommonUtil.isValidUrl(''), 'check isValidUrl');
        ok(!cp.CommonUtil.isValidUrl('aa'), 'check isValidUrl');
        ok(!cp.CommonUtil.isValidUrl('htp://www'), 'check isValidUrl');
    });
    //expect(4);
});

test('isValidHttpUrl',function() {

    Package()
    .use('tupai.util.CommonUtil')
    .run(function(cp) {

        ok(cp.CommonUtil.isValidHttpUrl('http://www.google.com'), 'check isValidHttpUrl');
        ok(cp.CommonUtil.isValidHttpUrl('http://www.google.com/'), 'check isValidHttpUrl');
        ok(cp.CommonUtil.isValidHttpUrl('http://www.google.com/index.html'), 'check isValidHttpUrl');
        ok(cp.CommonUtil.isValidHttpUrl('https://www.google.com/index.html'), 'check isValidHttpUrl');
        ok(!cp.CommonUtil.isValidHttpUrl('ftp://www.google.com/index.html'), 'check isValidHttpUrl');
        ok(cp.CommonUtil.isValidHttpUrl('http://www.google.com:8080/index.html'), 'check isValidHttpUrl');
        ok(cp.CommonUtil.isValidHttpUrl('https://www.google.com:8080/index.html'), 'check isValidHttpUrl');

        ok(!cp.CommonUtil.isValidHttpUrl('ftp://www.google.com:8080/index.html'), 'check isValidHttpUrl');
        ok(!cp.CommonUtil.isValidHttpUrl('ftp://user@www.google.com:8080/index.html'), 'check isValidHttpUrl');
        ok(!cp.CommonUtil.isValidHttpUrl('ftp://user:password@www.google.com:8080/index.html'), 'check isValidHttpUrl');
        ok(!cp.CommonUtil.isValidHttpUrl(), 'check isValidHttpUrl');
        ok(!cp.CommonUtil.isValidHttpUrl(''), 'check isValidHttpUrl');
        ok(!cp.CommonUtil.isValidHttpUrl('aa'), 'check isValidHttpUrl');
        ok(!cp.CommonUtil.isValidHttpUrl('htp://www'), 'check isValidHttpUrl');
    });
    //expect(4);
});

test('getDataSet',function() {

    Package()
    .use('tupai.util.CommonUtil')
    .run(function(cp) {

        var elem = document.createElement('div');
        elem.setAttribute('data-ch-name', 'ch name');

        equal(cp.CommonUtil.getDataSet(elem, 'chName'), 'ch name', 'check getDataSet');
    });
});

