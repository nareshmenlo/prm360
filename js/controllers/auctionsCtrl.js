prmApp
    // =========================================================================
    // Auction Tiles
    // =========================================================================
    .controller('auctionsCtrl', function ($timeout, $state, $scope, $log, growlService, userService, auctionsService, $http, $rootScope, SignalRFactory, signalRHubName) {
        $scope.myHotAuctionsLoaded = false;
        /*$scope.myAuctionsLoaded = false;*/
        $scope.todaysAuctionsLoaded = false;
        $scope.myHotAuctionsLoaded = false;
        $scope.scheduledAuctionsLoaded = false;
        /*$scope.myAuctions = [];*/
        $scope.todaysAuctionsLoaded = false;
        $scope.scheduledAuctionsLoaded = false;
        $scope.hotLimit = 4;
        $scope.todaysLimit = 4;
        $scope.scheduledLimit = 4;
        $scope.loggedIn = userService.isLoggedIn();
        $scope.isVendor = (userService.getUserType() == "VENDOR") ? true : false;
        $log.info(userService.getUserType());
        $scope.scheduledAuctionsMessage = $scope.todayAuctionsMessage = $scope.hotAuctionsMessage = "Loading data, please wait.";

        $scope.reduceTime = function (timerId, time) {
            addCDSeconds(timerId, time);
        }

        $scope.stopBid = function (item) {
            $scope.myHotAuctions[0].TimeLeft = 60;
        }

        $scope.options = {
            loop: true,
            dots: false,
            margin: 10,
            autoplay: true,
            autoplayTimeout: 2000,
            autoplayHoverPause: true,
            responsive: {
                0: {
                    items: 1,
                },
                600: {
                    items: 3,
                },
                1000: {
                    items: 4,
                    loop: false
                }
            }
        };
        $scope.data = {
            userID: 1,
            sessionID: 1,
            section: "CURRENT"
        }
        $scope.myHotAuctions = [];
        $scope.scheduledAuctions = [];
        $scope.todaysAuctions = [];
        $log.info($scope.loggedIn);

        $log.info('trying to connect to service');
        var requirementHub = SignalRFactory('', signalRHubName);
        $log.info('connected to service');

        $scope.$on("$destroy", function () {
            $log.info('disconecting signalR')
            requirementHub.stop();
            $log.info('disconected signalR')
        });

        requirementHub.on('checkRequirement', function (obj) {
            var hotreqIDs = _.map($scope.myHotAuctions, 'auctionID');
            var todaysreqIDs = _.map($scope.todaysAuctions, 'auctionID');
            var scheduledreqIDs = _.map($scope.scheduledAuctions, 'auctionID');
            if (hotreqIDs.indexOf(obj.requirementID) > -1 || todaysreqIDs.indexOf(obj.requirementID) > -1 || scheduledreqIDs.indexOf(obj.requirementID) > -1) {
                $scope.getMiniItems();
            }
        })

        $scope.getMiniItems = function () {
            if ($scope.loggedIn) {
                auctionsService.getauctions({ "action": "runningauctions", "section": "CURRENT", "userid": userService.getUserId(), "sessionid": userService.getUserToken(), "limit": $scope.hotLimit })
                    .then(function (response) {
                        $scope.myHotAuctions = response;
                        $log.info(response);
                        if ($scope.myHotAuctions.length > 0) {
                            $scope.myHotAuctionsLoaded = true;
                            //$(".hotauctions").owlCarousel(options);
                        } else {
                            $scope.myHotAuctionsLoaded = false;
                            $scope.hotAuctionsMessage = "There are no Negotiations running right now for you.";
                        }

                    });

                auctionsService.getDashboardStats({ "userid": userService.getUserId(), "sessionid": userService.getUserToken() })
                    .then(function (response) {
                        $scope.dashboardStats = response;
                    });

                auctionsService.getauctions({ "section": "TODAYS", "userid": userService.getUserId(), "sessionid": userService.getUserToken(), "limit": $scope.todaysLimit })
                    .then(function (response) {
                        $scope.todaysAuctions = response;
                        $scope.todaysAuctionsLoaded = true;
                        if ($scope.todaysAuctions.length > 0) {
                            $scope.todaysAuctionsLoaded = true;
                            //$(".todayauctions").owlCarousel(options);
                        } else {
                            $scope.todaysAuctionsLoaded = false;
                            $scope.todayAuctionsMessage = "There are no Negotiations scheduled today for you.";
                        }
                    });
                auctionsService.getauctions({ "section": "SCHEDULED", "userid": userService.getUserId(), "sessionid": userService.getUserToken(), "limit": $scope.scheduledLimit })
                    .then(function (response) {
                        $scope.scheduledAuctions = response;
                        $scope.scheduledAuctionsLoaded = true;
                        if ($scope.scheduledAuctions.length > 0) {
                            $scope.scheduledAuctionsLoaded = true;
                            // $(".scheduledauctions").owlCarousel(options);
                        } else {
                            $scope.scheduledAuctionsLoaded = false;
                            $scope.scheduledAuctionsMessage = "There are no Negotiations scheduled for you in the future.";
                        }
                    });
            }
        }

        $scope.getMiniItems();

        // var intervalPromise = window.setInterval(function(){
        //     if(window.location.hash == "#/home"){
        //         $scope.getMiniItems();
        //     }            
        // }, 10000);

        $scope.addItem = function () {
            var obj = {
                auctionTimerId: 1000,
                title: "test",
                price: 11244354,
                bids: 24,
                auctionEnds: '123465'
            }
            $scope.myHotAuctions.push(obj);
        }

        $scope.makeaBid1 = function () {
            var bidPrice = $("#makebidvalue").val();
            //$log.info($scope.auctionItem.minPrice);
            $log.info(bidPrice+"::Auction cntrl");

            if (bidPrice == "") {
                $scope.bidPriceEmpty = true;
                $scope.bidPriceValidation = false;
                return false;
            } else if (!isNaN($scope.auctionItem.minPrice) && $scope.auctionItem.minPrice > 0 && bidPrice >= $scope.auctionItem.minPrice) {
                $scope.bidPriceValidation = true;
                $scope.bidPriceEmpty = false;
                return false;
            } else {
                $scope.bidPriceValidation = false;
                $scope.bidPriceEmpty = false;
            }
            if (($scope.bidAttachementName == "" || $scope.bidAttachement.length == 0) && $scope.quotationStatus == false) {
                $scope.bidAttachementValidation = true;
                return false;
            } else {
                $scope.bidAttachementValidation = false;
            }
            //return false;
            //$scope.auctionItem.minPrice
            var params = {};
            params.reqID = parseInt(id);
            params.sessionID = userService.getUserToken();
            params.userID = parseInt(userService.getUserId());
            params.price = parseFloat(bidPrice);
            params.quotation = $scope.bidAttachement;
            params.quotationName = $scope.bidAttachementName;
            //$log.info(params);
            //var parties = params.reqID + "$" + params.userID + "$" + params.price + "$" + params.quotation + "$" + params.quotationName + "$" + params.sessionID;
            requirementHub.invoke('MakeBid', params, function (req) {
                //auctionsService.makeabid(params).then(function(req){
                if (req.errorMessage == '') {
                    swal("Thanks !", "Your bidding process has been successfully updated", "success");
                    $("#makebidvalue").val("");
                    $(".removeattachedquotes").trigger('click');
                } else {
                    swal("Error!", req.errorMessage, "error");
                }
            });
        }

        $scope.reduceTime = function (timerId, time) {
            addCDSeconds(timerId, time);
        }

        $scope.stopBid = function (item) {
            $scope.myHotAuctions[0].TimeLeft = 60;
        }

        $scope.changeScheduledAuctionsLimit = function () {
            $scope.scheduledLimit = 8;
            $scope.getMiniItems();
        }

        $scope.changeHotAuctionsLimit = function () {
            $scope.hotLimit = 8;
            $scope.getMiniItems();
        }

        $scope.changeTodaysAuctionsLimit = function () {
            $scope.todaysLimit = 8;
            $scope.getMiniItems();
        }

    })