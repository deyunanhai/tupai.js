/*
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @version 1.0
 * */
Package('tupai.ui')
.use('tupai.ui.TemplateEngine')
.use('tupai.util.HashUtil')
.define('MustacheTemplateEngine', function(cp) {

    var createElement = function(element, template, data) {
        if(template) {
            var root = document.createElement('div');
            root.innerHTML = Mustache.render(template, data);
            return root.children[0];
        } else {
            return document.createElement('div');
        }
    };

    cp.HashUtil.swap(cp.TemplateEngine, {
        createElement: createElement
    });
});
