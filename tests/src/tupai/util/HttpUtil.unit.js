test('encode',function() {

    Package()
    .use('tupai.util.HttpUtil')
    .run(function(cp) {

        function testThis(param) {
            var e = cp.HttpUtil.encode(param);
            var f = cp.HttpUtil.decode(e);
            deepEqual(param, f, 'test encode and decode');
        }

        var u = cp.HttpUtil;
        equal(u.encode({a:'a', b:'b'}), 'a=a&b=b', 'test encode');
        equal(u.encode({a:' &'}), 'a=%20%26', 'test encode');
    });
});

test('ajax success',function() {

    Package()
    .use('tupai.util.HttpUtil')
    .run(function(cp) {

        cp.HttpUtil.ajax(
            '/static/test.json',
            function(text, xhr) {
                start();
                equal(xhr.status, 200, 'check http response status');
                var resObj = JSON.parse(text);
                deepEqual(resObj,{data:{test:true}},'success reques');
            },
            function() {
                start();
                ok(false, 'never');
            }
        );
        stop();
    });
    expect(2);
});

test('ajax error',function() {

    Package()
    .use('tupai.util.HttpUtil')
    .run(function(cp) {

        cp.HttpUtil.ajax(
            '/static/no.json',
            function(text, xhr) {
                start();
                ok(false, 'never');
            },
            function(xhr) {
                start();
                equal(xhr.status, 404, 'check http response status');
                equal(xhr.statusText, 'Not Found', 'check http response status text');
            }
        );
        stop();
    });
    expect(2);
});
