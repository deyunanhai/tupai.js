test('initialize',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .run(function(cp) {
        var request = new cp.HttpRequest({url: '/static/test.json'});
        ok(request != undefined, 'initialize HttpRequest');
        equal(request.getType(), 'json', 'default type value');
    });
    expect(2);
});

var headers = {
    'Header1': 'value1',
    'Header2': 'value2'
};

var attributes = {
    'attribute1': 'value1',
    'attribute2': 'value2'
};

var parameters = {
    'parameter1': 'value1',
    'parameter2': 'value2'
};

var queryParameters = {
    'queryParameter1': 'value1',
    'queryParameter2': 'value2'
};

var formDatas = {
    'formData1': 'value1',
    'formData2': 'value2'
};

var all = {
    parameters: parameters,
    queryParameters: queryParameters,
    formDatas: formDatas,
    attributes: attributes,
    headers: headers
};

test('addHeaders',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .run(function(cp) {
        var request = new cp.HttpRequest({url: '/static/test.json'});
        request.addHeaders(headers);

        deepEqual(request.getHeaders(), headers, 'check headers');
    });
    expect(1);
});

test('addAttributes',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .run(function(cp) {
        var request = new cp.HttpRequest({url: '/static/test.json'});
        request.addAttributes(attributes);

        deepEqual(request.getAttributes(), attributes, 'check attributes');
    });
    expect(1);
});

test('addParameters',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .run(function(cp) {
        var request = new cp.HttpRequest({url: '/static/test.json'});
        request.addParameters(parameters);

        deepEqual(request.getParameters(), parameters, 'check parameters');
    });
    expect(1);
});

test('addQueryParameters',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .run(function(cp) {
        var request = new cp.HttpRequest({url: '/static/test.json'});
        request.addQueryParameters(queryParameters);

        deepEqual(request.getQueryData(), queryParameters, 'check queryParameters');
        var queryString = 'queryParameter1=value1&queryParameter2=value2';
        equal(request.getQueryString(), queryString, 'check queryParameters');
    });
    expect(2);
});

test('addFormDatas',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .run(function(cp) {
        var request = new cp.HttpRequest({url: '/static/test.json'});
        request.addFormDatas(formDatas);

        deepEqual(request.getData(), formDatas, 'check queryParameters');
    });
    expect(1);
});

function merge(dest, src) {
    if(!src) return dest;
    dest = dest || {};
    for (var key in src) {
        if (src.hasOwnProperty(key)) {
            dest[key] = src[key];
        }
    }
    return dest;
}

test('addAll GET',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .run(function(cp) {
        var request = new cp.HttpRequest({url: '/static/test.json', method: 'GET'});
        request.addAll(all);

        var qParameters = {};
        qParameters = merge(qParameters, queryParameters);
        qParameters = merge(qParameters, parameters);

        deepEqual(request.getHeaders(), headers, 'check headers');
        deepEqual(request.getParameters(), parameters, 'check parameters');
        deepEqual(request.getQueryData(), qParameters, 'check queryParameters');

        var queryString = 'parameter1=value1&parameter2=value2&queryParameter1=value1&queryParameter2=value2';
        equal(request.getQueryString(), queryString, 'check queryString');
        deepEqual(request.getData(), formDatas, 'check formData');
    });
    expect(5);
});

test('addAll POST',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .run(function(cp) {
        var request = new cp.HttpRequest({url: '/static/test.json', method: 'POST'});
        request.addAll(all);

        var postParameters = {};
        postParameters = merge(postParameters, formDatas);
        postParameters = merge(postParameters, parameters);

        deepEqual(request.getHeaders(), headers, 'check headers');
        deepEqual(request.getParameters(), parameters, 'check parameters');
        deepEqual(request.getQueryData(), queryParameters, 'check queryParameters');

        var queryString = 'queryParameter1=value1&queryParameter2=value2';
        equal(request.getQueryString(), queryString, 'check queryString');
        deepEqual(request.getData(), postParameters, 'check formData');
    });
    expect(5);
});

test('name property',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .run(function(cp) {
        var request = new cp.HttpRequest({
            url: '/static/test.json'
        });
        request.setName('name');
        equal(request.getName(), 'name', 'check name')
    });
    expect(1);
});

test('request property',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .run(function(cp) {
        var request = new cp.HttpRequest({
            url: '/static/test.json'
        });
        request.setRequestName('name');
        equal(request.getRequestName(), 'name', 'check request name')
    });
    expect(1);
});

test('initialize property',function() {

    Package()
    .use('tupai.net.HttpRequest')
    .run(function(cp) {
        var request = new cp.HttpRequest({
            url: '/static/test.json',
            method: 'GET',
            type: 'html'
        });
        equal(request.getUrl(), '/static/test.json', 'check url')
        equal(request.getMethod(), 'GET', 'check url')
        equal(request.getType(), 'html', 'check url')
    });
    expect(3);
});

