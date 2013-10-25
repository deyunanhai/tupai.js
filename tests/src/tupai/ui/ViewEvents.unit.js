test('basic',function() {

    Package()
    .use('tupai.ui.ViewEvents')
    .run(function(cp) {
        var elem = document.createElement('div');

        var clickEvent = function(e) {
            ok(true, 'check click event')
        }

        function click(elem){
            var ev = document.createEvent("MouseEvent");
            ev.initMouseEvent(
                "click",
                true /* bubble */,
                true /* cancelable */,
                window, null,
                0, 0, 0, 0, /* coordinates */
                false, false, false, false, /* modifier keys */
                0 /*left*/, null
            );
            elem.dispatchEvent(ev);
        }

        cp.ViewEvents.bind(elem, 'click', clickEvent);
        click(elem);

        cp.ViewEvents.unbind(elem, 'click', clickEvent);
        click(elem);
    });
    expect(1);
});

