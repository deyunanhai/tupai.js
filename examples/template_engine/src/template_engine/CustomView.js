Package('template_engine')
.use('tupai.ui.View')
.define('CustomView', function(cp) { return cp.View.extend({
    didLoad: function() {
        console.log('did load');
    },
    didRender: function() {
        console.log('did render');
    },
    didUnload: function() {
        console.log('did load');
    }
});});
