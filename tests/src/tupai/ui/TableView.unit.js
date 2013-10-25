test('initialize',function() {

    Package()
    .use('tupai.ui.TableView')
    .run(function(cp) {
        var view = new cp.TableView();
        ok(view != undefined, 'initialize view');
    });
});

test('test delegate',function() {

    var cellLen = 10;
    Package()
    .use('tupai.ui.View')
    .use('tupai.ui.TableView')
    .use('tupai.Window')
    .run(function(cp) {
        var view = new cp.TableView();
        view.setTableViewDelegate({
            numberOfRows: function(v) {
                ok(v === view, 'numberOfRows');
                return cellLen;
            },
            cellForRowAtIndexPath: function(indexPath, v) {
                // will run 10 times
                ok(v === view, 'did render');
                var cell = new cp.View();
                cell.setValue(indexPath.row);
                return cell;
            },
            cellForRowAtTop: function(v) {
                ok(v === view, 'did unload');
                var header = new cp.View();
                header.setValue('header');
                return header;
            },
            cellForRowAtBottom: function(v) {
                ok(v === view, 'did show');
                var footer = new cp.View();
                footer.setValue('footer');
                return footer;
            }
        });
        var win = new cp.Window();
        win.addSubView(view);
        view.render();
        view.loadBottomNewData();

        var size = view.getChildrenSize();
        ok(size === cellLen+2, 'check table number of table cells');
        ok(view.getChildAt(0).getValue() === 'header', 'check header')
        ok(view.getChildAt(cellLen+1).getValue() === 'footer', 'check footer')
        for(var i=0;i<cellLen;i++) {
            ok(view.getChildAt(i+1).getValue() == i, 'check cell ' + i)
        }

        // load bottom data
        cellLen = 11;
        view.loadBottomNewData();
        var size = view.getChildrenSize();
        ok(size === cellLen+2, 'check table number of table cells');
        ok(view.getChildAt(0).getValue() === 'header', 'check header')
        ok(view.getChildAt(cellLen+1).getValue() === 'footer', 'check footer')
        for(var i=0;i<cellLen;i++) {
            ok(view.getChildAt(i+1).getValue() == i, 'check cell ' + i)
        }

        // load top data, this will reload all of tableView
        view.loadTopNewData();
        var size = view.getChildrenSize();
        ok(size === cellLen+2, 'check table number of table cells');
        ok(view.getChildAt(0).getValue() === 'header', 'check header')
        ok(view.getChildAt(cellLen+1).getValue() === 'footer', 'check footer')
        for(var i=0;i<cellLen;i++) {
            ok(view.getChildAt(i+1).getValue() == i, 'check cell ' + i)
        }
    });
    expect(72);
});

