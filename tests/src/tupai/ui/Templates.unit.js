test('load from html',function() {

    expect(1);
    Package()
    .use('tupai.ui.Templates')
    .run(function(cp) {
        var t = new cp.Templates({
            html: '<div data-ch-template="template1">something</div>'
        });
        t.get('template1', function(html) {
            ok(html == '<div>something</div>', 'get html');
        });
    });

});

test('load from remote',function() {

    expect(2);
    Package()
    .use('tupai.ui.Templates')
    .run(function(cp) {
        var t = new cp.Templates({
            url: '/static/template.html'
        });

        stop();

        t.get('template2', function(html) {
            start();

            ok(html, 'get template2');
            t.get('template', function(html) {
                ok(html, 'get template');
            });
        });
    });
});
