/**
 * 呼び出し関数
 * package の中に入れる
 */
Package("demo")
.use("demo.SlotMachine")
.run(function(cp) {
    new cp.SlotMachine();
});
