Ext.data.JsonP.tupai_events_Events({"tagname":"class","name":"tupai.events.Events","autodetected":{},"files":[{"filename":"Events.js","href":"Events.html#tupai-events-Events"}],"author":[{"tagname":"author","name":"","email":"a href='bocelli.hu@gmail.com'"}],"docauthor":[{"tagname":"docauthor","name":"","email":"a href='bocelli.hu@gmail.com'"}],"since":"tupai.js 0.1","members":[{"name":"addEventListener","tagname":"method","owner":"tupai.events.Events","id":"method-addEventListener","meta":{"deprecated":{"text":"<p>Use <a href=\"#!/api/tupai.events.Events-method-on\" rel=\"tupai.events.Events-method-on\" class=\"docClass\">on</a> instead.</p>\n","version":"0.4"}}},{"name":"clear","tagname":"method","owner":"tupai.events.Events","id":"method-clear","meta":{}},{"name":"fire","tagname":"method","owner":"tupai.events.Events","id":"method-fire","meta":{}},{"name":"fireDelegate","tagname":"method","owner":"tupai.events.Events","id":"method-fireDelegate","meta":{}},{"name":"initialize","tagname":"method","owner":"tupai.events.Events","id":"method-initialize","meta":{}},{"name":"off","tagname":"method","owner":"tupai.events.Events","id":"method-off","meta":{}},{"name":"on","tagname":"method","owner":"tupai.events.Events","id":"method-on","meta":{}},{"name":"once","tagname":"method","owner":"tupai.events.Events","id":"method-once","meta":{}},{"name":"removeAllEventListener","tagname":"method","owner":"tupai.events.Events","id":"method-removeAllEventListener","meta":{}},{"name":"removeEventListener","tagname":"method","owner":"tupai.events.Events","id":"method-removeEventListener","meta":{"deprecated":{"text":"<p>Use <a href=\"#!/api/tupai.events.Events-method-off\" rel=\"tupai.events.Events-method-off\" class=\"docClass\">off</a> instead.</p>\n","version":"0.4"}}}],"alternateClassNames":[],"aliases":{},"id":"class-tupai.events.Events","short_doc":"bocelli.hu\nbocelli.hu\n\nexample\n\nPackage('demo')\n.use('tupai.events.Events')\n.run(function(cp) {\n    var events = new ...","component":false,"superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/Events.html#tupai-events-Events' target='_blank'>Events.js</a></div></pre><div class='doc-contents'><p>bocelli.hu\nbocelli.hu</p>\n\n<h3>example</h3>\n\n<pre class='inline-example '><code>Package('demo')\n.use('<a href=\"#!/api/tupai.events.Events\" rel=\"tupai.events.Events\" class=\"docClass\">tupai.events.Events</a>')\n.run(function(cp) {\n    var events = new cp.Events();\n    events.on('hoge', function(e) {\n        logOnBody('hoge is fired. message is ' + e.message);\n    });\n\n    events.fire('hoge', {message: 'hoge hoge'});\n});\n</code></pre>\n\n<h3>fireDelegate example</h3>\n\n<pre class='inline-example '><code>Package('demo')\n.use('<a href=\"#!/api/tupai.events.Events\" rel=\"tupai.events.Events\" class=\"docClass\">tupai.events.Events</a>')\n.define('Test', function(cp) { return Package.Class.extend({\n    didReciveMessage: function(e) {\n        logOnBody('hoge\\'s didReciveMessage is fired. message is ' + e.message);\n    }\n});}).run(function(cp) {\n    var test = new cp.Test();\n    var events = new cp.Events();\n    events.on('hoge', test);\n    events.fireDelegate('hoge', 'didReciveMessage', {message: 'hoge hoge'});\n});\n</code></pre>\n\n<h3>Events base Model</h3>\n\n<pre class='inline-example '><code>Package('demo')\n.use('<a href=\"#!/api/tupai.events.Events\" rel=\"tupai.events.Events\" class=\"docClass\">tupai.events.Events</a>')\n.define('Model', function(cp) { return cp.Events.extend({\n    initialize: function() {\n        cp.Events.prototype.initialize.apply(this, arguments);\n        this._map = {};\n    },\n    set: function(obj) {\n        if(!obj) return;\n        for(var name in obj) {\n            var oldV = this._map[name];\n            var newV = obj[name];\n            this._map[name] = newV;\n            var type = (oldV?'change':'add');\n            this.fire(type+':'+name, {\n                name: name,\n                oldValue: oldV,\n                newValue: newV\n            });\n        }\n    }\n});}).run(function(cp) {\n    var test = new cp.Model();\n    test.on('change:color', function(args) {\n        logOnBody(args.name + ' is changed. ' + args.oldValue + ' -&gt; ' + args.newValue);\n    });\n    test.on('add:color', function(args) {\n        logOnBody(args.name + ' is added. ' + args.newValue);\n    });\n    test.set({\n        color: 'oldValue'\n    });\n    test.set({\n        color: 'newValue'\n    });\n});\n</code></pre>\n        <p>Available since: <b>tupai.js 0.1</b></p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-addEventListener' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.events.Events'>tupai.events.Events</span><br/><a href='source/Events.html#tupai-events-Events-method-addEventListener' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.events.Events-method-addEventListener' class='name expandable'>addEventListener</a>( <span class='pre'>type, listener, [first]</span> )<span class=\"signature\"><span class='deprecated' >deprecated</span></span></div><div class='description'><div class='short'>same as on. ...</div><div class='long'><p>same as on.</p>\n        <div class='rounded-box deprecated-box deprecated-tag-box'>\n        <p>This method has been <strong>deprected</strong> since 0.4</p>\n        <p>Use <a href=\"#!/api/tupai.events.Events-method-on\" rel=\"tupai.events.Events-method-on\" class=\"docClass\">on</a> instead.</p>\n\n        </div>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : String<div class='sub-desc'><p>eventType</p>\n</div></li><li><span class='pre'>listener</span> : Object<div class='sub-desc'><p>function or class instance</p>\n</div></li><li><span class='pre'>first</span> : boolean (optional)<div class='sub-desc'><p>add listener to the first of events pool</p>\n<p>Defaults to: <code>true</code></p></div></li></ul></div></div></div><div id='method-clear' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.events.Events'>tupai.events.Events</span><br/><a href='source/Events.html#tupai-events-Events-method-clear' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.events.Events-method-clear' class='name expandable'>clear</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>clear all listeners ...</div><div class='long'><p>clear all listeners</p>\n</div></div></div><div id='method-fire' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.events.Events'>tupai.events.Events</span><br/><a href='source/Events.html#tupai-events-Events-method-fire' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.events.Events-method-fire' class='name expandable'>fire</a>( <span class='pre'>type, [parameter]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>fire event ...</div><div class='long'><p>fire event</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>parameter</span> : Object (optional)<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-fireDelegate' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.events.Events'>tupai.events.Events</span><br/><a href='source/Events.html#tupai-events-Events-method-fireDelegate' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.events.Events-method-fireDelegate' class='name expandable'>fireDelegate</a>( <span class='pre'>name, type, [parameter]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>fire event and execute delegate method ...</div><div class='long'><p>fire event and execute delegate method</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>name</span> : String<div class='sub-desc'><p>event name</p>\n</div></li><li><span class='pre'>type</span> : String<div class='sub-desc'><p>delegate method name</p>\n</div></li><li><span class='pre'>parameter</span> : Object (optional)<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-initialize' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.events.Events'>tupai.events.Events</span><br/><a href='source/Events.html#tupai-events-Events-method-initialize' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.events.Events-method-initialize' class='name expandable'>initialize</a>( <span class='pre'>args</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>initialize ...</div><div class='long'><p>initialize</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>args</span> : Object<div class='sub-desc'></div></li></ul></div></div></div><div id='method-off' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.events.Events'>tupai.events.Events</span><br/><a href='source/Events.html#tupai-events-Events-method-off' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.events.Events-method-off' class='name expandable'>off</a>( <span class='pre'>type, listener</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>remove listener from events pool ...</div><div class='long'><p>remove listener from events pool</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : String<div class='sub-desc'><p>eventType</p>\n</div></li><li><span class='pre'>listener</span> : Object<div class='sub-desc'><p>function or class instance</p>\n</div></li></ul></div></div></div><div id='method-on' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.events.Events'>tupai.events.Events</span><br/><a href='source/Events.html#tupai-events-Events-method-on' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.events.Events-method-on' class='name expandable'>on</a>( <span class='pre'>type, listener, [first]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>add event listener ...</div><div class='long'><p>add event listener</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : String<div class='sub-desc'><p>eventType</p>\n</div></li><li><span class='pre'>listener</span> : Object<div class='sub-desc'><p>function or class instance</p>\n</div></li><li><span class='pre'>first</span> : boolean (optional)<div class='sub-desc'><p>add listener to the first of events pool</p>\n<p>Defaults to: <code>true</code></p></div></li></ul></div></div></div><div id='method-once' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.events.Events'>tupai.events.Events</span><br/><a href='source/Events.html#tupai-events-Events-method-once' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.events.Events-method-once' class='name expandable'>once</a>( <span class='pre'>type, listener, [first]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>add once event listener ...</div><div class='long'><p>add once event listener</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : String<div class='sub-desc'><p>eventType</p>\n</div></li><li><span class='pre'>listener</span> : Object<div class='sub-desc'><p>function or class instance</p>\n</div></li><li><span class='pre'>first</span> : boolean (optional)<div class='sub-desc'><p>add listener to the first of events pool</p>\n<p>Defaults to: <code>true</code></p></div></li></ul></div></div></div><div id='method-removeAllEventListener' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.events.Events'>tupai.events.Events</span><br/><a href='source/Events.html#tupai-events-Events-method-removeAllEventListener' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.events.Events-method-removeAllEventListener' class='name expandable'>removeAllEventListener</a>( <span class='pre'>type</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>remove all listeners ...</div><div class='long'><p>remove all listeners</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : String<div class='sub-desc'><p>eventType</p>\n</div></li></ul></div></div></div><div id='method-removeEventListener' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.events.Events'>tupai.events.Events</span><br/><a href='source/Events.html#tupai-events-Events-method-removeEventListener' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.events.Events-method-removeEventListener' class='name expandable'>removeEventListener</a>( <span class='pre'>type, listener</span> )<span class=\"signature\"><span class='deprecated' >deprecated</span></span></div><div class='description'><div class='short'>same as off. ...</div><div class='long'><p>same as off.</p>\n        <div class='rounded-box deprecated-box deprecated-tag-box'>\n        <p>This method has been <strong>deprected</strong> since 0.4</p>\n        <p>Use <a href=\"#!/api/tupai.events.Events-method-off\" rel=\"tupai.events.Events-method-off\" class=\"docClass\">off</a> instead.</p>\n\n        </div>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : String<div class='sub-desc'><p>eventType</p>\n</div></li><li><span class='pre'>listener</span> : Object<div class='sub-desc'><p>function or class instance</p>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});