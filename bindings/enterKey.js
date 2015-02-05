define(function(require){
    var ko = require('../vendor/knockout');

    ko.bindingHandlers.enterKey = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var allBindings = allBindingsAccessor();
            $(element).keypress(function (event) {
                var keyCode = (event.which ? event.which : event.keyCode);
                if (keyCode === 13) {
                    allBindings.enterKey.call(viewModel);
                    return false;
                }
                return true;
            });
        }
    };
});
