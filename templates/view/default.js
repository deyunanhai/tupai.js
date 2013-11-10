Package(<%if(packageName){%>'<%=packageName%>'<%}%>)
.use('tupai.ui.View')
.define('<%=className%>', function(cp) { return cp.View.extend({
    initialize: function() {
        cp.View.prototype.initialize.apply(this, arguments);
    },
    getTemplate: function() {
        return cp.View.prototype.getTemplate.apply(this, arguments);
    },
    getTemplateParameters: function() {
        return cp.View.prototype.getTemplateParameters.apply(this, arguments);
    },
    setValue: function(val) {
        return cp.View.prototype.setValue.apply(this, arguments);
    },
    getValue: function() {
        return cp.View.prototype.getValue.apply(this, arguments);
    },
    willRender: function() {
    },
    didRender: function() {
    },
    didLoad: function() {
    },
    didUnload: function() {
    }
});});
