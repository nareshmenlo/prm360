prmApp
.factory('SignalRFactory',
    ["$http", "$rootScope", "$location", "Hub", "$timeout", "$q","$log", "signalR",
    function ($http, $rootScope, $location, Hub, $timeout, $q, $log, signalR) {
        function backendFactory(serverUrl, hubName) {
            var connection = $.hubConnection(signalR);
            var proxy = connection.createHubProxy(hubName);
            proxy.on('checkRequirement', function(req) {
                return req;
            });
            proxy.on('checkComment', function(obj){
                return obj;
            })
            connection.start().done(function () { 
                $log.info("Angular Service Created");
            });
            return {
                on: function (eventName, callback) {
                    proxy.on(eventName, function (result) {
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback(result);
                            }
                        });
                    });
                },
                off: function (eventName, callback) {
                    proxy.off(eventName, function (result) {
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback(result);
                            }
                        });
                    });
                },
                invoke: function (methodName, args, callback) {
                    proxy.invoke(methodName, args)
                        .done(function (result) {
                            $rootScope.$apply(function () {
                                if (callback) {
                                    callback(result);
                                }
                            });
                        });
                },
                stop: function () {
                    //console.log(connection.stop());
                    connection.stop();
                },
                connection: connection
            };
            
        };

        return backendFactory;
}]);
       