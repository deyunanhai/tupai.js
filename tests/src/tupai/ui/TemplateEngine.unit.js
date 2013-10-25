test('checkbox',function() {

    expect(6);
    Package()
    .use('tupai.ui.TemplateEngine')
    .run(function(cp) {
        var elem = cp.TemplateEngine.createElement(
            null,
            '<input type="checkbox" data-ch-name="v">',
            {v: true}
        );

        ok(elem.checked, 'set checkbox value to true');
        ok(cp.TemplateEngine.getValue(elem) === elem.checked, 'check get value');
        cp.TemplateEngine.setValue(elem, false);
        ok(!elem.checked, 'set checkbox value to false');
        ok(cp.TemplateEngine.getValue(elem) === elem.checked, 'check get value');
        cp.TemplateEngine.setValue(elem, true);
        cp.TemplateEngine.setValue(elem, undefined);
        ok(!elem.checked, 'set checkbox value to undefined');
        ok(cp.TemplateEngine.getValue(elem) === elem.checked, 'check get value');
    });

});

test('select',function() {

    expect(6);
    Package()
    .use('tupai.ui.TemplateEngine')
    .run(function(cp) {
        var elem = cp.TemplateEngine.createElement(
            null,
            '<select data-ch-name="v"><option><option><option value="a">aa</option></select>',
            {v: 'a'}
        );

        ok(elem.selectedIndex == 2, 'set select value');
        ok(cp.TemplateEngine.getValue(elem) === elem.value, 'check get value');

        cp.TemplateEngine.setValue(elem, '');
        ok(elem.selectedIndex == 1, 'set select value to blank');
        ok(cp.TemplateEngine.getValue(elem) === elem.value, 'check get value');

        cp.TemplateEngine.setValue(elem, undefined);
        ok(elem.selectedIndex == 0, 'set select value to unfind');
        ok(cp.TemplateEngine.getValue(elem) === elem.value, 'check get value');
    });
});

test('input text',function() {

    expect(8);
    Package()
    .use('tupai.ui.TemplateEngine')
    .run(function(cp) {
        var elem = cp.TemplateEngine.createElement(
            null,
            '<input type="text" data-ch-name="v">',
            {v: 'text'}
        );

        ok(elem.value === 'text', 'set text value');
        ok(cp.TemplateEngine.getValue(elem) === elem.value, 'check get value');

        cp.TemplateEngine.setValue(elem, '');
        ok(elem.value === '', 'set text value to blank');
        ok(cp.TemplateEngine.getValue(elem) === elem.value, 'check get value');

        cp.TemplateEngine.setValue(elem, 'test');
        ok(elem.value === 'test', 'set text value to test');
        ok(cp.TemplateEngine.getValue(elem) === elem.value, 'check get value');

        cp.TemplateEngine.setValue(elem, null);
        ok(elem.value === '', 'set text value to null');
        ok(cp.TemplateEngine.getValue(elem) === elem.value, 'check get value');
    });
});

test('img',function() {

    expect(4);
    Package()
    .use('tupai.ui.TemplateEngine')
    .run(function(cp) {
        var elem = cp.TemplateEngine.createElement(
            null,
            '<img data-ch-name="v">',
            {v: 'http://url/'}
        );

        ok(elem.src === 'http://url/', 'set img value');
        ok(cp.TemplateEngine.getValue(elem) === elem.src, 'check get value');

        var imgUrl = 'http://host/a.img';
        cp.TemplateEngine.setValue(elem, imgUrl);
        ok(elem.src === imgUrl, 'set img value');
        ok(cp.TemplateEngine.getValue(elem) === elem.src, 'check get value');
    });

});

test('nest value',function() {

    expect(2);
    Package()
    .use('tupai.ui.TemplateEngine')
    .run(function(cp) {
        var elem = cp.TemplateEngine.createElement(
            null,
            '<input type="text" data-ch-name="data.value">',
            {data: {value: 'test value'}}
        );

        ok(elem.value === 'test value', 'set text value');
        ok(cp.TemplateEngine.getValue(elem) === elem.value, 'check get value');
    });
});
