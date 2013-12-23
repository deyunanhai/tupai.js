Ext.data.JsonP.tupai_TransitManager({"tagname":"class","name":"tupai.TransitManager","autodetected":{},"files":[{"filename":"TransitManager.js","href":"TransitManager.html#tupai-TransitManager"}],"author":[{"tagname":"author","name":"","email":"a href='bocelli.hu@gmail.com'"}],"docauthor":[{"tagname":"docauthor","name":"","email":"a href='bocelli.hu@gmail.com'"}],"since":"tupai.js 0.1","members":[{"name":"back","tagname":"method","owner":"tupai.TransitManager","id":"method-back","meta":{}},{"name":"backTo","tagname":"method","owner":"tupai.TransitManager","id":"method-backTo","meta":{}},{"name":"getHistories","tagname":"method","owner":"tupai.TransitManager","id":"method-getHistories","meta":{}},{"name":"getTitle","tagname":"method","owner":"tupai.TransitManager","id":"method-getTitle","meta":{}},{"name":"setTitle","tagname":"method","owner":"tupai.TransitManager","id":"method-setTitle","meta":{}},{"name":"transit","tagname":"method","owner":"tupai.TransitManager","id":"method-transit","meta":{}},{"name":"transitWithHistory","tagname":"method","owner":"tupai.TransitManager","id":"method-transitWithHistory","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-tupai.TransitManager","short_doc":"bocelli.hu\nbocelli.hu\nyou can use this class to transit ViewController by url. ...","component":false,"superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/TransitManager.html#tupai-TransitManager' target='_blank'>TransitManager.js</a></div></pre><div class='doc-contents'><p>bocelli.hu\nbocelli.hu\nyou can use this class to transit ViewController by url.</p>\n\n<p>you can initialize this Class by create Window use Config.</p>\n\n<h3>example (also see examples/twitter)</h3>\n\n<pre><code>new cp.Window({\n    routes: {\n        // call window.tansit('/root') will be show RootViewController\n        '/root' : cp.RootViewController,\n        // call window.tansit('/root/sub') will be show RootViewController and call RootViewController's transitController to show SubViewController.\n        '/root/sub' : cp.SubViewController\n    }\n})\n</code></pre>\n\n<h3>example</h3>\n\n<pre><code> var app = cp.ThisApplication.instance;\n var win = app.getWindow();\n win.transitWithHistory('/root', {hoge: 'hoge'});\n</code></pre>\n        <p>Available since: <b>tupai.js 0.1</b></p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-back' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.TransitManager'>tupai.TransitManager</span><br/><a href='source/TransitManager.html#tupai-TransitManager-method-back' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.TransitManager-method-back' class='name expandable'>back</a>( <span class='pre'>[targetUrl], [options], [transitOptions]</span> ) : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>back to previos ViewController ...</div><div class='long'><p>back to previos ViewController</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>targetUrl</span> : String (optional)<div class='sub-desc'><p>back to targetUrl, if the targetUrl is not in the stack,\n  will be clear stack and transit the targetUrl</p>\n</div></li><li><span class='pre'>options</span> : Object (optional)<div class='sub-desc'><p>ViewController options, used by new transit only.</p>\n</div></li><li><span class='pre'>transitOptions</span> : Object (optional)<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>0: failed, 1: back success, 2: new transit success</p>\n</div></li></ul></div></div></div><div id='method-backTo' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.TransitManager'>tupai.TransitManager</span><br/><a href='source/TransitManager.html#tupai-TransitManager-method-backTo' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.TransitManager-method-backTo' class='name expandable'>backTo</a>( <span class='pre'>index</span> ) : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>back to a specific URL from the history list. ...</div><div class='long'><p>back to a specific URL from the history list.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>index</span> : String<div class='sub-desc'><p>must be positive number</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>0: failed, 1: back success</p>\n</div></li></ul></div></div></div><div id='method-getHistories' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.TransitManager'>tupai.TransitManager</span><br/><a href='source/TransitManager.html#tupai-TransitManager-method-getHistories' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.TransitManager-method-getHistories' class='name expandable'>getHistories</a>( <span class='pre'></span> ) : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>get histories ...</div><div class='long'><p>get histories</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>histories</p>\n</div></li></ul></div></div></div><div id='method-getTitle' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.TransitManager'>tupai.TransitManager</span><br/><a href='source/TransitManager.html#tupai-TransitManager-method-getTitle' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.TransitManager-method-getTitle' class='name expandable'>getTitle</a>( <span class='pre'>url</span> ) : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>get title by url ...</div><div class='long'><p>get title by url</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>url</span> : String<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>title</p>\n</div></li></ul></div></div></div><div id='method-setTitle' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.TransitManager'>tupai.TransitManager</span><br/><a href='source/TransitManager.html#tupai-TransitManager-method-setTitle' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.TransitManager-method-setTitle' class='name expandable'>setTitle</a>( <span class='pre'>url, title</span> ) : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>set title with url ...</div><div class='long'><p>set title with url</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>url</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>title</span> : String<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>old value</p>\n</div></li></ul></div></div></div><div id='method-transit' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.TransitManager'>tupai.TransitManager</span><br/><a href='source/TransitManager.html#tupai-TransitManager-method-transit' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.TransitManager-method-transit' class='name expandable'>transit</a>( <span class='pre'>url, [options], [transitOptions]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>transit the url\nif you want to tansit with history please see transitWithHistory ...</div><div class='long'><p>transit the url\nif you want to tansit with history please see <a href=\"#!/api/tupai.TransitManager-method-transitWithHistory\" rel=\"tupai.TransitManager-method-transitWithHistory\" class=\"docClass\">transitWithHistory</a></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>url</span> : String<div class='sub-desc'><p>ViewController url</p>\n</div></li><li><span class='pre'>options</span> : Object (optional)<div class='sub-desc'><p>ViewController options</p>\n</div></li><li><span class='pre'>transitOptions</span> : Object (optional)<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-transitWithHistory' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.TransitManager'>tupai.TransitManager</span><br/><a href='source/TransitManager.html#tupai-TransitManager-method-transitWithHistory' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.TransitManager-method-transitWithHistory' class='name expandable'>transitWithHistory</a>( <span class='pre'>url, [options], [transitOptions]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>transit the url and put current to stack. ...</div><div class='long'><p>transit the url and put current to stack.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>url</span> : String<div class='sub-desc'><p>ViewController url</p>\n</div></li><li><span class='pre'>options</span> : Object (optional)<div class='sub-desc'><p>ViewController options</p>\n</div></li><li><span class='pre'>transitOptions</span> : Object (optional)<div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});