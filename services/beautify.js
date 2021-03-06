define(function(require, exports, module){
    var Beautifier = {
        js : require('../vendor/beautify/lib/beautify').js_beautify,
        css : require('../vendor/beautify/lib/beautify-css').css_beautify,
        html : require('../vendor/beautify/lib/beautify-html').html_beautify
    }

    Beautifier.do = function(data, options){
        var result = null;

        if (typeof data !== "string"){
            data = JSON.stringify(data);
        }

        if (/\!doctype/i.test(data)){
            try{
                result = Beautifier.html(data, options);
                return result;
            } catch(e){ }
        }

        try{
            result = Beautifier.js(data, options);
            return result;
        } catch(e){ }

        try{
            result = Beautifier.css(data, options);
            return result;
        } catch(e){ }

        try{
            result = Beautifier.html(data, options);
            return result;
        } catch(e){ }

        return result;
    }

    module.exports = Beautifier;
});
