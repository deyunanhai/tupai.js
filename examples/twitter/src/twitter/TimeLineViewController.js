Package('twitter')
.use('tupai.ViewController')
.use('tupai.ui.TableView')
.use('tupai.ui.View')
.use('twitter.Templates')
.use('tupai.Application')
.use('twitter.ui.TimeLineTableViewCell')
.define('TimeLineViewController', function(cp) { return cp.ViewController.extend({
    viewInit: function() {
        var tableView = new cp.TableView();
        tableView.setTableViewDelegate(this);
        this.setContentView(tableView);
        this.registerCacheObserver('timeline', this);
        this._cache = this.getCache('timeline');
    },
    didCacheChanged: function(e) {
        //console.log('did cache changed ' + JSON.stringify(e));
        this.getContentView().reloadData();
    },
    viewDidLoad: function() {
        this._fetchNext();
    },
    _fetchNext: function() {
        this.executeApi({
            name: 'timeline',
            requestName: 'search',
            parameters: {q: 'NHK'}
        });
    },
    _fetchPrev: function() {
        this.executeApi({
            name: 'timeline',
            requestName: 'search',
            attributes: {old: true}
        });
    },
    numberOfRows: function() {
        return this._cache.size();
    },
    cellForRowAtBottom: function() {
        var nextPage = cp.Application.instance.getAttribute('nextPage');
        if(!nextPage) return undefined;

        var v = new cp.View({
            template: cp.Templates.get('more_link')
        });
        var THIS = this;
        v.bind('click', function() {
            THIS._fetchPrev();
        });
        return v;
    },
    cellForRowAtIndexPath: function(indexPath, tableView) {
        var row = indexPath.row;
        var cell = tableView.dequeueReusableCell('timeline_table_cell');
        if(cell == null) {
            cell = new cp.TimeLineTableViewCell();
        }
        cell.setData(this._cache.get(row));
        return cell;
    }
});});
