define(function(require, exports, module){
    var Beautifier = {
        js : require('../vendor/beautify/lib/beautify').js_beautify,
        css : require('../vendor/beautify/lib/beautify-css').css_beautify,
        html : require('../vendor/beautify/lib/beautify-html').html_beautify
    }

    Beautifier.do = function(data){
        var result = null;

        if (typeof data !== "string"){
            data = JSON.stringify(data);
        }

        try{
            result = Beautifier.js(data);
            return result;
        } catch(e){ }

        try{
            result = Beautifier.css(data);
            return result;
        } catch(e){ }

        try{
            result = Beautifier.html(data);
            return result;
        } catch(e){ }

        return result;
    }

    module.exports = Beautifier;
});
