define(function(require, exports, module){
    function init(){
        return $("<a id='postman-toolbar-icon' href='#'></a>")
            .appendTo($("#main-toolbar .buttons"));
    }

    exports.init = init;
});
