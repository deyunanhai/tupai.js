Package(<%if(packageName){%>'<%=packageName%>'<%}%>)
.use('tupai.ui.View')
.define('<%=className%>', function(cp) { return cp.View.extend({
    initialize: function() {
        this.SUPER.initialize.apply(this, arguments);
    },
    getTemplate: function() {
        return this.SUPER.getTemplate.apply(this, arguments);
    },
    getTemplateParameters: function() {
        return this.SUPER.getTemplateParameters.apply(this, arguments);
    },
    setValue: function(val) {
        return this.SUPER.setValue.apply(this, arguments);
    },
    getValue: function() {
        return this.SUPER.getValue.apply(this, arguments);
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
