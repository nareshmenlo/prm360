prmApp
.factory('SignalRFactory',
    ["$http", "$rootScope", "$location", "Hub", "$timeout",
    function ($http, $rootScope, $location, Hub, $timeout) {
        function backendFactory(serverUrl, hubName) {
            var connection = $.hubConnection("/WEBQA/~");
            var proxy = connection.createHubProxy(hubName);
            connection.start({jsonp:true,xdomain:true,logging:true}).done(function () { 
                console.log("Angular Service Created");
            });
            return {
                on: function (eventName, callback) {
                    proxy.on(eventName, function (result) {
                        console.log(result);
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
                        console.log(result);
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback(result);
                            }
                        });
                    });
                }
            };
        };

        return backendFactory;
}]);
        /*var Requirement = {};

        var hub = new Hub('req', {
            listeners:{
                'updateRequirement': function(reqObj){
                    Requirement = reqObj;
                    $rootScope.$apply();
                }
            },
            methods:['updateTime'],
            errorHandler: function(error){
                console.log(error);
            }
        });

        Requirement.updateTime = function(reqID, userID, newTicks, sessionID){
            hub.updateTime(reqID, userID, newTicks, sessionID);
        }

        return Requirement;*/

/*$.connection.hub.logging = true;
                var requirementHub = $.connection.requirementHub;
                requirementHub.client.updateRequirement = function (req) {
                    console.log(req);
                    return req;
                    //var senderDiv = $('<div />').text(sender).html();
                    //var messageDiv = $('<div />').text(message).html();
                    // Add the message to the page.
                    //$('#messagelist').append('<li><strong>' + senderDiv + '</strong>:&nbsp;&nbsp;' + messageDiv + '</li>');
                };

                $.connection.hub.start("~/signalr").done(function () {
           
                    $('#sendmessage').click();
                    console.log("service successfully started.");
                });*/

/*

        function backendFactory(serverUrl, hubName) {
                /*$.connection.hub.logging = true;
                var requirementHub = $.connection.requirementHub;
                requirementHub.client.updateRequirement = function (req) {
                    console.log(req);
                    return req;
                    //var senderDiv = $('<div />').text(sender).html();
                    //var messageDiv = $('<div />').text(message).html();
                    // Add the message to the page.
                    //$('#messagelist').append('<li><strong>' + senderDiv + '</strong>:&nbsp;&nbsp;' + messageDiv + '</li>');
                };

                $.connection.hub.start("~/signalr").done(function () {
           
                    $('#sendmessage').click();
                    console.log("service successfully started.");
                });


                var connection = $.hubConnection("http://ptmapps.com");
                var proxy = connection.createHubProxdy(hubName);
                connection.start({jsonp:true,xdomain:true,logging:true}).done(function () { });
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
                invoke: function (methodName, callback) {
                    proxy.invoke(methodName)
                        .done(function (result) {
                            $rootScope.$apply(function () {
                                if (callback) {
                                    callback(result);
                                }
                            });
                        });
                    }
                };
            };

        return backendFactory;*/
    
//                 on: function (reqID, userID, newTicks, sessionID) {
//                         messageHub.server.updateTime(1, 1000, "8c41aec5-90e2-4607-8f94-1e029dfc5444");                    
//                     },
//                 invoke: function (methodName, callback) {
//                     proxy.invoke(methodName)
//                     .done(function (result) {
//                         $rootScope.$apply(function () {
//                             if (callback) {
//                                 callback(result);
//                             }
//                         });
//                     });
//                 }
//             };            
        
//     };
//     return backendFactory;
/*
        return {
                    on: function (eventName, callback) {
                            proxy.on(eventName, function (result) {
                                $rootScope.$apply(function () {
                                    console.log("SignalR called a client method");
                                    if (callback) {
                                        callback(result);
                                    }
                            });
                        });
                    },
                invoke: function (methodName, args, callback) {
                    if(args != undefined){
                        proxy.invoke(methodName, args)
                        .done(function (result) {
                            $rootScope.$apply(function () {
                                console.log("Client called a SignalR method and got a response");
                                if (callback) {
                                    callback(result);
                                }
                                return result;
                            });
                        }).fail(function(error){
                            console.log(error);
                        });
                    } else {
                        proxy.invoke(methodName)
                        .done(function (result) {
                            $rootScope.$apply(function () {
                                console.log("Client called a SignalR method and got a response");
                                if (callback) {
                                    callback(result);
                                }
                                return result;
                            });
                        }).fail(function(error){
                            console.log(error);
                        });
                    }
                }
                    
                };*/
// }]);
