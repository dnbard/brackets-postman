define(function(require, exports, module){
    var stylesLoader = require('./loaders/styles'),
        iconService = require('./services/icon'),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        panelTemplate = require('text!./templates/panel.html'),
        panelId = 'brackets-postman__panel',
        ko = require('./vendor/knockout'),
        PanelViewModel = require('./viewmodels/main');

    var panel = null;

    stylesLoader.load();
    iconService.init().click(function(event){
        var $icon = $(event.target),
            $panel;

        if (!panel){
            $panel = $(_.template(panelTemplate)({
                id: panelId
            }));

            panel = WorkspaceManager.createBottomPanel(panelId, $panel, 100);
            ko.applyBindings(new PanelViewModel({
                panel: panel,
                $icon: $icon
            }), $panel[0]);
        }

        if (panel.isVisible()){
            panel.hide();
            $icon.removeClass('selected');
        } else {
            panel.show();
            $icon.addClass('selected');
        }
    });
});
