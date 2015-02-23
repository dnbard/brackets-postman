define(function(require, exports, module){
    var CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror"),
        ThemeManager = brackets.getModule("view/ThemeManager"),
        ko = require('../vendor/knockout'),
        _ = require('../vendor/lodash'),
        codemirrorInstance = null,
        codemirrorConfig = {
            theme: ThemeManager.getCurrentTheme().name
        },
        codemirror = require('../enums/codemirror');

    function getValue(valueAccessor){
        return valueAccessor() || '';
    }

    ko.bindingHandlers.codemirror = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel){
            //One instance of codemirror should be available
            if (!codemirrorInstance){
                codemirrorInstance = CodeMirror(function(elt){
                    element.parentNode.appendChild(elt);
                }, _.extend(codemirrorConfig, {
                    value: getValue(valueAccessor)
                }));

                $(element).trigger(codemirror.EVENTS.INIT);
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function(){
                //TODO: investigate how to and call codemirror disposer

                $(element.parentNode).find(codemirror.SELECTOR).remove();
                setTimeout(function(){
                    codemirrorInstance = null;
                }, 0);
            });
        },
        update: function(element, valueAccessor){
            codemirrorInstance.doc.setValue(getValue(valueAccessor));
        }
    }

    function setOption(option, value){
        codemirrorInstance.setOption(option, value);
    }

    ko.bindingHandlers.cmEditable = {
        init: function(element, valueAccessor){
            $(element).on(codemirror.EVENTS.INIT, function(){
                setOption(codemirror.OPTIONS.READONLY, !ko.unwrap(valueAccessor()));
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function(){
                $(element).off(codemirror.EVENTS.INIT);
            });
        },
        update: function(element, valueAccessor){
            if (codemirrorInstance){
                setOption(codemirror.OPTIONS.READONLY, !ko.unwrap(valueAccessor()));
            }
        }
    }

    ko.bindingHandlers.cmMode = {
        init: function(element, valueAccessor){
            $(element).on(codemirror.EVENTS.INIT, function(){
                setOption(codemirror.OPTIONS.MODE, ko.unwrap(valueAccessor()));
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function(){
                $(element).off(codemirror.EVENTS.INIT);
            });
        },
        update: function(element, valueAccessor){
            if (codemirrorInstance){
                setOption(codemirror.OPTIONS.MODE, ko.unwrap(valueAccessor()));
            }
        }
    }

    ko.bindingHandlers.cmValue = {
        init: function(element, valueAccessor, allBindingsAccessor, viewmodel){
            function onCodemirrorChange(codemirror, change){
                var cmValue = codemirror.getValue();
                viewmodel.codemirrorValue(cmValue);
            }

            function onCodemirrorInit(){
                codemirrorInstance.on(codemirror.EVENTS.CHANGE, onCodemirrorChange);
                onCodemirrorChange(codemirrorInstance, null);
            }

            if (!codemirrorInstance){
                $(element).on(codemirror.EVENTS.INIT, onCodemirrorInit);
            } else {
                onCodemirrorInit();
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function(){
                codemirrorInstance.off(codemirror.EVENTS.CHANGE, onCodemirrorChange);
                $(element).off(codemirror.EVENTS.INIT, onCodemirrorInit);
            });
        }
    }
});
