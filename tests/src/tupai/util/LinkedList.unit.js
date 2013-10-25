test('initialize',function() {

    Package()
    .use('tupai.util.LinkedList')
    .run(function(cp) {

        var list = new cp.LinkedList();
        ok(list, 'check initialize');
    });
});

test('basic functions',function() {

    Package()
    .use('tupai.util.LinkedList')
    .run(function(cp) {

        var list = new cp.LinkedList();
        equal(list.size(), 0, 'check size');

        var data1 = {id: 'id1', value: 'value1'};
        var data2 = {id: 'id2', value: 'value2'};
        list.push(data1);

        equal(list.get(0), data1, 'check push');
        equal(list.size(), 1, 'check size');

        var deletedData;

        //removeByIndex
        deletedData = list.removeByIndex(0);
        equal(list.size(), 0, 'check size');
        equal(deletedData, data1, 'check deleted data');
        equal(list.get(0), null, 'check get');
        equal(list.removeByIndex(0), null, 'check deleted data');

        // unshift
        list.unshift(data1);
        equal(list.size(), 1, 'check size');
        equal(list.get(0), data1, 'check get');

        // removeByElement
        deletedData = list.removeByElement(data1);
        equal(list.size(), 0, 'check size');
        equal(deletedData, data1, 'check deleted data');

        // push duplicate data
        list.push(data1);
        list.push(data1);
        equal(list.size(), 2, 'check size');

        // clear
        list.clear();
        equal(list.size(), 0, 'check size');

        //pop
        list.push(data1);
        list.push(data2);
        deepEqual(list.pop(), data2, 'check pop');
        equal(list.size(), 1, 'check size');

        //shift
        list.clear();
        list.push(data1);
        list.push(data2);
        deepEqual(list.shift(), data1, 'check shift');
        equal(list.size(), 1, 'check size');

        //removeLast
        list.clear();
        list.concat([data1, data2]);
        deepEqual(list.removeLast(), data2, 'check removeLast');
        equal(list.size(), 1, 'check size');

        //removeFirst
        list.clear();
        list.concatFirst([data1, data2]);
        deepEqual(list.removeFirst(), data1, 'check removeFirst');
        equal(list.size(), 1, 'check size');

        //iterator
        var data3 = {id: 'id3', value: 'value3'};
        var data4 = {id: 'id4', value: 'value4'};
        list.clear();
        list.concat([data3, data4]);
        list.concatFirst([data1, data2]);
        equal(list.size(), 4, 'check size');
        list.filter(function(data, index) {
            var str = (index+1);
            deepEqual(data, {id: 'id'+str, value: 'value'+str}, 'check element');
            return false;
        });
        equal(list.size(), 0, 'check size');

        list.concatFirst([data1, data2]);
        list.concat([data3, data4]);

        var index=0;
        list.iterator(function(data) {
            var str = (index+1);
            deepEqual(data, {id: 'id'+str, value: 'value'+str}, 'check element');
            index++;
        });
    });
});

