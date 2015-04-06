tupai.jsは大規模JavaScript開発のためのMVCフレームワーク

### package管理
* 同じ役割を持つクラスを１つのパッケージにまとめることにより、そのクラスの持つ意味がわかりやすくなります。
* 同じ名前を持つクラスが複数ある場合、名前の衝突を避けることができます。
* パッケージを使用することにより、クラス・メンバ変数・メソッド・コンストラクタにアクセス制限をつけることができます

### HTML Template
* マークアップとエンジニアの役割分担が明確になります。
* カスタマイズ可能なテンプレートエンジン（mustacheなどと連携することも可能）

### CLI充実
* プロジェクトやソースコードの自動作成
* テスト用サーバ
* リリース用ファイルの作成


# hello world

nodejsをインストール（ダウンロード）した上で、tupaijsをインストール

    npm install tupaijs

tupaijsコマンドを使って、プロジェクトを作成

    tupaijs new helloworld

サーバを起動

    cd helloworld; tupaijs server

ブラウザーでプレビュー

    http://localhost:9800

That's ALL!!!


# create master detail view

tupaijsコマンとで、SubViewControllerを追加

    tupaijs g controller sub

templates/helloword/Templates.htmlを編集
data-ch-templateが[helloworld.RootViewController.content]のdivに、buttonを追加

    <button data-ch-id="btnGotoSub">goto sub</button>

同じく、data-ch-templateが[helloworld.SubViewController.content]のdivに、buttonを追加

    <button data-ch-id="btnBack">back</button>

### RootViewControllerを編集

まず、画面に表示されているテキストの内容を変更するために、viewInit　functionは下記のように修正

    viewInit: function() {
        var view = new cp.View({
           template:cp.Templates.get('helloworld.RootViewController.content'),
            templateParameters: {
                lbl: 'RootViewController'
            }
        });
        this.setContentView(view);
    },

次は、viewDidLoad　functionは下記のように、ボタンの処理を追加

    viewDidLoad: function (view) {
        var This = this;
        view.findViewById('btnGotoSub').bind('click', function() {
            This._window.transitWithHistory('/sub');
        });
    },


### SubViewControllerを編集

まず、画面に表示されているテキストの内容を変更するために、viewInit　functionは下記のように修正

    viewInit: function() {
        var view = new cp.View({
            template: cp.Templates.get('helloworld.SubViewController.content'),
            templateParameters: {
                lbl: 'SubViewController'
            }
        });
        this.setContentView(view);
    },

次は、viewDidLoad　functionは下記のように、戻るボタンの処理を追加

    var This = this;
    view.findViewById('btnBack').bind('click', function() {
        This._window.back();
    });

[view source](examples/helloworld)

License
=========
[MIT](LICENSE)

Links
=========
[Web Site](http://tupaijs.com/)
[Examples](http://tupaijs.com/examples.html)
[API Documentation](http://tupaijs.com/docs/)

Author
=========

bocelli.hu <bocelli.hu@gmail.com>

