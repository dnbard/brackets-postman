define(function(require, exports){
    var Q = require('../vendor/q'),
        beautify = require('./beautify'),
        _ = require('../vendor/lodash');

    function formatHeaders(headersData){
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

    exports.ajax = function(options){
        var request = $.ajax(options),
            defer = Q.defer();

        request.success(function(data, textStatus, jqXHR){
            defer.resolve({
                raw:{
                    data: data,
                    textStatus: textStatus,
                    jqXHR: jqXHR
                },
                response:{
                    statusCode: jqXHR.status,
                    data: beautify.do(data),
                    textStatus: jqXHR.statusText,
                    headers: formatHeaders(jqXHR.getAllResponseHeaders()),
                    jqXHR: jqXHR
                }
            });
        }).error(function(jqXHR, textStatus, errorThrown){
            defer.reject({
                raw:{
                    jqXHR: jqXHR,
                    textStatus: textStatus,
                    errorThrown: errorThrown
                },
                response:{
                    statusCode: jqXHR.status,
                    errorThrown: errorThrown,
                    textStatus: jqXHR.statusText,
                    data: null,
                    jqXHR: jqXHR,
                    headers: formatHeaders(jqXHR.getAllResponseHeaders())
                }
            });
        });

        return defer.promise;
    }
});
