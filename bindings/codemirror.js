define(function(require, exports, module){
    var CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror"),
        ThemeManager = brackets.getModule("view/ThemeManager"),
        ko = require('../vendor/knockout'),
        _ = require('../vendor/lodash'),
        Q = require('../vendor/q'),
        codemirrorInstance = null,
        codemirrorConfig = {
            mode: {
                name: "javascript",
                json: true
            },
            theme: ThemeManager.getCurrentTheme().name
        },
        defer = Q.defer(),
        promise = defer.promise;

    function getValue(valueAccessor){
        return valueAccessor() || '';
    }

    ko.bindingHandlers.codeMirror = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel){
            //One instance of codemirror should be available
            if (!codemirrorInstance){
                codemirrorInstance = CodeMirror(function(elt){
                    element.parentNode.appendChild(elt);
                }, _.extend(codemirrorConfig, {
                    value: getValue(valueAccessor)
                }));

                defer.resolve(codemirrorInstance);
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function(){
                //TODO: investigate how to and call codemirror disposer

                $(element.parentNode).find('.CodeMirror').remove();
                codemirrorInstance = null;

                defer = Q.defer();
                promise = defer.promise;
            });
        },
        update: function(element, valueAccessor){
            codemirrorInstance.doc.setValue(getValue(valueAccessor));
        }
    }

    function setEditable(value){
        codemirrorInstance.setOption('readOnly', !value);
    }

    ko.bindingHandlers.cmEditable = {
        update: function(element, valueAccessor){
            if (!codemirrorInstance){
                promise.then(function(){
                    return valueAccessor();
                }).then(setEditable);
            } else {
                setEditable(valueAccessor());
            }
        }
    }
});
