/**
 * @class   tupai.ui.TableView
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @docauthor <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 *
 * An instance of TableView is a means for displaying hierarchical lists of information.
 * You must define some delegate method in your ViewController
 *
 * ### delegate methods
 * -  numberOfRows(tableView);
 * -  cellForRowAtIndexPath(indexPath, tableView);
 * -  cellForRowAtTop(tableView);
 * -  cellForRowAtBottom(tableView);
 *
 * ### simple example
 *     Package()
 *     .use('tupai.ui.View')
 *     .use('tupai.ui.TableView')
 *     .use('tupai.ViewController')
 *     .define('ViewEventsPlugin', function(cp) { return cp.ViewController.extend({
 *         viewInit: function() {
 *             this._data = ['red','blue','green'];
 *             var view = new cp.TableView();
 *             view.setTableViewDelegate(this);
 *             this.setContentView(view);
 *         },
 *         numberOfRows: function() {
 *             return this._data.length;
 *         },
 *         cellForRowAtTop: function() {
 *             if(this._headerView == null) {
 *                 this._headerView = new cp.View();
 *                 this._headerView.setValue('header');
 *             }
 *             return this._headerView;
 *         },
 *         cellForRowAtBottom: function() {
 *             if(this._bottomView == null) {
 *                 this._bottomView = new cp.View();
 *                 this._bottomView.setValue('footer');
 *             }
 *             return this._bottomView;
 *         },
 *         cellForRowAtIndexPath: function(indexPath, tableView) {
 *             var row = indexPath.row;
 *             var cell = tableView.dequeueReusableCell('demo_cell');
 *             if(cell == null) {
 *                 cell = new cp.View();
 *             }
 *             cell.setValue(this._data[row]);
 *             return cell;
 *         }
 *     });});
 *
 */
Package('tupai.ui')
.use('tupai.ui.View')
.define('TableView', function(cp) { return cp.View.extend({
    _tableViewDelegate: undefined,

    /**
     * initialize
     * @param {Object} [args]
     * see {@link tupai.ui.View#initialize}
     *
     */
    initialize : function (args) {

        cp.View.prototype.initialize.apply(this, arguments);
        this._container = this;
    },

    /**
     * set table view delegate
     * @param {Object} delegate
     *
     * ### delegate methods
     * -  numberOfRows(tableView);
     * -  cellForRowAtIndexPath(indexPath, tableView);
     * -  cellForRowAtTop(tableView);
     * -  cellForRowAtBottom(tableView);
     */
    setTableViewDelegate: function(tableViewDelegate) {
        this._tableViewDelegate = tableViewDelegate;
    },

    /**
     * Returns a reusable table-view cell object located by its type
     * @param {String} type
     *
     */
    dequeueReusableCell: function(type) {
        return null;
    },

    /**
     * set filter to tableview to control show and hide the cell
     * @param {Function} callback
     *
     */
    setFilter: function(callback) {
        this.iterateChildren(function(cell) {

            if(callback(cell)) {
                cell.show();
            } else {
                cell.hide();
            }
        });
    },

    /**
     * load the top new data
     *
     */
    loadTopNewData: function() {
        return this.reloadRowsFrom();
    },

    /**
     * load the bottom new data
     *
     */
    loadBottomNewData: function(length) {
        var from=this._numberOfRows || 0;
        if(length !== undefined) {
            var newLength = this._tableViewDelegate.numberOfRows(this);
            from -= (length - (newLength - from));
        }
        return this.reloadRowsFrom(from);
    },

    /**
     * set table view container id
     *
     */
    setContainerId: function(id) {
        var v = this.findViewById(id);
        if(!v) throw new Error('can\'t find view by ' + id);
        this._container = v;
    },

    _addSubView: function(view) {
        this._container.addSubView(view);
    },

    /**
     * reload this tableView
     *
     */
    reloadData: function() {
        return this.reloadRowsFrom(0);
    },

    /**
     * reload this tableView
     *
     */
    reload: function() {
        return this.reloadRowsFrom(0);
    },

    /**
     * reload this tableView
     * @param {Number} [from]
     *
     */
    reloadRowsFrom: function(from) {

        if(from == undefined || from < 0) from = 0;

        var domFrom = from;
        if(this._hasHeader) domFrom ++;
        if(!this._container.clearChildrenByRange(domFrom)) return;

        if(!this._tableViewDelegate) {
            console.warn('table vie delegate not set. Please set it by tableview.setTableViewDelegate');
            return;
        }
        if(this._tableViewDelegate.cellForRowAtTop) {
            cell = this._tableViewDelegate.cellForRowAtTop(this);
            if(cell) {
                if(!this._hasHeader) {
                    this._addSubView(cell);
                }
                this._hasHeader = true;
            } else {
                if(this._hasHeader) {
                    this.removeChildAt(0);
                }
                this._hasHeader = false;
            }
        }

        var numberOfRows = this._tableViewDelegate.numberOfRows(this);
        this._numberOfRows = numberOfRows;
        if(from < numberOfRows) {
            for(var i=from;i<numberOfRows;i++) {
                var cell = this._tableViewDelegate.cellForRowAtIndexPath({row: i}, this);
                if(!cell) throw new Error('you need return view by row ' + i);
                this._addSubView(cell);
            }
        }

        if(this._tableViewDelegate.cellForRowAtBottom) {
            cell = this._tableViewDelegate.cellForRowAtBottom(this);
            cell && this._addSubView(cell);
        }
        this.render();
    }
});});
