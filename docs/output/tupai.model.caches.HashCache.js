Ext.data.JsonP.tupai_model_caches_HashCache({"tagname":"class","name":"tupai.model.caches.HashCache","autodetected":{},"files":[{"filename":"HashCache.js","href":"HashCache.html#tupai-model-caches-HashCache"}],"author":[{"tagname":"author","name":"","email":"a href='bocelli.hu@gmail.com'"}],"docauthor":[{"tagname":"docauthor","name":"","email":"a href='bocelli.hu@gmail.com'"}],"since":"tupai.js 0.1","members":[{"name":"clear","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-clear","meta":{}},{"name":"end","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-end","meta":{}},{"name":"filter","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-filter","meta":{}},{"name":"get","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-get","meta":{}},{"name":"getAttribute","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-getAttribute","meta":{}},{"name":"getCreated","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-getCreated","meta":{}},{"name":"getName","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-getName","meta":{}},{"name":"initialize","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-initialize","meta":{}},{"name":"iterator","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-iterator","meta":{}},{"name":"notifyDataSetChanged","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-notifyDataSetChanged","meta":{}},{"name":"push","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-push","meta":{}},{"name":"query","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-query","meta":{}},{"name":"remove","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-remove","meta":{}},{"name":"removeByElement","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-removeByElement","meta":{}},{"name":"setAttribute","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-setAttribute","meta":{}},{"name":"size","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-size","meta":{}},{"name":"unshift","tagname":"method","owner":"tupai.model.caches.HashCache","id":"method-unshift","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-tupai.model.caches.HashCache","component":false,"superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/HashCache.html#tupai-model-caches-HashCache' target='_blank'>HashCache.js</a></div></pre><div class='doc-contents'><p>bocelli.hu\nbocelli.hu\ncache data in hash by id\nsee <a href=\"#!/api/tupai.model.CacheManager\" rel=\"tupai.model.CacheManager\" class=\"docClass\">tupai.model.CacheManager</a></p>\n        <p>Available since: <b>tupai.js 0.1</b></p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-clear' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-clear' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-clear' class='name expandable'>clear</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>clear cache ...</div><div class='long'><p>clear cache</p>\n</div></div></div><div id='method-end' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-end' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-end' class='name expandable'>end</a>( <span class='pre'>[options]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>end edit the cache and notify cache has been changed ...</div><div class='long'><p>end edit the cache and notify cache has been changed</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>options</span> : Object (optional)<div class='sub-desc'><p>custom options</p>\n</div></li></ul></div></div></div><div id='method-filter' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-filter' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-filter' class='name expandable'>filter</a>( <span class='pre'>callback, [noNotify]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>set cache filter ...</div><div class='long'><p>set cache filter</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>callback</span> : Function<div class='sub-desc'>\n</div></li><li><span class='pre'>noNotify</span> : Boolean (optional)<div class='sub-desc'><p>set this parameter to true will not notify cache changed.</p>\n<p>Defaults to: <code>false</code></p></div></li></ul></div></div></div><div id='method-get' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-get' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-get' class='name expandable'>get</a>( <span class='pre'>id</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>get cache by id ...</div><div class='long'><p>get cache by id</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>id</span> : String<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getAttribute' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-getAttribute' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-getAttribute' class='name expandable'>getAttribute</a>( <span class='pre'>name</span> ) : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>get custom attribute by name. ...</div><div class='long'><p>get custom attribute by name.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>name</span> : String<div class='sub-desc'><p>attribute name</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>attribute value</p>\n</div></li></ul></div></div></div><div id='method-getCreated' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-getCreated' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-getCreated' class='name expandable'>getCreated</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>get the storage data created timestamp\nthis function will return null when memory cache only. ...</div><div class='long'><p>get the storage data created timestamp\nthis function will return null when memory cache only.</p>\n</div></div></div><div id='method-getName' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-getName' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-getName' class='name expandable'>getName</a>( <span class='pre'></span> ) : String<span class=\"signature\"></span></div><div class='description'><div class='short'>get cache name ...</div><div class='long'><p>get cache name</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>String</span><div class='sub-desc'><p>name</p>\n</div></li></ul></div></div></div><div id='method-initialize' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-initialize' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-initialize' class='name expandable'>initialize</a>( <span class='pre'>name, options</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>initialize ...</div><div class='long'><p>initialize</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>name</span> : String<div class='sub-desc'><p>cache name</p>\n</div></li><li><span class='pre'>options</span> : Object<div class='sub-desc'>\n<ul><li><span class='pre'>idField</span> : Object (optional)<div class='sub-desc'><p>data id field key</p>\n<p>Defaults to: <code>'id'</code></p></div></li><li><span class='pre'>memCache</span> : Object (optional)<div class='sub-desc'><p>memory cache config</p>\n<ul><li><span class='pre'>limit</span> : Number (optional)<div class='sub-desc'><p>memory cache limit</p>\n</div></li><li><span class='pre'>overflowRemoveSize</span> : Number (optional)<div class='sub-desc'><p>number of remove items when reach limit of cache</p>\n</div></li></ul></div></li><li><span class='pre'>localStorage</span> : Object (optional)<div class='sub-desc'><p>use localStorage</p>\n</div></li><li><span class='pre'>sesseionStorage</span> : Object (optional)<div class='sub-desc'><p>use sesseionStorage\nsee <a href=\"#!/api/tupai.model.CacheManager-method-createCache\" rel=\"tupai.model.CacheManager-method-createCache\" class=\"docClass\">tupai.model.CacheManager.createCache</a></p>\n</div></li></ul></div></li></ul></div></div></div><div id='method-iterator' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-iterator' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-iterator' class='name expandable'>iterator</a>( <span class='pre'>callback</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>iterate cache item ...</div><div class='long'><p>iterate cache item</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>callback</span> : Function<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-notifyDataSetChanged' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-notifyDataSetChanged' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-notifyDataSetChanged' class='name expandable'>notifyDataSetChanged</a>( <span class='pre'>[options]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>notify cache has been changed ...</div><div class='long'><p>notify cache has been changed</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>options</span> : Object (optional)<div class='sub-desc'><p>custom options</p>\n</div></li></ul></div></div></div><div id='method-push' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-push' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-push' class='name expandable'>push</a>( <span class='pre'>data</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>push data to cache. ...</div><div class='long'><p>push data to cache. the method will not notify cache changed.\nyou need to call end function to end edit and notify cache changed.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>data</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-query' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-query' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-query' class='name expandable'>query</a>( <span class='pre'>args</span> ) : <a href=\"#!/api/tupai.model.DataSet\" rel=\"tupai.model.DataSet\" class=\"docClass\">tupai.model.DataSet</a><span class=\"signature\"></span></div><div class='description'><div class='short'>query cache and return DataSet ...</div><div class='long'><p>query cache and return <a href=\"#!/api/tupai.model.DataSet\" rel=\"tupai.model.DataSet\" class=\"docClass\">DataSet</a></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>args</span> : Object<div class='sub-desc'><p>sess <a href=\"#!/api/tupai.model.DataSet\" rel=\"tupai.model.DataSet\" class=\"docClass\">tupai.model.DataSet</a></p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/tupai.model.DataSet\" rel=\"tupai.model.DataSet\" class=\"docClass\">tupai.model.DataSet</a></span><div class='sub-desc'><p>DataSet</p>\n</div></li></ul></div></div></div><div id='method-remove' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-remove' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-remove' class='name expandable'>remove</a>( <span class='pre'>id</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>remove element by id ...</div><div class='long'><p>remove element by id</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>id</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-removeByElement' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-removeByElement' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-removeByElement' class='name expandable'>removeByElement</a>( <span class='pre'>element</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>remove element ...</div><div class='long'><p>remove element</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>element</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-setAttribute' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-setAttribute' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-setAttribute' class='name expandable'>setAttribute</a>( <span class='pre'>name, value</span> ) : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>set custom attribute by name. ...</div><div class='long'><p>set custom attribute by name.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>name</span> : String<div class='sub-desc'><p>attribute name</p>\n</div></li><li><span class='pre'>value</span> : Object<div class='sub-desc'><p>attribute value</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>old attribute value</p>\n</div></li></ul></div></div></div><div id='method-size' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-size' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-size' class='name expandable'>size</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>get size of cache items ...</div><div class='long'><p>get size of cache items</p>\n</div></div></div><div id='method-unshift' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='tupai.model.caches.HashCache'>tupai.model.caches.HashCache</span><br/><a href='source/HashCache.html#tupai-model-caches-HashCache-method-unshift' target='_blank' class='view-source'>view source</a></div><a href='#!/api/tupai.model.caches.HashCache-method-unshift' class='name expandable'>unshift</a>( <span class='pre'>data</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>push data to top of cache ...</div><div class='long'><p>push data to top of cache</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>data</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});