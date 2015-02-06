define(function(require, exports, module){
    var ko = require('../vendor/knockout'),
        _ = require('../vendor/lodash'),
        Methods = require('../enums/methods'),
        HistoryItem = require('../models/historyItem'),
        beautify = require('../services/beautify');

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

        this.isErrorResponse = ko.computed(function(){
            var lastHistoryItem =  this.lastHistoryItem();
            return lastHistoryItem && lastHistoryItem.isError;
        }, this);

        this.isResponse = ko.computed(function(){
            var lastHistoryItem =  this.lastHistoryItem();
            return lastHistoryItem && !lastHistoryItem.isError;
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
            this.history.unshift(HistoryItem.create({
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
            self.history.unshift(HistoryItem.create({
                url: url,
                isError: false,
                statusCode: null,
                data: beautify.html(data),
                textStatus: textStatus,
                jqXHR: jqXHR
            }));
        }).error(function(jqXHR, textStatus, errorThrown){
            self.history.unshift(HistoryItem.create({
                url: url,
                isError: true,
                statusCode: null,
                errorThrown: errorThrown,
                textStatus: textStatus,
                data: null,
                jqXHR: jqXHR
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
