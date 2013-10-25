Package("demo")
.define("SlotMachine", function(cp) { return Package.Class.extend({
    /**
     * コンストラクタとして呼ばれる関数
     */
    initialize: function() {
        this.nums = [
            document.getElementById("num0"),
            document.getElementById("num1"),
            document.getElementById("num2")
        ];
        var that = this;
        this.nums[0].onclick = function() {
            that.stopSlot(0);
        }
        this.nums[1].onclick = function() {
            that.stopSlot(1);
        }
        this.nums[2].onclick = function() {
            that.stopSlot(2);
        }
        this.startSlot();
    },
    /**
     * スロットを回す
     */
    startSlot: function() {
        this.timers = [];
        this.decidedNums = [];
        this.stopCount = 0;
        this.runSlot(0);
        this.runSlot(1);
        this.runSlot(2);
    },
    /**
     * 指定番号のスロットを停止する
     * @param {number} スロット番号
     */
    stopSlot: function(n) {
        if (typeof this.decidedNums[n] !== 'undefined') {
            return;
        }

        clearTimeout(this.timers[n]);
        this.decidedNums[n] = this.nums[n].value;
        this.stopCount++;
        if (this.stopCount == 3) {
            this.checkSlot();
        }
    },
    /**
     * スロットがそろっているか確認
     */
    checkSlot: function() {
        this.decidedNums.sort();

        if (this.decidedNums[0] == this.decidedNums[1] && this.decidedNums[1] == this.decidedNums[2]) {
            alert("そろった");
        }  else if (this.decidedNums[0] == this.decidedNums[1] || this.decidedNums[1] == this.decidedNums[2] || this.decidedNums[0] == this.decidedNums[2]) {
            alert("2 つだけそろった");
        } else {
            alert("残念");
        }
    },
    /**
     * 指定番号のスロットを 50ms ごとにランダムで切り替える
     * @param {number} スロット番号
     */
    runSlot: function(n) {
        var that = this;
        this.nums[n].value = Math.floor(Math.random() * 10);
        this.timers[n] = setTimeout(function() {
            that.runSlot(n)
        }, 50);
    }
}); });

