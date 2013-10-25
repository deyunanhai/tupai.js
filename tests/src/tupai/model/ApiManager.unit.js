test('initialize',function() {

    Package()
    .use('tupai.model.ApiManager')
    .run(function(cp) {
        var am = new cp.ApiManager({});
        ok(am != undefined, 'initialize ApiManager');
    });
});

test('execute 404',function() {

    Package()
    .use('tupai.model.ApiManager')
    .run(function(cp) {
        var am = new cp.ApiManager({
            apiParameterMap: {
                timeline: {
                    search: {
                        method: 'GET',
                        url: '/api/items',
                        parameters: {
                            parameter1: 'parameter1Value'
                        }
                    }
                }
            }
        });

        var observer = {
            didHttpRequestSuccess: function(e) {
                start();
                ok(false, 'never');
            },
            didHttpRequestError: function(e) {
                start();
                equal(e.name, 'timeline', 'check name');
                equal(e.requestName, 'search', 'check request name');

                var response = e.response;
                equal(response.status, 404, 'check error status');
            }
        };
        am.registerObserver('timeline', observer);

        am.execute({
            name: 'timeline',
            requestName: 'search',
            parameters: {q: 'parameterQ'}
        });
        stop();
    });
    expect(3);
});

test('execute success',function() {

    Package()
    .use('tupai.model.ApiManager')
    .run(function(cp) {
        var am = new cp.ApiManager({
            apiParameterMap: {
                timeline: {
                    search: {
                        method: 'GET',
                        url: '/static/test.json',
                        parameters: {
                            defaultParameter: 'defaultParameterValue'
                        }
                    }
                }
            }
        });

        var observer = {
            didHttpRequestSuccess: function(e) {
                start();
                equal(e.name, 'timeline', 'check name');
                equal(e.requestName, 'search', 'check request name');

                var req = e.request;
                equal(req.getParameter('customParameter'), 'customParameterValue', 'check parameter');
                equal(req.getParameter('defaultParameter'), 'defaultParameterValue', 'check parameter');
            },
            didHttpRequestError: function(e) {
                start();
                ok(false, 'never');
            }
        };
        am.registerObserver('timeline', observer);

        am.execute({
            name: 'timeline',
            requestName: 'search',
            parameters: {customParameter: 'customParameterValue'}
        });
        stop();
    });
    expect(4);
});
