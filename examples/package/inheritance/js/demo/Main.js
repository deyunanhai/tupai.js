/**
 * 呼び出し関数
 * package の中に入れる
 */
Package("demo")
.use("demo.Point")
.use("demo.Point3D")
.run(function(cp) {
    var container = document.getElementById("container");

    var point = new cp.Point(10, 20);
    var pointText = document.createTextNode(point.toString());
    container.appendChild(pointText);

    var point3 = new cp.Point3D(10, 20, 30);

    console.log(point3.x);  // ここが undefined になる
    console.log(point3.y);  // ここが undefined になる
    console.log(point3.z);
    var point3Text = document.createTextNode(point3.toString());
    container.appendChild(point3Text);
});
