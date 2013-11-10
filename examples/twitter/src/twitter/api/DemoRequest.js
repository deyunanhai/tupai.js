Package('twitter.api')
.use('tupai.net.HttpRequest')
.use('tupai.Application')
.define('DemoRequest', function(cp) { return cp.HttpRequest.extend({
    getQueryString: function() {
        if(this.getAttribute('old')) {
            var nextPage = cp.Application.instance.getAttribute('nextPage');
            if(nextPage) {
                return nextPage.replace(/^\?/,'');
            }
            else throw new Error('no next page');
        } else return cp.HttpRequest.prototype.getQueryString.apply(this, arguments);
    }
});});
