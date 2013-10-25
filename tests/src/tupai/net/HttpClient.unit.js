test('initialize',function() {

    Package()
    .use('tupai.net.HttpClient')
    .run(function(cp) {
        var client = new cp.HttpClient();
        ok(client != undefined, 'initialize HttpRequest');
    });
});

test('execute success',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .use('tupai.net.HttpClient')
    .run(function(cp) {
        var request = new cp.HttpRequest({url: '/static/test.json'});
        var client = new cp.HttpClient();

        stop();
        client.execute(request, {
            didHttpRequestSuccess: function(res, req) {
                start();
                deepEqual(req, request,'same request object');

                ok(res, 'has response object');
                equal(res.status, 200, 'check http response status');
                equal(res.statusText, 'OK', 'check http response status text');
                ok(res.header, 'has response header object');
                var resObj = JSON.parse(res.responseText);
                deepEqual(resObj,{data:{test:true}},'success reques');
            },

            didHttpRequestError: function(res, req) {
                start();
                ok(false, 'error request');
            }
        });
    });
    expect(6);
});

test('execute error',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .use('tupai.net.HttpClient')
    .run(function(cp) {
        var request = new cp.HttpRequest({url: '/static/nofound.json'});
        var client = new cp.HttpClient();

        stop();
        client.execute(request, {
            didHttpRequestSuccess: function(res, req) {
                start();
                ok(false, 'success resquest');
            },

            didHttpRequestError: function(res, req) {
                start();

                deepEqual(req, request,'same request object');

                ok(res, 'has response object');
                equal(res.status, 404, 'check http response status');
                equal(res.statusText, 'Not Found', 'check http response status text');
                ok(res.header, 'has response header object');

            }
        });
    });
    expect(5);
});

