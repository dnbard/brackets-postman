define(function(require, exports){
    var Q = require('../vendor/q'),
        beautify = require('./beautify'),
        _ = require('../vendor/lodash');

    function getResponseType(headersData){
        var tempData = (headersData || '').split('\n'),
            headers = _.chain(tempData)
                .compact()
                .map(function(header){
                    var temp = (header || ':').split(':'),
                        name = temp[0],
                        value = temp[1];

                    if (!name || !value){
                        return null;
                    }

                    return {
                        name: name.trim(),
                        value: value.trim()
                    }
                })
                .compact()
                .value();

        var contentTypeHeader = _.find(headers, function(header){
            return header.name.toLowerCase() === 'content-type';
        });

        if (contentTypeHeader && typeof contentTypeHeader.value === 'string'){
            return _.first(contentTypeHeader.value.split(';'));
        }

        return 'application/javascript';
    }

    function formatHeaders(headersData){
        var tempData = (headersData || '').split('\n'),
            result = {},
            headers = _.chain(tempData)
                .compact()
                .map(function(header){
                    var temp = (header || ':').split(':'),
                        name = temp[0],
                        value = temp[1];

                    if (!name || !value){
                        return null;
                    }

                    return {
                        name: name.trim(),
                        value: value.trim()
                    }
                })
                .compact()
                .sortBy('name')
                .value();

        _.each(headers, function(header){
            result[header.name] = header.value;
        });

        return beautify.do(JSON.stringify(result));
    }

    function countHeaders(headersData){
        return _.chain((headersData || '').split('\n'))
            .compact()
            .size();
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
                    headersCount: countHeaders(jqXHR.getAllResponseHeaders()),
                    type: getResponseType(jqXHR.getAllResponseHeaders()),
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
                    headers: formatHeaders(jqXHR.getAllResponseHeaders()),
                    headersCount: countHeaders(jqXHR.getAllResponseHeaders()),
                    type: getResponseType(jqXHR.getAllResponseHeaders()),
                }
            });
        });

        return defer.promise;
    }
});
