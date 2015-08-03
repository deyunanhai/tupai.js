tupai.js is a minimal and flexible javascript mvc framework. providing a robust set of features for building single and multi-page.


### Package
* Namespaces are needed because there can be many functions, variables for classes in one program and they can conflict with the existing names of variables, functions and classes.

### HTML Template
* Roles of engineers and mark-up is clear.
* Customizable template engine. (You can work with, such as mustache).

### CLI
* Automatic source code generation.
* Start a test server.
* Make files for release.
* etc ...

# Getting started
Install with npm. If you were not installed node, install node (Joyent, Inc,).

    npm install tupaijs

Generate project Use tupaijs command.

    tupaijs new helloworld

Start server.

    cd helloworld; tupaijs server

Open in browser.

    http://localhost:9800

That's ALL!!!


# Creating master detail view

Generate controller.

    tupaijs g controller sub

Edit templates/helloworld/Templates.html add an button to "div#helloworld.RootViewController.content".

    <button data-ch-id="btnGotoSub">goto sub</button>

Edit templates/helloworld/Templates.html add an button to "div#helloworld.SubViewController.content".

    <button data-ch-id="btnBack">back</button>

### Edit RootViewController.js

First, in order to change the contents of the text that is displayed on the screen, viewInit function is modified as follows.

    viewInit: function() {
        var view = new cp.View({
           template:cp.Templates.get('helloworld.RootViewController.content'),
            templateParameters: {
                lbl: 'RootViewController'
            }
        });
        this.setContentView(view);
    },

ViewDidLoad function is as follows, adding the processing of the back button.

    viewDidLoad: function (view) {
        var This = this;
        view.findViewById('btnGotoSub').bind('click', function() {
            This._window.transitWithHistory('/sub');
        });
    },


### Edit SubViewController.js

First, in order to change the contents of the text that is displayed on the screen, viewInit function is modified as follows.

    viewInit: function() {
        var view = new cp.View({
            template: cp.Templates.get('helloworld.SubViewController.content'),
            templateParameters: {
                lbl: 'SubViewController'
            }
        });
        this.setContentView(view);
    },

ViewDidLoad function is as follows, adding the processing of the back button.

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

