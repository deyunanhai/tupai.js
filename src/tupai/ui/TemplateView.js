/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * @deprecated
 * */
Package('tupai.ui')
.use('tupai.ui.View')
.define('TemplateView', function(cp) { return cp.View.extend({
    initialize : function (args) {
        console.error('TemplateView is Deprecated, use View instead');
        cp.View.prototype.initialize.apply(this, arguments);
    },
});});
