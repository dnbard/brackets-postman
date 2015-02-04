define(function(require, exports, module){
    var ko = require('../vendor/knockout');

    function PanelViewModel(options){
        this.element = options.panel;
        this.$icon = options.$icon;

        this.authMode = ko.observable('normal');
    }

    PanelViewModel.prototype.close = function(){
        this.element.hide();
        this.$icon.removeClass('selected');
    }

    module.exports = PanelViewModel;
});
