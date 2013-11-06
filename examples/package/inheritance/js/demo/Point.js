Package("demo")
.define("Point", function(cp) { return Package.Class.extend({
    /**
     * コンストラクタとして呼ばれる関数
     */
    initialize: function(x, y) {
        this.x = x;
        this.y = y;
    },
    toString: function() {
        return "["+this.x+","+this.y+"]";
    }
}); });
