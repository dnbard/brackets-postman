define(function(require, exports){
    var Q = require('../vendor/q');

    exports.ajax = function(options){
        var request = $.ajax(options),
            defer = Q.defer();

        request.success(function(data, textStatus, jqXHR){
            defer.resolve({
                data: data,
                textStatus: textStatus,
                jqXHR: jqXHR
            });
        }).error(function(jqXHR, textStatus, errorThrown){
            defer.reject({
                jqXHR: jqXHR,
                textStatus: textStatus,
                errorThrown: errorThrown
            });
        });

        return defer.promise;
    }
});
