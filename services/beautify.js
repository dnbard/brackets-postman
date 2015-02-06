define(function(require, exports, module){
    module.exports = {
        js: require('../vendor/beautify/lib/beautify').js_beautify,
        css: require('../vendor/beautify/lib/beautify-css').css_beautify,
        html: require('../vendor/beautify/lib/beautify-html').html_beautify
    };
});
