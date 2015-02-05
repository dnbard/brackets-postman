define(function(require, exports, module){
    function HistoryItem(options){
        this.url = options.url;
        this.isError = options.isError || false;
        this.statusCode = options.statusCode || null;
    }

    module.exports = HistoryItem;
});
