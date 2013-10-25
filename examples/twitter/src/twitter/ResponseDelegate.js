Package('twitter')
.use('tupai.Application')
.define('ResponseDelegate', function(cp) { return Package.Class.extend({
    didHttpRequestSuccess: function(name, reqName, res, req) {

        var app = cp.Application.instance;
        var responseObj = res.response;
        if(!responseObj) {
            responseObj = JSON.parse(res.responseText);
        }

        var data = responseObj.statuses;
        if(!data) {
            var statusCode = responseObj.statusCode;
            if(statusCode) {
                console.error(responseObj.data);
                alert('error \n' + responseObj.data);
                return;
            }
        }

        var meta  = responseObj.search_metadata;
        app.setAttribute('nextPage', meta['next_results']);
        var caches = app.getCacheManager();
        var cache = caches.getCache('timeline');
        for(var i=0, n=data.length; i<n; i++) {
            this._fixUrlText(data[i]);
            cache.push(data[i]);
        }
        cache.end();
    },
    _fixUrlText: function(data) {
        var entities = data.entities;
        var urls = entities && entities.urls;
        if(urls && urls.length > 0) {
            var text = data.text;
            data.text_old = text;
            for(var i=0, n=urls.length; i<n; i++) {
                var url = urls[i];
                var indices = url.indices;
                if(!indices || indices.length != 2) continue;
                text = text.substring(0, indices[0]) +
                    '<a href="' + url.expanded_url + '" target="_blank">' + url.display_url + '</a>' +
                    text.substring(indices[1]);
            }
            data.text = text;
        }
    },
    didHttpRequestError: function(name, reqName, res, req) {
    }
});});
