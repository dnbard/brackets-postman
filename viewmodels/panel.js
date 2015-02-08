define(function(require, exports, module){
    var ko = require('../vendor/knockout'),
        _ = require('../vendor/lodash'),
        Methods = require('../enums/methods'),
        ResponseTabs = require('../enums/responseTabs'),
        HistoryItem = require('../models/historyItem'),
        beautify = require('../services/beautify');

    require('../bindings/enterKey');

    function PanelViewModel(options){
        this.overrideShowMethod(options.panel);

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

        this.isMakingTheRequest = ko.observable(false);

        this.urlFocused = ko.observable(true);

        this.responseTab = ko.observable(ResponseTabs.BODY);
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
        var lastHistoryItem = viewmodel.lastHistoryItem();

        if (lastHistoryItem){
            return 'Response Headers (' + _.size(lastHistoryItem.headers) + ')';
        } else {
            return 'Response Headers';
        }
    }

    PanelViewModel.prototype.formatHeaders = function(headers){
        return beautify.do(headers, {
            "keep_array_indentation": true
        });
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

        this.isMakingTheRequest(true);

        $.ajax({
            url: url,
            method: this.method()
        }).success(function(data, textStatus, jqXHR){
            self.isMakingTheRequest(false);

            self.history.unshift(HistoryItem.create({
                url: url,
                isError: false,
                statusCode: null,
                data: beautify.do(data),
                textStatus: textStatus,
                jqXHR: jqXHR,
                headers: self.formatHeaders(jqXHR.getAllResponseHeaders())
            }));
        }).error(function(jqXHR, textStatus, errorThrown){
            self.isMakingTheRequest(false);

            self.history.unshift(HistoryItem.create({
                url: url,
                isError: true,
                statusCode: null,
                errorThrown: errorThrown,
                textStatus: textStatus,
                data: null,
                jqXHR: jqXHR,
                headers: self.formatHeaders(jqXHR.getAllResponseHeaders())
            }));
        });

        return false;
    }

    PanelViewModel.prototype.getMethods = function(){
        return _.map(Methods, function(m){
            return { name: m, id: m };
        });
    }

    PanelViewModel.prototype.formatHeaders = function(headersData){
        var tempData = (headersData || '').split('\n'),
            headers = _.chain(tempData).compact().map(function(header){
                var temp = header.split(':'),
                    name = temp[0],
                    value = temp[1];

                return {
                    name: name.trim(),
                    value: value.trim()
                }
            }).sortBy('name').value();

        return headers;
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

    PanelViewModel.prototype.getSpinnerData = function(){
        var isDarkTheme = this.checkThemeColor('dark');

        return isDarkTheme ? "data:image/gif;base64,R0lGODlhEAAQAPYAAP////////7+/v7+/v7+/v7+/v7+/v7+/v7+/v////7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCAAAACwAAAAAEAAQAAAHaIAAgoMgIiYlg4kACxIaACEJCSiKggYMCRselwkpghGJBJEcFgsjJyoAGBmfggcNEx0flBiKDhQFlIoCCA+5lAORFb4AJIihCRbDxQAFChAXw9HSqb60iREZ1omqrIPdJCTe0SWI09GBACH5BAkIAAAALAAAAAAQABAAAAdrgACCgwc0NTeDiYozCQkvOTo9GTmDKy8aFy+NOBA7CTswgywJDTIuEjYFIY0JNYMtKTEFiRU8Pjwygy4ws4owPyCKwsMAJSTEgiQlgsbIAMrO0dKDGMTViREZ14kYGRGK38nHguHEJcvTyIEAIfkECQgAAAAsAAAAABAAEAAAB2iAAIKDAggPg4iJAAMJCRUAJRIqiRGCBI0WQEEJJkWDERkYAAUKEBc4Po1GiKKJHkJDNEeKig4URLS0ICImJZAkuQAhjSi/wQyNKcGDCyMnk8u5rYrTgqDVghgZlYjcACTA1sslvtHRgQAh+QQJCAAAACwAAAAAEAAQAAAHZ4AAgoOEhYaCJSWHgxGDJCQARAtOUoQRGRiFD0kJUYWZhUhKT1OLhR8wBaaFBzQ1NwAlkIszCQkvsbOHL7Y4q4IuEjaqq0ZQD5+GEEsJTDCMmIUhtgk1lo6QFUwJVDKLiYJNUd6/hoEAIfkECQgAAAAsAAAAABAAEAAAB2iAAIKDhIWGgiUlh4MRgyQkjIURGRiGGBmNhJWHm4uen4ICCA+IkIsDCQkVACWmhwSpFqAABQoQF6ALTkWFnYMrVlhWvIKTlSAiJiVVPqlGhJkhqShHV1lCW4cMqSkAR1ofiwsjJyqGgQAh+QQJCAAAACwAAAAAEAAQAAAHZ4AAgoOEhYaCJSWHgxGDJCSMhREZGIYYGY2ElYebi56fhyWQniSKAKKfpaCLFlAPhl0gXYNGEwkhGYREUywag1wJwSkHNDU3D0kJYIMZQwk8MjPBLx9eXwuETVEyAC/BOKsuEjYFhoEAIfkECQgAAAAsAAAAABAAEAAAB2eAAIKDhIWGgiUlh4MRgyQkjIURGRiGGBmNhJWHm4ueICImip6CIQkJKJ4kigynKaqKCyMnKqSEK05StgAGQRxPYZaENqccFgIID4KXmQBhXFkzDgOnFYLNgltaSAAEpxa7BQoQF4aBACH5BAkIAAAALAAAAAAQABAAAAdogACCg4SFggJiPUqCJSWGgkZjCUwZACQkgxGEXAmdT4UYGZqCGWQ+IjKGGIUwPzGPhAc0NTewhDOdL7Ykji+dOLuOLhI2BbaFETICx4MlQitdqoUsCQ2vhKGjglNfU0SWmILaj43M5oEAOwAAAAAAAAAAAA==" : "data:image/gif;base64,R0lGODlhEAAQAPYAAP///wAAAPr6+pKSkoiIiO7u7sjIyNjY2J6engAAAI6OjsbGxjIyMlJSUuzs7KamppSUlPLy8oKCghwcHLKysqSkpJqamvT09Pj4+KioqM7OzkRERAwMDGBgYN7e3ujo6Ly8vCoqKjY2NkZGRtTU1MTExDw8PE5OTj4+PkhISNDQ0MrKylpaWrS0tOrq6nBwcKysrLi4uLq6ul5eXlxcXGJiYoaGhuDg4H5+fvz8/KKiohgYGCwsLFZWVgQEBFBQUMzMzDg4OFhYWBoaGvDw8NbW1pycnOLi4ubm5kBAQKqqqiQkJCAgIK6urnJyckpKSjQ0NGpqatLS0sDAwCYmJnx8fEJCQlRUVAoKCggICLCwsOTk5ExMTPb29ra2tmZmZmhoaNzc3KCgoBISEiIiIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCAAAACwAAAAAEAAQAAAHaIAAgoMgIiYlg4kACxIaACEJCSiKggYMCRselwkpghGJBJEcFgsjJyoAGBmfggcNEx0flBiKDhQFlIoCCA+5lAORFb4AJIihCRbDxQAFChAXw9HSqb60iREZ1omqrIPdJCTe0SWI09GBACH5BAkIAAAALAAAAAAQABAAAAdrgACCgwc0NTeDiYozCQkvOTo9GTmDKy8aFy+NOBA7CTswgywJDTIuEjYFIY0JNYMtKTEFiRU8Pjwygy4ws4owPyCKwsMAJSTEgiQlgsbIAMrO0dKDGMTViREZ14kYGRGK38nHguHEJcvTyIEAIfkECQgAAAAsAAAAABAAEAAAB2iAAIKDAggPg4iJAAMJCRUAJRIqiRGCBI0WQEEJJkWDERkYAAUKEBc4Po1GiKKJHkJDNEeKig4URLS0ICImJZAkuQAhjSi/wQyNKcGDCyMnk8u5rYrTgqDVghgZlYjcACTA1sslvtHRgQAh+QQJCAAAACwAAAAAEAAQAAAHZ4AAgoOEhYaCJSWHgxGDJCQARAtOUoQRGRiFD0kJUYWZhUhKT1OLhR8wBaaFBzQ1NwAlkIszCQkvsbOHL7Y4q4IuEjaqq0ZQD5+GEEsJTDCMmIUhtgk1lo6QFUwJVDKLiYJNUd6/hoEAIfkECQgAAAAsAAAAABAAEAAAB2iAAIKDhIWGgiUlh4MRgyQkjIURGRiGGBmNhJWHm4uen4ICCA+IkIsDCQkVACWmhwSpFqAABQoQF6ALTkWFnYMrVlhWvIKTlSAiJiVVPqlGhJkhqShHV1lCW4cMqSkAR1ofiwsjJyqGgQAh+QQJCAAAACwAAAAAEAAQAAAHZ4AAgoOEhYaCJSWHgxGDJCSMhREZGIYYGY2ElYebi56fhyWQniSKAKKfpaCLFlAPhl0gXYNGEwkhGYREUywag1wJwSkHNDU3D0kJYIMZQwk8MjPBLx9eXwuETVEyAC/BOKsuEjYFhoEAIfkECQgAAAAsAAAAABAAEAAAB2eAAIKDhIWGgiUlh4MRgyQkjIURGRiGGBmNhJWHm4ueICImip6CIQkJKJ4kigynKaqKCyMnKqSEK05StgAGQRxPYZaENqccFgIID4KXmQBhXFkzDgOnFYLNgltaSAAEpxa7BQoQF4aBACH5BAkIAAAALAAAAAAQABAAAAdogACCg4SFggJiPUqCJSWGgkZjCUwZACQkgxGEXAmdT4UYGZqCGWQ+IjKGGIUwPzGPhAc0NTewhDOdL7Ykji+dOLuOLhI2BbaFETICx4MlQitdqoUsCQ2vhKGjglNfU0SWmILaj43M5oEAOwAAAAAAAAAAAA==";
    }

    module.exports = PanelViewModel;
});
