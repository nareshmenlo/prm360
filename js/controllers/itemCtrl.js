prmApp

    // =========================================================================
    // AUCTION ITEM
    // =========================================================================

    .controller('itemCtrl', function ($scope, $rootScope, $filter, $stateParams, $http, domain, fileReader, $state, $timeout, auctionsService, userService, SignalRFactory, growlService, $log, signalRHubName, ngDialog) {

        var id = $stateParams.Id;
        $scope.Loding = false;
        $scope.makeaBidLoding = false;
        $scope.showTimer = false;
        $scope.userIsOwner = false;

        $scope.sessionid = userService.getUserToken();

        $scope.nonParticipatedMsg = '';
        $scope.reduceBidAmountNote = '';
        $scope.incTaxBidAmountNote = '';
        $scope.noteForBidValue = '';
        $scope.disableDecreaseButtons = true;
        $scope.disableAddButton = true;

        $scope.currentID = -1;
        $scope.timerStyle = { 'color': '#000' };        
        $scope.savingsStyle = { 'color': '#228B22' };
        $scope.restartStyle = { 'color': '#f00' };
        //$scope.signalR.on('updateTime',function(data){
        $scope.bidAttachement = [];
        $scope.bidAttachementName = "";
        $scope.bidAttachementValidation = false;
        $scope.bidPriceEmpty = false;
        $scope.bidPriceValidation = false;
        $scope.showStatusDropDown = false;
        $scope.vendorInitialPrice = 0;
        $scope.showGeneratePOButton = false;
        $scope.isDeleted = false;
        $scope.ratingForVendor = 0;
        $scope.ratingForCustomer = 0;
        $scope.participatedVendors = [];
       // $scope.isTimerStarted = false;

        $log.info('trying to connect to service')
        var requirementHub = SignalRFactory('', signalRHubName);
        $log.info('connected to service')        

        $scope.$on("$destroy", function () {
            $log.info('disconecting signalR')
            requirementHub.stop();
            $log.info('disconected signalR')
        });

        /*$.ajax({
            url: "http://www.timeapi.org/ist/now.json", 
            type: "GET",   
            dataType: 'jsonp',
            cache: false,
            success: function(response){
                alert(response.dateString);                   
            }           
        }); */


        $scope.clickToOpen = function () {
            ngDialog.open({ template: 'login/termsUpdateStartTime.html', width: 1000 });
        };


        $scope.updateTimeLeftSignalR = function () {
            var parties = id + "$" + userService.getUserId() + "$" + "10000" + "$" + userService.getUserToken();
            requirementHub.invoke('UpdateTime', parties, function (req) {
                //$log.info(req);
            })
        };
		
		$scope.reduceBidAmount = function(){
			if($scope.reduceBidValue !="" && $scope.reduceBidValue >= 0 && $scope.auctionItem.minPrice > $scope.reduceBidValue)
			{
			    $("#makebidvalue").val($scope.auctionItem.minPrice - $scope.reduceBidValue);
			    //angular.element($event.target).parent().addClass('fg-line fg-toggled');
			}
			else{
				$("#makebidvalue").val($scope.auctionItem.minPrice);
				swal("Error!", "Invalid bid value.", "error");
				$scope.reduceBidValue = 0;
			}
        };

        $scope.bidAmount = function(){
            if($scope.vendorBidPrice !="" && $scope.vendorBidPrice >= 0 && $scope.auctionItem.minPrice > $scope.vendorBidPrice)
            {
                $("#reduceBidValue").val($scope.auctionItem.minPrice - $scope.vendorBidPrice);
                /*angular.element($event.target).parent().addClass('fg-line fg-toggled');*/
            }
            else{
                $("#reduceBidValue").val(0);
                swal("Error!", "Invalid bid value.", "error");
                $scope.vendorBidPrice = 0;
            }
        };

        $scope.selectVendor = function(){
            var selVendID = $scope.formRequest.selectedVendor.vendorID;
            var winVendID = $scope.auctionItem.auctionVendors[0].vendorID;
            if(!$scope.formRequest.selectedVendor.reason && selVendID != winVendID){
                growlService.growl("Please enter the reason for choosing the particular vendor", "inverse");
                return false;
            }
            var params = {
                userID: userService.getUserId(),
                vendorID: $scope.formRequest.selectedVendor.vendorID,
                reqID: $scope.auctionItem.requirementID,
                reason: $scope.formRequest.selectedVendor.reason ? $scope.formRequest.selectedVendor.reason : (selVendID != winVendID ? $scope.formRequest.selectedVendor.reason : ""),
                sessionID: userService.getUserToken()
            }
            auctionsService.selectVendor(params)
            .then(function(response){
                if(response.errorMessage == ""){
                    growlService.growl("Vendor " + response.userInfo.firstName + " " + response.userInfo.lastName +  " has been selected for the final  ","inverse");
                    $scope.getData();
                }
            })
        }

        $scope.rateVendor = function(vendorID){
            var params = {
                uID: userService.getUserId(),
                userID: vendorID,
                rating: $scope.ratingForVendor,
                sessionID: userService.getUserToken()
            }
            auctionsService.rateVendor(params)
            .then(function(response){
                if(response.errorMessage == ""){
                    growlService.growl("Rating saved successfully. You can edit your rating as well.","inverse");
                }
            })
        }

        $scope.rateCustomer = function(){
            var params = {
                uID: userService.getUserId(),
                userID: $scope.auctionItem.customerID,
                rating: $scope.ratingForCustomer,
                sessionID: userService.getUserToken()
            }
            auctionsService.rateVendor(params)
            .then(function(response){
                if(response.errorMessage == ""){
                    growlService.growl("Rating saved successfully. You can edit your rating as well.","inverse");
                }
            }) 
        }



        $scope.makeaBid1 = function () {
            var bidPrice = $("#makebidvalue").val();
            //bidPrice = bidPrice - (bidPrice * $scope.auctionItem.auctionVendors[0].taxes / 100);
            //$log.info($scope.auctionItem.minPrice);
            $log.info(bidPrice);

            

            if (bidPrice == "" || Number(bidPrice)<=0) {
                $scope.bidPriceEmpty = true;
                $scope.bidPriceValidation = false;
                $("#makebidvalue").val("");
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
            if(bidPrice > $scope.auctionItem.auctionVendors[0].runningPrice - $scope.auctionItem.minBidAmount){
                 swal("Error!", "Your amount must be at least " + $scope.auctionItem.minBidAmount + " less than your previous bid.", 'error');
            return false;
            }
            if(bidPrice < (95 * $scope.auctionItem.auctionVendors[0].runningPrice/100)){
                swal({
                    title: "Are you sure?",
                    text: "You are reducing more than 5% of current bid amount. Are you sure you want to go ahead with the bid amount " + bidPrice + "?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#F44336",
                    confirmButtonText: "OK",
                    closeOnConfirm: true
                }, function () {
                    var params = {};
                    params.reqID = parseInt(id);
                    params.sessionID = userService.getUserToken();
                    params.userID = parseInt(userService.getUserId());
                    //bidPrice = bidPrice - (bidPrice * $scope.auctionItem.auctionVendors[0].taxes / 100);
                    params.price = parseFloat(bidPrice);
                    params.quotationName = $scope.bidAttachementName;
                    //$log.info(params);
                    //var parties = params.reqID + "$" + params.userID + "$" + params.price + "$" + params.quotation + "$" + params.quotationName + "$" + params.sessionID;
                    requirementHub.invoke('MakeBid', params, function (req) {
                        //auctionsService.makeabid(params).then(function(req){
                        if (req.errorMessage == '') {
                            swal("Thanks !", "Your bidding process has been successfully updated", "success");
                            $scope.reduceBidValue = "";
                            $("#makebidvalue").val("");
                            $("#reduceBidValue").val("");
                            $scope.getData();
                           // $(".removeattachedquotes").trigger('click');
                        } else {
                            swal("Error!", req.errorMessage, "error");
                        }
                    });
                });
			}
		else
            {
               // function () {
                var params = {};
                params.reqID = parseInt(id);
                params.sessionID = userService.getUserToken();
                params.userID = parseInt(userService.getUserId());
                //bidPrice = bidPrice - (bidPrice * $scope.auctionItem.auctionVendors[0].taxes / 100);
                params.price = parseFloat(bidPrice);
                params.quotationName = $scope.bidAttachementName;

                //$log.info(params);
                //var parties = params.reqID + "$" + params.userID + "$" + params.price + "$" + params.quotation + "$" + params.quotationName + "$" + params.sessionID;
                requirementHub.invoke('MakeBid', params, function (req) {
                    //auctionsService.makeabid(params).then(function(req){
                    if (req.errorMessage == '') {
                        swal("Thanks !", "Your bidding process has been successfully updated", "success");
                        $scope.reduceBidValue = "";
                        $("#makebidvalue").val("");
                        $("#reduceBidValue").val("");
                        $scope.getData();
                       // $(".removeattachedquotes").trigger('click');
                    } else {
                        swal("Error!", req.errorMessage, "error");
                    }
                });
               // });
            }
            //return false;
            //$scope.auctionItem.minPrice            
        }

        $scope.recalculate = function(){
            var params = {};
            params.reqID = id;
            params.sessionID = userService.getUserToken();
            params.userID = userService.getUserId();
            var parties = id + "$" + userService.getUserId() + "$" + userService.getUserToken();
            requirementHub.invoke('CheckRequirement', parties, function () {
                $scope.getData();
                //$scope.$broadcast('timer-set-countdown-seconds', 0);
                swal("Done!", "A refresh command has been sent to everyone.", "success");
            });
        }
        
            
            //return false;
            //$scope.auctionItem.minPrice
            

        $scope.setFields = function () {
            if ($scope.auctionItem.status == "CLOSED") {
                $scope.mactrl.skinSwitch('green');
                if (($scope.auctionItem.customerID == userService.getUserId() || $scope.auctionItem.superUserID == userService.getUserId() )) {
                    $scope.errMsg = "Negotiation has been completed. You can generate the Purchase Order by pressing the button below.";
                }
        		else{
            		$scope.errMsg = "Negotiation has completed.";
                }
                $scope.showStatusDropDown = false;
                $scope.showGeneratePOButton = true;
            } else if ($scope.auctionItem.status == "UNCONFIRMED" || $scope.auctionItem.status == "NOTSTARTED") {
                $scope.mactrl.skinSwitch('teal');
                $scope.errMsg = "Negotiation has not started yet.";
                $scope.showStatusDropDown = false;
                $scope.auctionStarted = false;
                $scope.timeLeftMessage = "Negotiation Starts in: ";
                $scope.startBtns = true;
                $scope.customerBtns = false;
            } else if ($scope.auctionItem.status == "STARTED") {
                $scope.mactrl.skinSwitch('orange');
                $scope.errMsg = "Negotiation has started.";
                $scope.showStatusDropDown = false;
                $scope.auctionStarted = true;
                
                // Dont Change This Text "Negotiation Ends in: " it has dependency in ENDNEGOTIATION
                $scope.timeLeftMessage = "Negotiation Ends in: ";
                // Dont Change This Text "Negotiation Ends in: " it has dependency in ENDNEGOTIATION

                $scope.startBtns = false;
                $scope.customerBtns = true;                
            } else if ($scope.auctionItem.status == "DELETED"){
                $scope.mactrl.skinSwitch('bluegray');
                $scope.errMsg = "This requirement has been cancelled.";
                $scope.showStatusDropDown = false;
                $scope.isDeleted = true;
            } else if ($scope.auctionItem.status == "Negotiation Ended"){
                $scope.mactrl.skinSwitch('bluegray');
                $scope.errMsg = "Negotiation has been completed.";
                $scope.showStatusDropDown = false;
            } else if ($scope.auctionItem.status == "Vendor Selected"){
                $scope.mactrl.skinSwitch('bluegray');
                $scope.errMsg = "Please click the button below to provide the Purchase Order information.";
                $scope.showStatusDropDown = false;
            } else if($scope.auctionItem.status == "PO Processing"){
                $scope.mactrl.skinSwitch('lightblue');
                $scope.errMsg = "The PO has been generated. Please find the PO here: ";
                $scope.showStatusDropDown = false;
            } else {
                $scope.mactrl.skinSwitch('lightblue');
                $scope.showStatusDropDown = true;
            }
            if (($scope.auctionItem.customerID == userService.getUserId() || $scope.auctionItem.superUserID == userService.getUserId() )) {
                $scope.userIsOwner = true;
                $scope.options = ['PO Sent', 'Material Received', 'Payment Processing', 'Payment Released'];
                $scope.options.push($scope.auctionItem.status);
            }
            var start = $scope.auctionItem.startTime.split('+')[0].split('(')[1];
            auctionsService.getdate()
			.then(function(responseFromServer){
                var dateFromServer = new Date(parseInt(responseFromServer.substr(6)));
                $log.debug(dateFromServer);
                var curDate = dateFromServer;
				
            var myEpoch = curDate.getTime();
            $scope.timeLeftMessage = "";
            if (start > myEpoch) {
                $scope.auctionStarted = false;
                $scope.timeLeftMessage = "Negotiation Starts in: ";
                $scope.startBtns = true;
                $scope.customerBtns = false;
            } else {
                $scope.auctionStarted = true;

                // Dont Change This Text "Negotiation Ends in: " it has dependency in ENDNEGOTIATION
                $scope.timeLeftMessage = "Negotiation Ends in: ";
                // Dont Change This Text "Negotiation Ends in: " it has dependency in ENDNEGOTIATION

                $scope.startBtns = false;
                $scope.customerBtns = true;
            }
            if ($scope.auctionItem.customerID != userService.getUserId() &&  $scope.auctionItem.superUserID != userService.getUserId() ) {
                $scope.startBtns = false;
                $scope.customerBtns = false;
            }
            if ($scope.auctionItem.timeLeft == null || $scope.auctionItem.timeLeft < 1) {
                $scope.showTimer = false;
                $scope.disableButtons();
            } else {
                $scope.showTimer = true;
            }
            //$scope.auctionItem.postedOn = new Date(parseFloat($scope.auctionItem.postedOn.substr(6)));
            var date = $scope.auctionItem.postedOn.split('+')[0].split('(')[1];
            var newDate = new Date(parseInt(parseInt(date)));
            $scope.auctionItem.postedOn = newDate.toString().replace('Z', '');

            var date1 = $scope.auctionItem.deliveryTime.split('+')[0].split('(')[1];
            var newDate1 = new Date(parseInt(parseInt(date1)));
            $scope.auctionItem.deliveryTime = newDate1.toString().replace('Z', '');

            //var date2 = $scope.auctionItem.quotationFreezTime.split('+')[0].split('(')[1];
            //var newDate2 = new Date(parseInt(parseInt(date2)));
            //$scope.auctionItem.quotationFreezTime = newDate2.toString().replace('Z', '');

            var minPrice = 0;
            if ($scope.auctionItem.status == "NOTSTARTED") {
                $scope.auctionItem.minPrice = $scope.auctionItem.auctionVendors[0] ? $scope.auctionItem.auctionVendors[0].initialPrice : 0;
            } else {
                $scope.auctionItem.minPrice = $scope.auctionItem.auctionVendors[0] ? $scope.auctionItem.auctionVendors[0].runningPrice : 0;
            }
            $scope.auctionItem.deliveryTime = $scope.auctionItem.deliveryTime.split("GMT")[0];
            for (var i in $scope.auctionItem.auctionVendors) {
                var vendor = $scope.auctionItem.auctionVendors[i]
                
                if (vendor.vendorID == userService.getUserId() && vendor.quotationUrl == "") {
                    $scope.quotationStatus = false;
                    $scope.quotationUploaded = false;
                } else {
                    $scope.quotationStatus = true;
                    if ($scope.auctionItem.customerID != userService.getUserId() && $scope.auctionItem.superUserID != userService.getUserId() ) {
                        $scope.quotationUploaded = true;
                    }
                    $scope.quotationUrl = vendor.quotationUrl;
                    $scope.revquotationUrl = vendor.revquotationUrl;
                    $scope.vendorQuotedPrice = vendor.runningPrice;
                }
                if (i == 0 && vendor.initialPrice != 0) {
                    minPrice = vendor.initialPrice;
                } else {
                    if (vendor.initialPrice < minPrice && vendor.initialPrice != 0) {
                        minPrice = vendor.initialPrice;
                    }
                }
                $scope.vendorInitialPrice = minPrice;
                var runningMinPrice = 0;
                if ($scope.auctionItem.auctionVendors[i].runningPrice > 0 && $scope.auctionItem.auctionVendors[i].runningPrice < $scope.vendorInitialPrice) {
                    runningMinPrice = $scope.auctionItem.auctionVendors[i].runningPrice;
                }
                //$scope.auctionItem.minPrice = runningMinPrice;
                if ($scope.auctionItem.auctionVendors[i].runningPrice == 0) {
                    $scope.auctionItem.auctionVendors[i].runningPrice = 'NA';
                    $scope.auctionItem.auctionVendors[i].totalPriceIncl = 'NA';
                    $scope.auctionItem.auctionVendors[i].rank = 'NA';
                } else {
                    $scope.vendorRank = vendor.rank;
                    if (vendor.rank == 1) {
                        $scope.toprankerName = vendor.vendorName;
                        if (userService.getUserId() == vendor.vendorID) {
                            $scope.options = ['PO Accepted', 'Material Dispatched', 'Payment Acknowledged'];
                            $scope.options.push($scope.auctionItem.status);
                            if($scope.auctionItem.status == "STARTED"){
                                $scope.enableMakeBids = true;
                            }
                        }
                    }
                    //$scope.auctionItem.auctionVendors[i].totalPriceIncl = $scope.auctionItem.auctionVendors[i].runningPrice + ($scope.auctionItem.auctionVendors[i].runningPrice * $scope.auctionItem.auctionVendors[i].taxes) / 100;
                    $scope.auctionItem.auctionVendors[i].totalPriceIncl = $scope.auctionItem.auctionVendors[i].runningPrice;
                }
                if ($scope.auctionItem.auctionVendors[i].initialPrice == 0) {
                    $scope.auctionItem.auctionVendors[i].initialPrice = 'NA';
                    $scope.nonParticipatedMsg = 'You have missed an opportunity to participate in this Negotiation.';
                }
            }
            $scope.$broadcast('timer-set-countdown-seconds', $scope.auctionItem.timeLeft);
            $('.datetimepicker').datetimepicker({
                useCurrent: false,
                icons:{
				time: 'glyphicon glyphicon-time',
				date: 'glyphicon glyphicon-calendar',
				up: 'glyphicon glyphicon-chevron-up',
				down: 'glyphicon glyphicon-chevron-down',
				previous: 'glyphicon glyphicon-chevron-left',
				next: 'glyphicon glyphicon-chevron-right',
				today: 'glyphicon glyphicon-screenshot',
				clear: 'glyphicon glyphicon-trash',
				close: 'glyphicon glyphicon-remove'

			},
			
                minDate: curDate
            });
			})

            
            $scope.reduceBidAmountNote = 'Enter the value which you want to reduce from bid Amount.';
            //$scope.incTaxBidAmountNote = 'Please Enter the consolidate bid value including tax amount.';
            $scope.incTaxBidAmountNote = '';
            //$scope.noteForBidValue = 'NOTE : If you fill one field, other will be autocalculated.';
            $scope.noteForBidValue = '';

        }
        
        
        
        $scope.vendorBidPrice = null;
        $scope.auctionStarted = true;
        $scope.customerBtns = true;
        $scope.showVendorTable = true;
        $scope.quotationStatus = true;
        $scope.toprankerName = "";
        $scope.vendorRank = 0;
        $scope.quotationUrl = "";
        $scope.revquotationUrl = "";
        $scope.vendorBtns = false;
        $scope.vendorQuotedPrice = 0;
        $scope.startBtns = false;
        $scope.commentsvalidation = false;
        // $scope.userType = userService.getUserType();
        // if ($scope.userType == "VENDOR") {
        //     $scope.customerBtns = false;
        //     $scope.vendorBtns = true;
        //     $scope.showVendorTable = false;
        // }
        $scope.enableMakeBids = false;
        $scope.price = "";
        $scope.startTime = '';
        $scope.customerID = userService.getUserId();

        $scope.poDetails = {};

        $scope.bidHistory = {};
        
        $scope.GetBidHistory = function () {
            auctionsService.GetBidHistory({ "reqid": $stateParams.Id, "sessionid": userService.getUserToken(), 'userid': userService.getUserId() })
                .then(function (response) {
                    $scope.bidHistory = response;                    
                });
        }

        $scope.GetBidHistory();

        $scope.vendorID = 0;

        $scope.getData = function () {
            auctionsService.getrequirementdata({ "reqid": $stateParams.Id, "sessionid": userService.getUserToken(), 'userid': userService.getUserId() })
                .then(function (response) {
                    $scope.auctionItem = response;
                    $scope.auctionItem.quotationFreezTime = new moment($scope.auctionItem.quotationFreezTime).format("DD-MM-YYYY HH:mm");
                    if ($scope.auctionItem.auctionVendors.length != 0) {
                        $scope.vendorID = $scope.auctionItem.auctionVendors[0].vendorID;
                    }
                    //$scope.vendorID = $scope.auctionItem.auctionVendors[0].vendorID;

                    $scope.participatedVendors = $scope.auctionItem.auctionVendors.filter(function(vendor){
                        return (vendor.runningPrice > 0);
                    });
                    
                    if ($scope.auctionItem.status != 'DELETED' && $scope.auctionItem.status != 'UNCONFIRMED' && $scope.auctionItem.status != 'STARTED' && $scope.auctionItem.status != 'NOTSTARTED' && $scope.auctionItem.status != 'Negotiation Ended') {
                    auctionsService.getpodetails({ "reqid": $stateParams.Id, "sessionid": userService.getUserToken(), 'userid': userService.getUserId() })
                    .then(function (response) {
                        $scope.poDetails = response;
                        //$scope.updatedeliverydateparams.date = $scope.poDetails.expectedDelivery;
                        if (response != undefined) {
                            //var date = $scope.poDetails.expectedDelivery.split('+')[0].split('(')[1];
                            var date1 = moment($scope.poDetails.expectedDelivery).format('DD/MM/YYYY');
                            $scope.updatedeliverydateparams.date = date1;

                            //var date1 = $scope.poDetails.paymentScheduleDate.split('+')[0].split('(')[1];
                            //var newDate1 = new Date(parseInt(parseInt(date1)));
                            var date2 = moment($scope.poDetails.expPaymentDate).format('DD/MM/YYYY');
                            $scope.updatepaymentdateparams.date = date2;
                            if ($scope.updatepaymentdateparams.date == '31/12/9999') {
                                $scope.updatepaymentdateparams.date = 'Payment Date';
                            }
                        }
                    });
                    }

                  //  $scope.auctionItem.description = $scope.auctionItem.description.replace("\u000a", "\n")
		  $scope.desc = $scope.auctionItem.description.replace(/\u000a/g,"</br>");
                    var id = parseInt(userService.getUserId());
                    var result = $scope.auctionItem.auctionVendors.filter(function (obj) {
                        return obj.vendorID == id;
                    });
                    if ((id != $scope.auctionItem.customerID && id != $scope.auctionItem.superUserID) && result.length == 0) {
                        swal("Access denied", "You do not have access to this requirement because you are not part of this requirements process.", 'error');
                        $state.go('home');
                    } else {
                        $scope.setFields();
                        auctionsService.getcomments({ "reqid": $stateParams.Id, "userid": userService.getUserId(), "sessionid": userService.getUserToken() })
                            .then(function (response) {
                                $scope.Comments = response;
                            });
                        
                    }

                });

        }
        $scope.getData();
        $scope.AmountSaved = 0;

        /*var intervalPromise = window.setInterval(function(){
            if(window.location.hash.indexOf("#/view-requirement") > -1){
                $scope.getData();
            }            
        }, 10000);*/

        $scope.generatePDFonHTML = function () {
			auctionsService.getdate()
			.then(function(response){
				var date = new Date(parseInt(response.substr(6)));
				var obj = $scope.auctionItem;
				$scope.POTemplate = "<div id='POTemplate' style='display:none;'><html><head><title>PRM360</title><style>.date{margin-left: 850px;}.to{margin-left: 250px;}.name{margin-left: 300px;}.sub{margin-left: 450px;}img{position: absolute; left: 750px; top:75px; z-index: -1;}</style></head><body><header><br><br><br><img src='acads360.jpg' width='50' height='50'><h1 align='center'>PRM360<img </h1></header><br><div class='date'><p><b>Date:</b> " + date + "</p><p><b>PO No:</b> " + obj.requirementID + "</p></div><div class='to'><p>To,</p><p><b>" + obj.CompanyName + ",</b></p><p><b>" + obj.deliveryLocation + ".</b></p></div><p class='name'><b>Hello </b> " + obj.auctionVendors[0].vendorName + "</p><p class='sub'><b>Sub:</b> " + obj.title + "</p><p align='center'><b>Bill of Material</b></p><table border='1' cellpadding='2' style='width:60%' align='center'><tr><th>Product Name</th><th>Description</th><th>Price</th></tr><tr><td>" + obj.title + "</td><td>" + obj.description + "</td><td>" + obj.price + "</td></tr></table><p class='to'><b>Terms & Conditions</b></p><div class='name'> <p>1. Payment : " + obj.paymentTerms + ".</p><p>2. Delivery : " + obj.deliveryLocation + ".</p><p>3. Tax : " + obj.taxes + ".</p></div><p class='to'><b>Billing and Shipping Address:</b></p><p class='to'>Savvy Associates, # 3-4-174/21/2, Radha Krishna Nagar, Attapur, Hyderguda, Hyderabad - 500048</p><p align=center>This is a system generated PO, henceforth sign and seal is not required.</p><br><footer class='to'>M/s. Savvy Associates, H.No: 3-4-174/21/2, Radha Krishna Nagar, Attapur, Hyderguda, Hyderabad – 48Contact,M: 91-9949245791.,<br>E: savvyassociates@gmail.com.<br><b>URL:</b> www.savvyassociates.com. </footer></body></html></div>";
				var content = document.getElementById('content');
				content.insertAdjacentHTML('beforeend', $scope.POTemplate);
			})
        }

        $scope.generatePOasPDF = function (divName) {
            $scope.generatePDFonHTML();
            var printContents = document.getElementById(divName).innerHTML;
            var originalContents = document.body.innerHTML;

            if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                var popupWin = window.open('', '_blank', 'width=600,height=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                popupWin.window.focus();
                popupWin.document.write('<!DOCTYPE html><html><head>' +
                    '<link rel="stylesheet" type="text/css" href="style.css" />' +
                    '</head><body onload="window.print()"><div class="reward-body">' + printContents + '</div></html>');
                popupWin.onbeforeunload = function (event) {
                    popupWin.close();
                    return '.\n';
                };
                popupWin.onabort = function (event) {
                    popupWin.document.close();
                    popupWin.close();
                }
            } else {
                var popupWin = window.open('', '_blank', 'width=800,height=600');
                popupWin.document.open();
                popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</html>');
                popupWin.document.close();
            }
            popupWin.document.close();
            var params = {
                reqid: $scope.auctionItem.requirementID,
                userid: userService.getUserId(),
                status: 'PO Processing',
                type: "WINVENDOR",
                sessionID: userService.getUserToken()
            };
            auctionsService.updateStatus(params)
                .then(function (response) {
                    if (response.errorMessage == '') {
                        $scope.getData();
                        //doc.save("DOC.PDF");
                    } else {
                        swal("Error", 'An Unexpected error has occurred. Please contact support@prm360.com for resolving this.', 'error');
                    }

                })

            return true;
        }

        $scope.generatePO = function () {
            var doc = new jsPDF();
            doc.setFontSize(40);
            //doc.text(40, 30, "Octocat loves jsPDF", 4);
            /*doc.fromHTML($("#POTemplate")[0], 15, 15, {
                "width": 170,
                function() {
                    $scope.POFile = $.makeArray(new Uint8Array(doc.output('arraybuffer')));
                }
            })*/

            var params = {
                reqid: $scope.auctionItem.requirementID,
                userid: userService.getUserId(),
                status: 'PO Processing',
                type: "WINVENDOR",
                sessionID: userService.getUserToken()
            };
            auctionsService.updateStatus(params)
                .then(function (response) {
                    if (response.errorMessage == '') {
                        $scope.getData();
                        doc.save("DOC.PDF");
                    } else {
                        swal("Error", 'An Unexpected error has occurred. Please contact support@prm360.com for resolving this.', 'error');
                    }

                })
        }

        $scope.generatePOinServer = function () {
            if ($scope.POTemplate == "") {
                $scope.generatePDFonHTML();

            }
            var doc = new jsPDF('p', 'in', 'letter');
            var specialElementHandlers = {};
            var doc = new jsPDF();
            //doc.setFontSize(40);
            doc.fromHTML($scope.POTemplate, 0.5, 0.5, {
                'width': 7.5, // max width of content on PDF
            });
            //doc.save("DOC.PDF");
            doc.output("dataurl");
            $scope.POFile = $.makeArray(new Uint8Array(doc.output('arraybuffer')));
            var params = {
                POfile: $scope.POFile,
                reqid: $scope.auctionItem.requirementID,
                userid: userService.getUserId(),
                POfileName: 'PO_req_' + $scope.auctionItem.requirementID + '.pdf',
                sessionID: userService.getUserToken()
            }

            auctionsService.generatePOinServer(params)
                .then(function (response) {
                    if (response.errorMessage == '') {
                        $scope.showStatusDropDown = true;
                        $scope.getData();
                    } else {
                        swal("Error", 'An Unexpected error has occurred. Please contact support@prm360.com for resolving this.', 'error');
                    }

                })
        }

        $scope.updateStatus = function (status) {
            var params = {
                reqid: $scope.auctionItem.requirementID,
                userid: userService.getUserId(),
                status: status,
                type: "WINVENDOR",
                sessionID: userService.getUserToken()
            };
            auctionsService.updateStatus(params)
                .then(function (response) {
                    if (response.errorMessage == '') {
                        $scope.getData();
                    } else {
                        swal("Error", 'An Unexpected error has occurred. Please contact support@prm360.com for resolving this.', 'error');
                    }

                })

        }

        $scope.updatedeliverydateparams = {
            date: ''
        };

        

        $scope.updatedeliverdate = function () {
            var ts = moment($scope.updatedeliverydateparams.date, "DD-MM-YYYY HH:mm").valueOf();
            var m = moment(ts);
            var deliveryDate = new Date(m);
            var milliseconds = parseInt(deliveryDate.getTime() / 1000.0);
            $scope.updatedeliverydateparams.date = "/Date(" + milliseconds + "000+0530)/";

            var params = {
                reqid: $scope.auctionItem.requirementID,
                userid: userService.getUserId(),
                date: $scope.updatedeliverydateparams.date,
                type: "DELIVERY",
                sessionID: userService.getUserToken()
            };
            auctionsService.updatedeliverdate(params)
                .then(function (response) {
                    if (response.errorMessage == '') {
                        $scope.getData();
                    } else {
                        swal("Error", 'An Unexpected error has occurred. Please contact support@prm360.com for resolving this.', 'error');
                    }

                })

        }


        $scope.updatepaymentdateparams = {
            date: ''
        };

        

        $scope.updatepaymentdate = function () {
            var ts = moment($scope.updatepaymentdateparams.date, "DD-MM-YYYY HH:mm").valueOf();
            var m = moment(ts);
            var deliveryDate = new Date(m);
            var milliseconds = parseInt(deliveryDate.getTime() / 1000.0);
            $scope.updatepaymentdateparams.date = "/Date(" + milliseconds + "000+0530)/";

            var params = {
                reqid: $scope.auctionItem.requirementID,
                userid: userService.getUserId(),
                date: $scope.updatepaymentdateparams.date,
                type: "PAYMENT",
                sessionID: userService.getUserToken()
            };
            auctionsService.updatepaymentdate(params)
                .then(function (response) {
                    if (response.errorMessage == '') {
                        $scope.getData();
                    } else {
                        swal("Error", 'An Unexpected error has occurred. Please contact support@prm360.com for resolving this.', 'error');
                    }

                })
        }



        $scope.RestartNegotiation = function () {
            var params = {};
            params.reqID = id;
            params.sessionID = userService.getUserToken();
            params.userID = userService.getUserId();
            var parties = id + "$" + userService.getUserId() + "$" + userService.getUserToken();

            auctionsService.RestartNegotiation(params)
                    .then(function (response) {
                        if (response.errorMessage == '') {
                                requirementHub.invoke('CheckRequirement', parties, function () {
                                $scope.getData();                                
                                swal("Done! Negotiation Re-Started", "Your Negotiation Re-Started, Time Extended 5 Min Successfully!", "success");
                            });
                        } else {
                            swal("Error", "You cannot restart Negotiation", "inverse");
                        }
                    })            
            }

        $scope.saveComment = function () {
            var commentText = "";
            if ($scope.newComment && $scope.newComment != "") {
                commentText = $socpe.newComment;
            } else if ($("#comment")[0].value != ''){
                commentText = $("#comment")[0].value;
            } else {
                $scope.commentsvalidation = true;
            }
            if(!$scope.commentsvalidation){
                var params = {};
					auctionsService.getdate()
					.then(function(response){
						var date = new Date(parseInt(response.substr(6)));
					var myEpoch = date.getTime();
					params.requirementID = id;
					params.firstName = "";
					params.lastName = "";
					params.replyCommentID = -1;
					params.commentID = -1;
					params.errorMessage = "";
					params.createdTime = "/Date(" + myEpoch + "+0000)/";
					params.sessionID = userService.getUserToken();
					params.userID = userService.getUserId();
					params.commentText = commentText;
					requirementHub.invoke('SaveComment', params, function (response) {
						//auctionsService.savecomment(params).then(function (response) {
						$scope.getData();
						$scope.newComment = "";
						$scope.commentsvalidation = false;
					});
                });
            } 
        }

        $scope.getFile = function () {
            $scope.progress = 0;
            var quotation = $("#quotation")[0].files[0];
            if (quotation != undefined && quotation != '') {
                $scope.file = $("#quotation")[0].files[0];
                $log.info($("#quotation")[0].files[0]);
            }
            var quotation1 = $("#quotation1")[0].files[0];
            if (quotation1 != undefined && quotation1 != '') {
            $scope.file = $("#quotation1")[0].files[0];
            $log.info($("#quotation1")[0].files[0]);
            }
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    var bytearray = new Uint8Array(result);
                    $scope.bidAttachement = $.makeArray(bytearray);
                    $scope.bidAttachementName = $scope.file.name;
                    $scope.enableMakeBids = true;
                });
        };     


        $scope.updateTime = function (time) {
            var isDone = false;
            $scope.disableDecreaseButtons = true;
            $scope.disableAddButton = true;
            $scope.$on('timer-tick', function (event, args) {
                var temp = event.targetScope.countdown;

                if (!isDone) {
                    if (time < 0 && temp + time < 0) {
                        growlService.growl("You cannot reduce the time when it is already below 60 seconds", "inverse");
                        isDone = true;
                        return false;
                    }
                    addCDSeconds("timer", time);

                    isDone = true;
                    var params = {};
                    params.reqID = id;
                    params.sessionID = userService.getUserToken();
                    params.userID = userService.getUserId();
                    params.newTicks = ($scope.countdownVal + time);
                    // auctionsService.updatebidtime(params).then(function(response){
                    //     $scope.getData();   
                    // });
                    var parties = id + "$" + userService.getUserId() + "$" + params.newTicks + "$" + userService.getUserToken();
                    requirementHub.invoke('UpdateTime', parties, function (req) {
                        //if ((temp + time) >= 60) {
                        //    $scope.disableDecreaseButtons = false;
                        //} else {
                        //    $scope.disableDecreaseButtons = true;
                        //}
                        if (!$scope.auctionItem.isStopped && $scope.auctionItem.timeLeft > 0) {
                            $scope.disableAddButton = false;
                        }
                        //$log.info(req);
                    })
                }
            });
        }

        $scope.Loding = false;

        $scope.updateAuctionStart = function () {
            $scope.Loding = true;
            var params = {};
            params.auctionID = id;

            var startValue = $scope.startTime;

            if (startValue && startValue != null && startValue != "") {

                var ts = moment($scope.startTime, "DD-MM-YYYY HH:mm").valueOf();
                var m = moment(ts);
                var auctionStartDate = new Date(m);
                auctionsService.getdate()
                .then(function (response1) {
                    var CurrentDate = moment(new Date(parseInt(response1.substr(6))));
                    $log.debug(CurrentDate < auctionStartDate);
                    $log.debug('div' + auctionStartDate);
                    if (CurrentDate >= auctionStartDate) {
                        $scope.Loding = false;
                        swal("Done!", "Your Negotiation Start Time should be greater than current time.", "error");
                        return;
                    }


                    var milliseconds = parseInt(auctionStartDate.getTime() / 1000.0);
                    params.postedOn = "/Date(" + milliseconds + "000+0530)/";
                    params.auctionEnds = "/Date(" + milliseconds + "000+0530)/";
                    params.customerID = userService.getUserId();
                    params.sessionID = userService.getUserToken();
                    if ($scope.auctionItem.auctionVendors.length == 0 || $scope.auctionItem.auctionVendors[0].quotationUrl == "" || $scope.auctionItem.auctionVendors[1].quotationUrl == "") {
                        $scope.Loding = false;
                        swal("Not Allowed", "You are not allowed to create a start time until at least 2 vendor makes a bid.", "error");
                    } else {
                        $scope.Loding = true;
                        requirementHub.invoke('UpdateAuctionStartSignalR', params, function (req) {
                            $scope.Loding = false;
                            swal("Done!", "Your Negotiation Start Time Updated Successfully!", "success");
                            $scope.Loding = false;
                            // $scope.isTimerStarted = true;
                            $scope.getData();
                            $scope.auctionItem.timeLeft = req.timeLeft;
                            var start = $scope.auctionItem.startTime.split('+')[0].split('(')[1];
                            auctionsService.getdate()
                            .then(function (response) {
                                var curDate = new Date(parseInt(response.substr(6)));
                                //var curDate = new Date();
                                var myEpoch = curDate.getTime();
                                if (($scope.auctionItem.customerID == userService.getUserId() || $scope.auctionItem.superUserID == userService.getUserId()) && start > myEpoch) {
                                    $scope.startBtns = true;
                                    $scope.customerBtns = false;
                                } else {

                                    $scope.startBtns = false;
                                    $scope.disableButtons();
                                    $scope.customerBtns = true;
                                }

                                if ($scope.auctionItem.timeLeft == null || $scope.auctionItem.timeLeft < 0) {
                                    $scope.showTimer = false;
                                } else {

                                    $scope.showTimer = true;
                                }
                            })


                            //$log.info(req);
                        })
                    }
                })

                $scope.Loding = false;


            } else {
                $scope.Loding = false;
                alert("Please enter the date and time to update Start Time to.");
            }
            $scope.Loding = false;
        }
        $scope.makeaBidLoding = false;
        $scope.makeaBid = function () {
            $scope.makeaBidLoding = true;
            var bidPrice = $("#quotationamount").val();
            //$log.info($scope.auctionItem.minPrice);
            //$log.info(bidPrice);

            if (bidPrice == "") {
                $scope.bidPriceEmpty = true;
                $scope.bidPriceValidation = false;
                $scope.makeaBidLoding = false;
                return false;
            } else if (!isNaN($scope.auctionItem.minPrice) && $scope.auctionItem.minPrice > 0 && bidPrice >= $scope.auctionItem.minPrice && ($scope.auctionItem.status != 'UNCONFIRMED' && $scope.auctionItem.status != 'NOTSTARTED' )) {
                $scope.bidPriceValidation = true;                
                swal("Error", "Entered price is not valid. Please enter valid price", "error");
                $scope.makeaBidLoding = false;
                $scope.bidPriceEmpty = false;
                return false;
            } else if(!isNaN($scope.auctionItem.minPrice) && $scope.auctionItem.minPrice > 0 && bidPrice >= ($scope.auctionItem.minPrice - $scope.auctionItem.minBidAmount)&& ($scope.auctionItem.status != 'UNCONFIRMED' && $scope.auctionItem.status != 'NOTSTARTED' ) ){
                $scope.bidPriceValidation = true;                
                swal("Error", "Your bid price should be at least " + $scope.auctionItem.minBidAmount + " lower than your previous bid.", "error");
                $scope.makeaBidLoding = false;
                return false;
            } else {
                $scope.makeaBidLoding = true;
                $scope.bidPriceValidation = false;
                $scope.bidPriceEmpty = false;
            }
            if (($scope.bidAttachementName == "" || $scope.bidAttachement.length == 0) && $scope.quotationStatus == false) {
                $scope.bidAttachementValidation = true;
                $scope.makeaBidLoding = false;
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
            params.tax = $scope.vendorTaxes;
            //$log.info(params);
            //var parties = params.reqID + "$" + params.userID + "$" + params.price + "$" + params.quotation + "$" + params.quotationName + "$" + params.sessionID;
            //requirementHub.invoke('MakeBid', params, function (req) {
            auctionsService.makeabid(params).then(function (req) {
                if (req.errorMessage == '') {
                    //swal("Thanks !", "Your bidding process has been successfully updated", "success");
					 swal({
							title: "Thanks!",
							text: "Your bidding process has been successfully updated",
							type: "success",
							showCancelButton: false,
							confirmButtonColor: "#DD6B55",
							confirmButtonText: "Ok",
							closeOnConfirm: true
						},
						function () {
							location.reload();
						});
							
                    $("#quotationamount").val("");
                    //$(".removeattachedquotes").trigger('click');
                    $scope.quotationStatus = true;
                    $scope.auctionStarted = false;
                    $scope.getData();
                    $scope.makeaBidLoding = false;
                } else {
                    $scope.makeaBidLoding = false;
                    swal("Error!", req.errorMessage, "error");
                }
            });
            
            // auctionsService.makeabid(params).then(function(response){
            //     $log.info(response);
            //     if(response.errorMessage == ''){
            //         swal("Thanks !","Your bidding process has been successfully updated", "success"); 
            //          $("#makebidvalue").val("");
            //          $(".removeattachedquotes").trigger('click');
            //     } else {
            //         swal("Error!",response.errorMessage,"error");
            //     }
            //     $scope.getData();   
            // });
        }









        $scope.revquotationupload = function () {
            $scope.makeaBidLoding = true;            
            if (($scope.bidAttachementName == "" || $scope.bidAttachement.length == 0) && $scope.quotationStatus == false) {
                $scope.bidAttachementValidation = true;
                $scope.makeaBidLoding = false;
                return false;
            } else {
                $scope.bidAttachementValidation = false;
            }  
            var params = {};
            params.reqID = parseInt(id);
            params.sessionID = userService.getUserToken();
            params.userID = parseInt(userService.getUserId());
            params.price = 0;
            params.quotation = $scope.bidAttachement;
            params.quotationName = $scope.bidAttachementName;            
            params.tax = 0;           
            auctionsService.revquotationupload(params).then(function (req) {
                if (req.errorMessage == '') {                   
                    swal({
                        title: "Thanks!",
                        text: "Your Revised Quotation Uploaded Successfully",
                        type: "success",
                        showCancelButton: false,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true
                    },
                       function () {
                           location.reload();
                       });
                    $("#quotationamount1").val("");                   
                    $scope.quotationStatus = true;
                    $scope.auctionStarted = false;
                    $scope.getData();
                    $scope.makeaBidLoding = false;
                } else {
                    $scope.makeaBidLoding = false;
                    swal("Error!", req.errorMessage, "error");
                }
            });          
        }

        $scope.$on('timer-tick', function (event, args) {
            $scope.countdownVal = event.targetScope.countdown;
            if (event.targetScope.countdown < 61 && !$scope.disableStopBids && !$scope.disablereduceTime) {
                $timeout($scope.disableButtons(), 1000);
            }
            if (event.targetScope.countdown > 60) {
                $timeout($scope.enableButtons(), 1000);
            }
            //console.log("logging at " + event.targetScope.countdown + " time");

            if (event.targetScope.countdown <= 0) {
                console.log("refreshing at 0 time");
                if($scope.auctionStarted && ($scope.auctionItem.status == "CLOSED" || $scope.auctionItem.status == "STARTED")){
                    $scope.auctionItem.minPrice = $scope.auctionItem.auctionVendors[0].runningPrice;
                   
                    auctionsService.isnegotiationended(id, userService.getUserToken())
                    .then(function (response) {
                        if (response.errorMessage == '') {
                            if (response.objectID == 1) {
                                //if (($scope.auctionItem.customerID == userService.getUserId() || $scope.auctionItem.superUserID == userService.getUserId() )) {
                                var params = {};
                                params.reqID = id;
                                params.sessionID = userService.getUserToken();
                                params.userID = userService.getUserId();
                                var parties = id + "$" + userService.getUserId() + "$" + userService.getUserToken();
                                requirementHub.invoke('EndNegotiation', parties, function () {
                                    $scope.$broadcast('timer-set-countdown-seconds', 0);
                                    //swal("Negotiation Completed!", "Congratulations! you procurement process is now completed. " + $scope.toprankerName + " is the least bider with the value " + $scope.auctionItem.minPrice + " \n Your savings through PRM :" + ($scope.vendorInitialPrice - $scope.auctionItem.minPrice), "success");
                                });                        
                            }
                        }
                    }

                    //}
               )} else if ($scope.auctionItem.status == "NOTSTARTED"){
                    var params = {};
                    params.reqID = id;
                    params.sessionID = userService.getUserToken();
                    params.userID = userService.getUserId();

                    auctionsService.StartNegotiation(params)
                            .then(function (response) {
                            if (response.errorMessage == '') {
                                $scope.getData();
                                console.log("StartNegotiation========CTRL==========StartNegotiation");
                            }               
                        })

                    var parties = id + "$" + userService.getUserId() + "$" + userService.getUserToken();
                    requirementHub.invoke('CheckRequirement', parties, function () {
                        $scope.getData();
                        //$scope.$broadcast('timer-set-countdown-seconds', 0);
                        //swal("Negotiation Completed!", "Congratulations! you procurement process is now completed. " + $scope.toprankerName + " is the least bider with the value " + $scope.auctionItem.minPrice + " \n Your savings through PRM :" + ($scope.vendorInitialPrice - $scope.auctionItem.minPrice), "success");
                    });
                }
                
                //$scope.getData();
            }
            if (event.targetScope.countdown <= 120) {
                $scope.timerStyle = { 'color': '#f00' };
            }
            if (event.targetScope.countdown > 120 && $scope.auctionItem.status == 'NOTSTARTED') {
                $scope.timerStyle = { 'color': '#000' };
            }
            if (event.targetScope.countdown > 120 && $scope.auctionItem.status != 'NOTSTARTED') {
                $scope.timerStyle = { 'color': '#228B22' };
            }
            if (event.targetScope.countdown <= 60 && $scope.auctionItem.status == 'STARTED') {
                $scope.disableDecreaseButtons = true;
            }
            if (event.targetScope.countdown > 60 && $scope.auctionItem.status == 'STARTED') {
                $scope.disableDecreaseButtons = false;
            }
            if (event.targetScope.countdown <= 0 && $scope.auctionItem.status == 'NOTSTARTED') {
                $scope.showTimer = false;
                
                //$scope.getData();
                window.location.reload();
            }
            if (event.targetScope.countdown <= 3) {
                $scope.disableAddButton = true;
            }
            if(event.targetScope.countdown > 3){
                //$scope.getData();
                $scope.disableAddButton = false;
            }
        });


        requirementHub.on('checkRequirement', function (req) {
            //$log.info("client function called");
            // if($scope.auctionItem.requirementID == req.requirementID){
            //     $scope.auctionItem = req;
            //     $scope.setFields();
            // }
            if (id == req.requirementID && (userService.getUserId() == req.customerID || userService.getUserId() == req.superUserID || req.userIDList.indexOf(parseInt(userService.getUserId())) > -1)) {
                if(req.methodName == 'UpdateAuctionStartSignalR && !UpdateTime' && req.userIDList.indexOf(parseInt(userService.getUserId())) > -1){
                    growlService.growl("Customer has updated the start time.", 'inverse');
                } else if (req.methodName == "UpdateTime" && req.userIDList.indexOf(parseInt(userService.getUserId())) > -1){
                    growlService.growl("Negotiation time has been updated.", 'inverse');
                } else if (req.methodName == "MakeBid" && (userService.getUserId() == req.customerID || req.superUserID == userService.getUserId() )){
                    growlService.growl("A vendor has made a bid.", "inverse");
                } else if (req.methodName == "EndNegotiation") {
                    auctionsService.isnegotiationended(id, userService.getUserToken())
                    .then(function (response) {
                        if (response.errorMessage == '') {
                            if (response.objectID == 1) {
                                if ($scope.timeLeftMessage == "Negotiation Ends in: " && $scope.auctionItem.status == 'STARTED' && (userService.getUserId() == req.customerID || req.superUserID == userService.getUserId())) {
                                    swal("Negotiation Completed!", "Congratulations! your procurement process is now completed. " + $scope.toprankerName + " is the least bidder with the value " + $scope.auctionItem.minPrice + " \n Your savings through PRM 360 :" + ($scope.auctionItem.savings), "success");
                                } else if (req.userIDList.indexOf(parseInt(userService.getUserId())) > -1 && $scope.auctionItem.status == 'STARTED' && $scope.timeLeftMessage == "Negotiation Ends in: ") {
                                    if ($scope.vendorRank == 1) {
                                        swal("Negotiation Completed!", "Congratulations! you are the least bidder for this requirement. Your price is : " + $scope.auctionItem.minPrice + "\n Customer would be reaching out you shortly. All the best!", "success");
                                    } else {
                                        swal("Negotiation Completed!", "Bidding Completed.\n Thank You for your interest on this requirement. You ranked " + $scope.vendorRank + " in this requirement. Thank you for your participation.", "success");
                                    }
                                }
                            }
                        } else {
                            swal("Error", "Error in isNegotiationEnded", "inverse");
                        }
                    })
                    
                } else if (req.methodName == "StopBids"){
                    if (req.userIDList.indexOf(parseInt(userService.getUserId())) > -1){
                        growlService.growl("Negotiation Time reduced to 1 minute by the customer. New bids will not extend time.");
                    }
                }
                $scope.getData();
            }
        })


        $scope.stopBids = function () {
            swal({
                title: "Are you sure?",
                text: "The Negotiation will be stopped after one minute.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F44336",
                confirmButtonText: "Yes, Stop Bids!",
                closeOnConfirm: true
            }, function () {
                var params = {};
                params.reqID = id;
                params.sessionID = userService.getUserToken();
                params.userID = userService.getUserId();
                var parties = params.reqID + "$" + params.userID + "$" + params.sessionID;
                requirementHub.invoke('StopBids', parties, function (req) {
                    $scope.$broadcast('timer-set-countdown-seconds', 60);
                    $scope.disableButtons();
                    swal("Done!", "Negotiation time reduced to one minute.", "success");
                });
            });
        };

        $scope.disableButtons = function () {
            $scope.buttonsDisabled = true;
        }

        $scope.enableButtons = function () {
            $scope.buttonsDisabled = false;
        }

        $scope.editRequirement = function () {
            $log.info('in edit' + $stateParams.Id );
            $state.go('form.addnewrequirement', { 'Id': $stateParams.Id });
        }

        $scope.generatePOforUser = function () {
            $state.go('generate-po', { 'Id': $stateParams.Id });
        }

        $scope.metrialDispatchmentForm = function(){
            $state.go('material-dispatchment', { 'Id': $stateParams.Id });
        }

        $scope.paymentdetailsForm = function(){
            $state.go('payment-details', { 'Id': $stateParams.Id });
        }



        $scope.deleteRequirement = function(){
            swal({
                title: "Are you sure?",
                text: "The Negotiation will be deleted and an email will be sent out to all vendors involved.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F44336",
                confirmButtonText: "Yes, I am sure",
                closeOnConfirm: true
            }, function () {
                var params = {};
                params.reqID = id;
                params.sessionID = userService.getUserToken();
                params.userID = userService.getUserId();
                // auctionsService.updatebidtime(params);
                // swal("Done!", "Auction time reduced to oneminute.", "success");
                var parties = params.reqID + "$" + params.userID + "$" + params.sessionID + "$" + $scope.reason;
                requirementHub.invoke('DeleteRequirement', parties, function (req) {
                    $scope.$broadcast('timer-set-countdown-seconds', 60);
                    $scope.disableButtons();
                    swal("Done!", "Requirement has been cancelled", "success");
                });
            });
        }



        $scope.DeleteVendorFromAuction = function (VendoID, quotationUrl) {           
            if (($scope.auctionItem.auctionVendors.length > 2 || quotationUrl == "") && (quotationUrl == "" || (quotationUrl != "" && $scope.auctionItem.auctionVendors[2].quotationUrl != ""))) {
            swal({
                title: "Are you sure?",
                text: "The Vendor will be deleted and an email will be sent out to The vendor.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F44336",
                confirmButtonText: "Yes, I am sure",
                closeOnConfirm: true
            },function () {
                var params = {};
                params.reqID = id;
                params.sessionID = userService.getUserToken();
                params.userID = VendoID;

                auctionsService.DeleteVendorFromAuction(params)
                    .then(function (response) {
                        if (response.errorMessage == '') {
                            
                            $scope.getData();
                            swal("Done!", "Done! Vendor Deleted Successfully!", "success");
                        } else {
                            swal("Error", "You cannot Delete Vendor", "inverse");
                        }
                    })
            });
        }
        else{
            swal("Not Allowed", "You are not allowed to Delete the Vendors.", "error");
        }
        }









        $scope.vendorsFromPRM = 1;
        $scope.vendorsFromSelf = 2;

        // $scope.resetTimer = function () {
        //     $scope.auctionItem.TimeLeft.seconds = 1800;
        // }

    })