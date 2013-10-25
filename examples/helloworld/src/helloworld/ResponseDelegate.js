Package('helloworld')
.use('tupai.Application')
.define('ResponseDelegate', function(cp) { return Package.Class.extend({
    didHttpRequestSuccess: function(name, reqName, res, req) {

        var app = cp.Application.instance;
        var responseObj = res.response;
        if(!responseObj) {
            res.response = responseObj = JSON.parse(res.responseText);
        }

        /*
        var error = responseObj.error;
        if(error) {
            // error handler
            return;
        }
        */

        var results = responseObj.results;
        if(!results) {
            console.error('please fix ResponseDelegate.');
            return;
        }
        var caches = app.getCacheManager();
        var cache = caches.getCache(name);
        for(var i=0, n=results.length; i<n; i++) {
            cache.push(results[i]);
        }
        cache.end();
    },
    didHttpRequestError: function(name, reqName, res, req) {
        console.error(res.responseText);
    }
});});
