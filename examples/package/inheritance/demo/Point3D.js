Package("demo")
.use('demo.Point')
.define("Point3D", function(cp) { return cp.Point.extend({
    /**
     * コンストラクタとして呼ばれる関数
     */
    initialize: function(x, y, z) {
        cp.Point.prototype.initialize(x, y);
        this.z = z;
    },
    toString: function() {
/*         return "["+this.x+","+this.y+","+this.z+"]"; */
        return "["+this.x+","+this.y+","+this.z+"]";
    }
}); });
