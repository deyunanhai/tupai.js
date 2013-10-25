Package('jsonp')
.use('tupai.ViewController')
.use('tupai.ui.TableView')
.use('tupai.ui.View')
.use('jsonp.Templates')
.define('RootViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function() {
        this.SUPER.viewInit.apply(this, arguments);
        var view = new cp.TableView();
        view.setTableViewDelegate(this);
        this.setContentView(view);

        this.registerCacheObserver('timeline');
        this._cache = this.getCache('timeline');
    },
    didCacheChanged: function(e) {
        this.getContentView().reloadData();
    },
    _fetchNext: function() {
        this.executeApi({
            name: 'timeline',
            requestName: 'search',
            parameters: {q: 'NHK'}
        });
    },
    viewDidLoad: function (view) {
        this.SUPER.viewDidLoad.apply(this, arguments);
        this._fetchNext();
    },
    viewDidUnload: function(view) {
        this.SUPER.viewDidUnload.apply(this, arguments);
    },
    numberOfRows: function() {
        return this._cache.size();
    },
    cellForRowAtIndexPath: function(indexPath, tableView) {
        var row = indexPath.row;
        var cell = new cp.View({
            template: cp.Templates.get('jsonp.RootViewController.cell'),
            templateParameters: this._cache.get(row)
        });
        return cell;
    }
});});
