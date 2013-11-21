test('initialize',function() {

    Package()
    .use('tupai.events.Events')
    .run(function(cp) {
        var events = new cp.Events();
        ok(events != undefined, 'initialize Events');
    });
});

test('test events',function() {

    Package()
    .use('tupai.events.Events')
    .run(function(cp) {
        var events = new cp.Events();
        var event1 = function(e) {
            ok(true, 'event1');
        };
        var event2 = function(e) {
            ok(true, 'event2');
        };
        events.addEventListener('test1', event1);
        events.addEventListener('test1', event2);
        events.addEventListener('test1', event2);
        events.addEventListener('test2', event2);

        events.fire('test1');

        events.removeEventListener('test1', event1);
        events.removeEventListener('test1', event2);
        events.fire('test1'); // nothing to do

        events.fire('test2');

        events.once('test3', event1);
        events.fire('test3');
        events.fire('test3');
    });
    expect(4);
});

test('test delegate',function() {

    Package()
    .use('tupai.events.Events')
    .run(function(cp) {
        var events = new cp.Events();
        var delegate1 = {
            event1: function(e) {
                ok(true, 'event1');
            },
            event2: function(e) {
                ok(true, 'event2');
            }
        };
        var delegate2 = {
            event1: function(e) {
                ok(true, 'event1');
            },
            event2: function(e) {
                ok(true, 'event2');
            }
        };
        events.addEventListener('test1', delegate1);
        events.addEventListener('test1', delegate2);
        events.addEventListener('test1', delegate2);
        events.addEventListener('test2', delegate2);

        events.fireDelegate('test1', 'event1');
        events.fireDelegate('test1', 'event2');
        events.fireDelegate('test1', 'event3'); // nothing to do

        events.removeEventListener('test1', delegate1);
        events.removeEventListener('test1', delegate2);
        events.fireDelegate('test1', 'event1'); // nothing to do
        events.fireDelegate('test1', 'event2'); // nothing to do

        events.fireDelegate('test2', 'event1');
        events.fireDelegate('test2', 'event2');
    });
    expect(6);
});
