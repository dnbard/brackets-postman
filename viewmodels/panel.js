define(function(require, exports, module){
    var ko = require('../vendor/knockout'),
        _ = require('../vendor/lodash'),
        Methods = require('../enums/methods'),
        HistoryItem = require('../models/historyItem');

    require('../bindings/enterKey');

    function PanelViewModel(options){
        this.element = options.panel;
        this.$icon = options.$icon;

        this.authMode = ko.observable('normal');

        this.url = ko.observable(null);
        this.method = ko.observable(_.first(Methods));

        this.isError = ko.observable(false);

        this.history = ko.observableArray([]);
        this.lastHistoryItem = ko.computed(function(){
            return this.history()[0];
        }, this);

        this.isShowErrorResult = ko.computed(function(){
            var lastHistoryItem =  this.lastHistoryItem();
            return lastHistoryItem && lastHistoryItem.isError;
        }, this);
    }

    PanelViewModel.prototype.close = function(){
        this.element.hide();
        this.$icon.removeClass('selected');
    }

    PanelViewModel.prototype.onSendClick = function(){
        var url = this.url() || '',
            self = this;

        if (!url){
            this.history.unshift(new HistoryItem({
                url: url,
                isError: true
            }));
            return;
        }

        if (url.indexOf('http') === -1){
            url = 'http://' + url;
        }

        $.ajax({
            url: url,
            method: this.method()
        }).success(function(data, textStatus, jqXHR){
            self.history.unshift(new HistoryItem({
                url: url,
                isError: false,
                statusCode: textStatus
            }));
        }).error(function(jqXHR, textStatus, errorThrown){
            self.history.unshift(new HistoryItem({
                url: url,
                isError: true,
                statusCode: textStatus
            }));
        });

        return false;
    }

    PanelViewModel.prototype.getMethods = function(){
        return _.map(Methods, function(m){
            return { name: m, id: m };
        });
    }

    module.exports = PanelViewModel;
});
