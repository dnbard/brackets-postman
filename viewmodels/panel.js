define(function(require, exports, module){
    var ko = require('../vendor/knockout'),
        _ = require('../vendor/lodash'),
        Methods = require('../enums/methods'),
        ResponseTabs = require('../enums/responseTabs'),
        HistoryItem = require('../models/historyItem'),
        request = require('../services/request');

    require('../bindings/enterKey');
    require('../bindings/codemirror');

    function PanelViewModel(options){
        var self = this;

        this.overrideShowMethod(options.panel);

        this.element = options.panel;
        this.$icon = options.$icon;

        this.authMode = ko.observable('normal');

        this.url = ko.observable(null);
        this.method = ko.observable(_.first(Methods));
        this.isBodylessMethod = ko.computed(function(){
            var method = this.method();

            return method !== 'POST' && method !== 'PUT' && method !== 'PATCH' && method !== 'DELETE';
        }, this);

        this.history = ko.observableArray([]);
        this.history.subscribe(function(historyItems){
            var newHistoryItem;

            if (_.isArray(historyItems)){
                newHistoryItem = _.first(historyItems);
                self.lastHistoryItem(newHistoryItem);
            }
        });

        this.lastHistoryItem = ko.observable(null);

        this.isErrorResponse = ko.computed(function(){
            var lastHistoryItem =  this.lastHistoryItem();
            return lastHistoryItem && lastHistoryItem.isError;
        }, this);

        this.isResponse = ko.computed(function(){
            var lastHistoryItem =  this.lastHistoryItem();
            return lastHistoryItem && !lastHistoryItem.isError;
        }, this);

        this.isMakingTheRequest = ko.observable(false);

        this.urlFocused = ko.observable(true);

        this.responseTab = ko.observable(ResponseTabs.BODY);

        this.responseView = ko.computed(function(){
            var responseTab = this.responseTab(),
                lastHistoryItem = this.lastHistoryItem();

            if (!lastHistoryItem){
                return '';
            }

            if (responseTab === ResponseTabs.BODY){
                return lastHistoryItem.data;
            }

            if (responseTab === ResponseTabs.HEADERS){
                return lastHistoryItem.headers;
            }
        }, this);
    }

    PanelViewModel.prototype.close = function(){
        this.element.hide();
        this.$icon.removeClass('selected');
    }

    PanelViewModel.prototype.isActiveResponseTab = function(element){
        var tab = $(element).attr("data-tab");

        return ResponseTabs[tab] === this.responseTab();
    }

    PanelViewModel.prototype.setActiveTab = function(viewmodel, event){
        var tab = $(event.target).attr('data-tab');

        if (!ResponseTabs[tab]){
            throw new Error('Cannot set active tab for this element');
        }

        viewmodel.responseTab(ResponseTabs[tab]);
    }

    PanelViewModel.prototype.getHeadersText = function(viewmodel){
        var lastHistoryItem = this.lastHistoryItem();

        if (lastHistoryItem && lastHistoryItem.headersCount){
            return 'Response Headers (' + lastHistoryItem.headersCount + ')';
        } else {
            return 'Response Headers';
        }
    }

    PanelViewModel.prototype.onSendClick = function(){
        var url = this.url() || '',
            self = this,
            responseTimestamp;

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

        this.isMakingTheRequest(true);

        responseTimestamp = new Date();

        request.ajax({
            url: url,
            method: this.method()
        }).then(function(payload){
            self.history.unshift(HistoryItem.create(_.extend({
                url: url,
                isError: false,
                time: new Date() - responseTimestamp
            }, payload.response)));
        }, function(payload){
            self.history.unshift(HistoryItem.create(_.extend({
                url: url,
                isError: true,
                time: new Date() - responseTimestamp
            }, payload.response)));
        }).then(function(){
            self.isMakingTheRequest(false);
            self.responseTab(ResponseTabs.BODY);
        })
        .done();

        return false;
    }

    PanelViewModel.prototype.getMethods = function(){
        return _.map(Methods, function(m){
            return {
                name: m,
                id: m,
                available: true
            };
        }, this);
    }

    PanelViewModel.prototype.formatHeadersOutput = function(headersData){
        return _.map(headersData, function(header){
            return header.name + ' → ' + header.value;
        }).join('\n');
    }

    PanelViewModel.prototype.checkThemeColor = function(color){
        color = color || 'dark';

        return $('.'+color).length > 0
    }

    PanelViewModel.prototype.overrideShowMethod = function(panel){
        var oldShow = panel.show,
            self = this;

        panel.show = function(){
            self.show();
            oldShow.call(panel);
        }
    }

    PanelViewModel.prototype.show = function(){
        var self = this;
        setTimeout(function(){
            self.urlFocused(true);
        }, 10);
    }

    PanelViewModel.prototype.reset = function(){
        this.authMode('normal');
        this.url(null);
        this.method(_.first(Methods));
        this.lastHistoryItem(null);
    }

    PanelViewModel.prototype.getSpinnerData = function(){
        var isDarkTheme = this.checkThemeColor('dark');

        return isDarkTheme ? "data:image/gif;base64,R0lGODlhEAAQAPYAAP////////7+/v7+/v7+/v7+/v7+/v7+/v7+/v////7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCAAAACwAAAAAEAAQAAAHaIAAgoMgIiYlg4kACxIaACEJCSiKggYMCRselwkpghGJBJEcFgsjJyoAGBmfggcNEx0flBiKDhQFlIoCCA+5lAORFb4AJIihCRbDxQAFChAXw9HSqb60iREZ1omqrIPdJCTe0SWI09GBACH5BAkIAAAALAAAAAAQABAAAAdrgACCgwc0NTeDiYozCQkvOTo9GTmDKy8aFy+NOBA7CTswgywJDTIuEjYFIY0JNYMtKTEFiRU8Pjwygy4ws4owPyCKwsMAJSTEgiQlgsbIAMrO0dKDGMTViREZ14kYGRGK38nHguHEJcvTyIEAIfkECQgAAAAsAAAAABAAEAAAB2iAAIKDAggPg4iJAAMJCRUAJRIqiRGCBI0WQEEJJkWDERkYAAUKEBc4Po1GiKKJHkJDNEeKig4URLS0ICImJZAkuQAhjSi/wQyNKcGDCyMnk8u5rYrTgqDVghgZlYjcACTA1sslvtHRgQAh+QQJCAAAACwAAAAAEAAQAAAHZ4AAgoOEhYaCJSWHgxGDJCQARAtOUoQRGRiFD0kJUYWZhUhKT1OLhR8wBaaFBzQ1NwAlkIszCQkvsbOHL7Y4q4IuEjaqq0ZQD5+GEEsJTDCMmIUhtgk1lo6QFUwJVDKLiYJNUd6/hoEAIfkECQgAAAAsAAAAABAAEAAAB2iAAIKDhIWGgiUlh4MRgyQkjIURGRiGGBmNhJWHm4uen4ICCA+IkIsDCQkVACWmhwSpFqAABQoQF6ALTkWFnYMrVlhWvIKTlSAiJiVVPqlGhJkhqShHV1lCW4cMqSkAR1ofiwsjJyqGgQAh+QQJCAAAACwAAAAAEAAQAAAHZ4AAgoOEhYaCJSWHgxGDJCSMhREZGIYYGY2ElYebi56fhyWQniSKAKKfpaCLFlAPhl0gXYNGEwkhGYREUywag1wJwSkHNDU3D0kJYIMZQwk8MjPBLx9eXwuETVEyAC/BOKsuEjYFhoEAIfkECQgAAAAsAAAAABAAEAAAB2eAAIKDhIWGgiUlh4MRgyQkjIURGRiGGBmNhJWHm4ueICImip6CIQkJKJ4kigynKaqKCyMnKqSEK05StgAGQRxPYZaENqccFgIID4KXmQBhXFkzDgOnFYLNgltaSAAEpxa7BQoQF4aBACH5BAkIAAAALAAAAAAQABAAAAdogACCg4SFggJiPUqCJSWGgkZjCUwZACQkgxGEXAmdT4UYGZqCGWQ+IjKGGIUwPzGPhAc0NTewhDOdL7Ykji+dOLuOLhI2BbaFETICx4MlQitdqoUsCQ2vhKGjglNfU0SWmILaj43M5oEAOwAAAAAAAAAAAA==" : "data:image/gif;base64,R0lGODlhEAAQAPYAAP///wAAAPr6+pKSkoiIiO7u7sjIyNjY2J6engAAAI6OjsbGxjIyMlJSUuzs7KamppSUlPLy8oKCghwcHLKysqSkpJqamvT09Pj4+KioqM7OzkRERAwMDGBgYN7e3ujo6Ly8vCoqKjY2NkZGRtTU1MTExDw8PE5OTj4+PkhISNDQ0MrKylpaWrS0tOrq6nBwcKysrLi4uLq6ul5eXlxcXGJiYoaGhuDg4H5+fvz8/KKiohgYGCwsLFZWVgQEBFBQUMzMzDg4OFhYWBoaGvDw8NbW1pycnOLi4ubm5kBAQKqqqiQkJCAgIK6urnJyckpKSjQ0NGpqatLS0sDAwCYmJnx8fEJCQlRUVAoKCggICLCwsOTk5ExMTPb29ra2tmZmZmhoaNzc3KCgoBISEiIiIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCAAAACwAAAAAEAAQAAAHaIAAgoMgIiYlg4kACxIaACEJCSiKggYMCRselwkpghGJBJEcFgsjJyoAGBmfggcNEx0flBiKDhQFlIoCCA+5lAORFb4AJIihCRbDxQAFChAXw9HSqb60iREZ1omqrIPdJCTe0SWI09GBACH5BAkIAAAALAAAAAAQABAAAAdrgACCgwc0NTeDiYozCQkvOTo9GTmDKy8aFy+NOBA7CTswgywJDTIuEjYFIY0JNYMtKTEFiRU8Pjwygy4ws4owPyCKwsMAJSTEgiQlgsbIAMrO0dKDGMTViREZ14kYGRGK38nHguHEJcvTyIEAIfkECQgAAAAsAAAAABAAEAAAB2iAAIKDAggPg4iJAAMJCRUAJRIqiRGCBI0WQEEJJkWDERkYAAUKEBc4Po1GiKKJHkJDNEeKig4URLS0ICImJZAkuQAhjSi/wQyNKcGDCyMnk8u5rYrTgqDVghgZlYjcACTA1sslvtHRgQAh+QQJCAAAACwAAAAAEAAQAAAHZ4AAgoOEhYaCJSWHgxGDJCQARAtOUoQRGRiFD0kJUYWZhUhKT1OLhR8wBaaFBzQ1NwAlkIszCQkvsbOHL7Y4q4IuEjaqq0ZQD5+GEEsJTDCMmIUhtgk1lo6QFUwJVDKLiYJNUd6/hoEAIfkECQgAAAAsAAAAABAAEAAAB2iAAIKDhIWGgiUlh4MRgyQkjIURGRiGGBmNhJWHm4uen4ICCA+IkIsDCQkVACWmhwSpFqAABQoQF6ALTkWFnYMrVlhWvIKTlSAiJiVVPqlGhJkhqShHV1lCW4cMqSkAR1ofiwsjJyqGgQAh+QQJCAAAACwAAAAAEAAQAAAHZ4AAgoOEhYaCJSWHgxGDJCSMhREZGIYYGY2ElYebi56fhyWQniSKAKKfpaCLFlAPhl0gXYNGEwkhGYREUywag1wJwSkHNDU3D0kJYIMZQwk8MjPBLx9eXwuETVEyAC/BOKsuEjYFhoEAIfkECQgAAAAsAAAAABAAEAAAB2eAAIKDhIWGgiUlh4MRgyQkjIURGRiGGBmNhJWHm4ueICImip6CIQkJKJ4kigynKaqKCyMnKqSEK05StgAGQRxPYZaENqccFgIID4KXmQBhXFkzDgOnFYLNgltaSAAEpxa7BQoQF4aBACH5BAkIAAAALAAAAAAQABAAAAdogACCg4SFggJiPUqCJSWGgkZjCUwZACQkgxGEXAmdT4UYGZqCGWQ+IjKGGIUwPzGPhAc0NTewhDOdL7Ykji+dOLuOLhI2BbaFETICx4MlQitdqoUsCQ2vhKGjglNfU0SWmILaj43M5oEAOwAAAAAAAAAAAA==";
    }

    module.exports = PanelViewModel;
});
