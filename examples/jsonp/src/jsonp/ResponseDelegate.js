Package('jsonp')
.use('tupai.Application')
.define('ResponseDelegate', function(cp) { return Package.Class.extend({
    didHttpRequestSuccess: function(name, reqName, res, req) {

        var error = res.error;
        if(error) {
            alert(error);
            return;
        }
        var app = cp.Application.instance;
        var results = res.response.results;
        var caches = app.getCacheManager();
        var cache = caches.getCache(name);
        for(var i=0, n=results.length; i<n; i++) {
            cache.push(results[i]);
        }
        cache.end();
    },
    didHttpRequestError: function(name, reqName, res, req) {
        alert(res.responseText);
    }
});});
