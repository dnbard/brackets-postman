define(function(require, exports, module){
    var stylesheets = ["../styles/common.less"],
        _ = brackets.getModule("thirdparty/lodash");

    exports.load = function(){
        var ExtensionUtils  = brackets.getModule("utils/ExtensionUtils");

        _.each(stylesheets, function(stylesheet){
            ExtensionUtils.loadStyleSheet(module, stylesheet);
        });
    }
});
