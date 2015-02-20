define(function(require){
    var ko = require('../vendor/knockout');

    ko.bindingHandlers.enterKey = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var allBindings = allBindingsAccessor();

            function onKeyPress(event){
                var keyCode = (event.which ? event.which : event.keyCode);
                if (keyCode === 13) {
                    allBindings.enterKey.call(viewModel);
                    return false;
                }
                return true;
            }

            $(element).on('keypress', onKeyPress);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function(){
                $(element).off('keypress', onKeyPress);
            });
        }
    };
});
