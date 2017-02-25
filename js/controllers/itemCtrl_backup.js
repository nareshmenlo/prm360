prmApp

    // =========================================================================
    // AUCTION ITEM
    // =========================================================================

    .controller('itemCtrl', function ($scope, $filter, $stateParams, $http, domain, fileReader, $state, $timeout, auctionsService, userService, SignalRFactory, growlService, $log, signalRHubName) {

        var id = $stateParams.Id;
        $scope.showTimer = false;
        $scope.userIsOwner = false;

        $scope.currentID = -1;
        $scope.timerStyle = { 'color': '#000' };
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
       // $scope.isTimerStarted = false;

        $log.info('trying to connect to service')
        var requirementHub = SignalRFactory('', signalRHubName);
        $log.info('connected to service')

        requirementHub.on('checkRequirement', function (req) {
            //$log.info("client function called");
            // if($scope.auctionItem.requirementID == req.requirementID){
            //     $scope.auctionItem = req;
            //     $scope.setFields();
            // }
            if (id == req.requirementID && (userService.getUserId() == req.customerID || userService.getUserId() == req.superUserID || req.userIDList.indexOf(parseInt(userService.getUserId())) > -1)) {
                if(req.methodName == 'UpdateAuctionStartSignalR' && req.userIDList.indexOf(parseInt(userService.getUserId())) > -1){
                    growlService.growl("Customer has updated the start time.", 'inverse');
                } else if (req.methodName == "UpdateTime" && req.userIDList.indexOf(parseInt(userService.getUserId())) > -1){
                    growlService.growl("Auction time has been updated.", 'inverse');
                } else if (req.methodName == "MakeBid" && (userService.getUserId() == req.customerID || req.superUserID == userService.getUserId() )){
                    growlService.growl("A vendor has made a bid.", "inverse");
                }
                $scope.getData();
            }
        })

        /*$.ajax({
            url: "http://www.timeapi.org/ist/now.json", 
            type: "GET",   
            dataType: 'jsonp',
            cache: false,
            success: function(response){                          
                alert(response.dateString);                   
            }           
        }); */

        $scope.updateTimeLeftSignalR = function () {
            var parties = id + "$" + userService.getUserId() + "$" + "10000" + "$" + userService.getUserToken();
            requirementHub.invoke('UpdateTime', parties, function (req) {
                //$log.info(req);
            })
        };

        $scope.selectVendor = function(){
            var params = {
                userID: userService.getUserId(),
                vendorID: vendorID,
                reqID: $scope.auctionItem.requirementID,
                reason: $scope.reason,
                sessionID: userService.getUserToken()
            }
            auctionsService.rateVendor(params)
            .then(function(response){
                if(response.errorMessage == ""){
                    growlService.growl("Vendor " + response.userInfo.firstName + " " + response.userInfo.lastName +  " has been selected for the final  ","inverse");
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
            if(bidPrice < (95 * $scope.auctionItem.auctionVendors[0].runningPrice/100)){
                swal({
                    title: "Are you sure?",
                    text: "The bid price is less than 95% of your previous bid. Are you sure you want to go forward with the bid?",
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
                    params.price = parseFloat(bidPrice);
                    params.quotationName = $scope.bidAttachementName;
                    //$log.info(params);
                    //var parties = params.reqID + "$" + params.userID + "$" + params.price + "$" + params.quotation + "$" + params.quotationName + "$" + params.sessionID;
                    requirementHub.invoke('MakeBid', params, function (req) {
                        //auctionsService.makeabid(params).then(function(req){
                        if (req.errorMessage == '') {
                            swal("Thanks !", "Your bidding process has been successfully updated", "success");
                            $("#makebidvalue").val("");
                            $scope.getData();
                           // $(".removeattachedquotes").trigger('click');
                        } else {
                            swal("Error!", req.errorMessage, "error");
                        }
                    });
                });
			}
		else if(bidPrice > $scope.auctionItem.auctionVendors[0].runningPrice - $scope.auctionItem.minBidAmount){
                 swal("Error!", "Your amount must be at least " + $scope.auctionItem.minBidAmount + " less than your previous bid.", 'error');
		return false;
            }
		else
            {
               // function () {
                var params = {};
                params.reqID = parseInt(id);
                params.sessionID = userService.getUserToken();
                params.userID = parseInt(userService.getUserId());
                params.price = parseFloat(bidPrice);
                params.quotationName = $scope.bidAttachementName;
                //$log.info(params);
                //var parties = params.reqID + "$" + params.userID + "$" + params.price + "$" + params.quotation + "$" + params.quotationName + "$" + params.sessionID;
                requirementHub.invoke('MakeBid', params, function (req) {
                    //auctionsService.makeabid(params).then(function(req){
                    if (req.errorMessage == '') {
                        swal("Thanks !", "Your bidding process has been successfully updated", "success");
                        $("#makebidvalue").val("");
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
                $scope.timeLeftMessage = "Auction Starts in: ";
                $scope.startBtns = true;
                $scope.customerBtns = false;
            } else if ($scope.auctionItem.status == "STARTED") {
                $scope.mactrl.skinSwitch('orange');
                $scope.errMsg = "Negotiation has started.";
                $scope.showStatusDropDown = false;
                $scope.auctionStarted = true;
                $scope.timeLeftMessage = "Auction Ends in: ";
                $scope.startBtns = false;
                $scope.customerBtns = true;                
            } else if ($scope.auctionItem.status == "DELETED"){
                $scope.mactrl.skinSwitch('bluegray');
                $scope.errMsg = "This requirement has been cancelled.";
                $scope.showStatusDropDown = false;
                $scope.isDeleted = true;
            }else if($scope.auctionItem.status == "PO Generated"){
                $scope.mactrl.skinSwitch('lightblue');
                $scope.errMsg = "The PO has been generated. Please find the PO here: ";
                $scope.showStatusDropDown = true;
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
                $scope.timeLeftMessage = "Negotiation Ends in: ";
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
            var newDate1 = new Date(parseInt(parseInt(date)));
            $scope.auctionItem.deliveryTime = newDate.toString().replace('Z', '');


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
                    $scope.auctionItem.auctionVendors[i].totalPriceIncl = $scope.auctionItem.auctionVendors[i].runningPrice + ($scope.auctionItem.auctionVendors[i].runningPrice * $scope.auctionItem.auctionVendors[i].taxes) / 100;
                }
                if ($scope.auctionItem.auctionVendors[i].initialPrice == 0) {
                    $scope.auctionItem.auctionVendors[i].initialPrice = 'NA';
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
        }


        
        $scope.vendorBidPrice = null;
        $scope.auctionStarted = true;
        $scope.customerBtns = true;
        $scope.showVendorTable = true;
        $scope.quotationStatus = true;
        $scope.toprankerName = "";
        $scope.vendorRank = 0;
        $scope.quotationUrl = "";
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

        $scope.getData = function () {
            auctionsService.getrequirementdata({ "reqid": $stateParams.Id, "sessionid": userService.getUserToken(), 'userid': userService.getUserId() })
                .then(function (response) {
                    $scope.auctionItem = response;

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
                status: 'PO Generated',
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
                status: 'PO Generated',
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

        $scope.updateStatus = function () {
            var params = {
                reqid: $scope.auctionItem.requirementID,
                userid: userService.getUserId(),
                status: $scope.auctionItem.status,
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
            $scope.file = $("#quotation")[0].files[0];
            $log.info($("#quotation")[0].files[0]);
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
            $scope.$on('timer-tick', function (event, args) {
                if (!isDone) {
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
                        //$log.info(req);
                    })
                }
            });
        }
        
        $scope.updateAuctionStart = function () {
			var params = {};
            params.auctionID = id;
            
            var startValue = $scope.startTime;
            
            if (startValue && startValue != null && startValue != "") {
				var ts = moment($scope.startTime, "DD-MM-yyyy HH:mm").valueOf();
				var m = moment(ts);
                var auctionStartDate = new Date(m);
				auctionsService.getdate()
                .then(function(response1){
                    var CurrentDate = moment(new Date(parseInt(response1.substr(6))));
				$log.debug(CurrentDate<auctionStartDate);
				$log.debug('div'+auctionStartDate);  
				if(CurrentDate>=auctionStartDate)
				{
					
					swal("Done!", "Your Negotiation Start Time should be greater than current time.", "error");
					return;
				}
				
				
                var milliseconds = parseInt(auctionStartDate.getTime() / 1000.0);
                params.postedOn = "/Date(" + milliseconds + "000+0530)/";
                params.auctionEnds = "/Date(" + milliseconds + "000+0530)/";
                params.customerID = userService.getUserId();
                params.sessionID = userService.getUserToken();
                if ($scope.auctionItem.auctionVendors.length == 0  || $scope.auctionItem.auctionVendors[0].quotationUrl == "") {
                    swal("Not Allowed", "You are not allowed to create a start time until at least one vendor makes a bid.", "error");
                } else {
					
                    requirementHub.invoke('UpdateAuctionStartSignalR', params, function (req) {
                        swal("Done!", "Your Negotiation Start Time Updated Successfully!", "success");
                       // $scope.isTimerStarted = true;
                        $scope.getData();
                        $scope.auctionItem.timeLeft = req.timeLeft;
                        var start = $scope.auctionItem.startTime.split('+')[0].split('(')[1];
						auctionsService.getdate()
                        .then(function(response){
                            var curDate = new Date(parseInt(response.substr(6)));
                        //var curDate = new Date();
                        var myEpoch = curDate.getTime();
                        if (($scope.auctionItem.customerID == userService.getUserId() || $scope.auctionItem.superUserID == userService.getUserId() ) && start > myEpoch) {
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
			
			
			

            } else {
                alert("Please enter the date and time to update Start Time to.");
            }
        }

        $scope.makeaBid = function () {
            var bidPrice = $("#quotationamount").val();
            //$log.info($scope.auctionItem.minPrice);
            //$log.info(bidPrice);

            if (bidPrice == "") {
                $scope.bidPriceEmpty = true;
                $scope.bidPriceValidation = false;
                return false;
            } else if (!isNaN($scope.auctionItem.minPrice) && $scope.auctionItem.minPrice > 0 && bidPrice >= $scope.auctionItem.minPrice && ($scope.auctionItem.status != 'UNCONFIRMED' && $scope.auctionItem.status != 'NOTSTARTED' )) {
                $scope.bidPriceValidation = true;
                swal("Error", "Entered price is not valid. Please enter valid price", "error");
                $scope.bidPriceEmpty = false;
                return false;
            } else if(!isNaN($scope.auctionItem.minPrice) && $scope.auctionItem.minPrice > 0 && bidPrice >= ($scope.auctionItem.minPrice - $scope.auctionItem.minBidAmount)&& ($scope.auctionItem.status != 'UNCONFIRMED' && $scope.auctionItem.status != 'NOTSTARTED' ) ){
                $scope.bidPriceValidation = true;
                swal("Error", "Your bid price should be at least " + $scope.auctionItem.minBidAmount + " lower than your previous bid.", "error");
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
            params.tax = $scope.vendorTaxes;
            //$log.info(params);
            //var parties = params.reqID + "$" + params.userID + "$" + params.price + "$" + params.quotation + "$" + params.quotationName + "$" + params.sessionID;
            //requirementHub.invoke('MakeBid', params, function (req) {
            auctionsService.makeabid(params).then(function (req) {
                if (req.errorMessage == '') {
                    swal("Thanks !", "Your bidding process has been successfully updated", "success");
                    $("#quotationamount").val("");
                    //$(".removeattachedquotes").trigger('click');
                    $scope.quotationStatus = true;
                    $scope.auctionStarted = false;
                    $scope.getData();
                } else {
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

        $scope.$on('timer-tick', function (event, args) {
            $scope.countdownVal = event.targetScope.countdown;
            if (event.targetScope.countdown < 61 && !$scope.disableStopBids && !$scope.disablereduceTime) {
                $timeout($scope.disableButtons(), 1000);
            }
            if (event.targetScope.countdown > 60) {
                $timeout($scope.enableButtons(), 1000);
            }

            if (event.targetScope.countdown == 0 && $scope.auctionStarted && ($scope.auctionItem.status == "CLOSED" || $scope.auctionItem.status == "STARTED")) {
                $scope.auctionItem.minPrice = $scope.auctionItem.auctionVendors[0].runningPrice;
                if (($scope.auctionItem.customerID != userService.getUserId() && $scope.auctionItem.superUserID != userService.getUserId() ) && $scope.vendorRank == 1) {
                    swal("Negotiation Completed!", "Congratulations! you are the least bidder for this requirement. Your price is : " + $scope.auctionItem.minPrice + "\n Customer would be reaching out you shortly. All the best!", "success");
                } else if (($scope.auctionItem.customerID != userService.getUserId() && $scope.auctionItem.superUserID != userService.getUserId() ) && $scope.vendorRank != 1) {
                    swal("Negotiation Completed!", "Bidding Completed.\n Thank You for your interest on this requirement. You ranked " + $scope.vendorRank + " in this requirement. Thank you for your participation.", "success");
                } else if (($scope.auctionItem.customerID == userService.getUserId() || $scope.auctionItem.superUserID == userService.getUserId() )) {
                    var params = {};
                params.reqID = id;
                params.sessionID = userService.getUserToken();
                params.userID = userService.getUserId();
                params.newTicks = 0;
                // auctionsService.updatebidtime(params);
                // swal("Done!", "Auction time reduced to oneminute.", "success");
                var parties = params.reqID + "$" + params.userID + "$" + params.newTicks + "$" + params.sessionID;
                requirementHub.invoke('UpdateTime', parties, function (req) {
                        $scope.$broadcast('timer-set-countdown-seconds', 0);
                        $scope.disableButtons();
                        swal("Negotiation Completed!", "Congratulations! you procurement process is now completed. " + $scope.toprankerName + " is the least bider with the value " + $scope.auctionItem.minPrice + " \n Your savings through PRM :" + ($scope.vendorInitialPrice - $scope.auctionItem.minPrice), "success");
                    });
                    requirementHub.invoke('completeNegotiation')
                    .then(function(response){
                        
                    })
                    
                }
                $scope.getData();
            }
            if (event.targetScope.countdown <= 120) {
                $scope.timerStyle = { 'color': '#f00' };
            }
            if (event.targetScope.countdown > 120) {
                $scope.timerStyle = { 'color': '#000' };
            }
            if (event.targetScope.countdown == 0) {
                $scope.showTimer = false;
                $scope.getData();
            }
            if(event.targetScope.countdown == 1){
                //$scope.getData();
            }
        });

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
                params.newTicks = 60;
                // auctionsService.updatebidtime(params);
                // swal("Done!", "Auction time reduced to oneminute.", "success");
                var parties = params.reqID + "$" + params.userID + "$" + params.newTicks + "$" + params.sessionID;
                requirementHub.invoke('UpdateTime', parties, function (req) {
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

        $scope.vendorsFromPRM = 1;
        $scope.vendorsFromSelf = 2;

        // $scope.resetTimer = function () {
        //     $scope.auctionItem.TimeLeft.seconds = 1800;
        // }

    })