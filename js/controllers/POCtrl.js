prmApp
.controller('POCtrl', function($scope, $state, $stateParams, userService, auctionsService, fileReader){
	$scope.id = $stateParams.Id;
	$scope.formRequest = {};
	$scope.formRequest1 = {};


	$scope.getData = function(){
		auctionsService.getrequirementdata({ "reqid": $stateParams.Id, "sessionid": userService.getUserToken(), 'userid': userService.getUserId() })
		.then(function(response){
			$scope.auctionItem = response;
			$scope.formRequest1.selectedVendor = $scope.auctionItem.selectedVendor;
			$scope.formRequest1.deliveryAddress = $scope.auctionItem.deliveryLocation;

			$scope.formRequest.selectedVendor = $scope.formRequest1.selectedVendor;
			$scope.formRequest.deliveryAddress = $scope.formRequest1.deliveryAddress;

			if ($scope.auctionItem.poLink != ''){

			auctionsService.getpodetails({ "reqid": $stateParams.Id, "sessionid": userService.getUserToken(), 'userid': userService.getUserId() })
            .then(function (response) {
                $scope.formRequest = response;
                if ($scope.formRequest.requirementID > 0) {
                    var date = $scope.auctionItem.deliveryTime.split('+')[0].split('(')[1];
                    var date1 = moment($scope.auctionItem.deliveryTime).format('DD/MM/YYYY');
                    console.log(date1);
                    var newDate = new Date(parseInt(parseInt(date)));
                    //$scope.formRequest.expectedDelivery = newDate.toString().replace('Z', '');
                    $scope.formRequest.expectedDelivery = date1;
                } else {
                    $scope.formRequest.expectedDelivery = '';
                }
                $scope.formRequest.selectedVendor = $scope.formRequest1.selectedVendor;
                $scope.formRequest.deliveryAddress = $scope.formRequest1.deliveryAddress;
            })
			}
			console.log("ABCD===========");
		})
	}

	$scope.getData();

	this.UploadPO = 0;


	

	$scope.getFile1 = function (id, doctype, ext) {
            $scope.progress = 0;
            $scope.file = $("#" + id)[0].files[0];
            $scope.docType = doctype + "." + ext;
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    if (id == "poFile") {
                        $scope.formRequest.poFile = { "fileName": '', 'fileStream': null };
                        var bytearray = new Uint8Array(result);
                        $scope.formRequest.poFile.fileStream = $.makeArray(bytearray);
                        $scope.formRequest.poFile.fileName = $scope.file.name;
                    } 

                });
        };

	$scope.postRequest = function(){
        if(!$scope.formRequest.POID || $scope.formRequest.POID == ""){
            $scope.formRequest.POID = $scope.formRequest.requirementID + "_" + $scope.formRequest.customerID;
        }
        if(!$scope.formRequest.comments){
            $scope.formRequest.comments = "";
        }
		var ts = moment($scope.formRequest.expectedDelivery, "DD-MM-yyyy HH:mm").valueOf();
        var m = moment(ts);
        var deliveryDate = new Date(m);
        var milliseconds = parseInt(deliveryDate.getTime() / 1000.0);
        $scope.formRequest.expectedDelivery = "/Date(" + milliseconds + "000+0530)/";

        /*var ts1 = moment($scope.formRequest.paymentScheduleDate, "DD-MM-yyyy HH:mm").valueOf();
        var m1 = moment(ts1);
        var deliveryDate1 = new Date(m1);
        var milliseconds1 = parseInt(deliveryDate1.getTime() / 1000.0); 
        $scope.formRequest.paymentScheduleDate = "/Date(" + milliseconds1 + "000+0530)/";*/

        if ($scope.formRequest.poFile == null)
        {
            $scope.formRequest.poFile = { "fileName": '', 'fileStream': null };
        }

		$scope.formRequest.sessionID = userService.getUserToken();
		$scope.formRequest.requirementID = $scope.auctionItem.requirementID;
		$scope.formRequest.customerID = userService.getUserId();
		$scope.formRequest.selectedVendor = $scope.auctionItem.selectedVendor;
		$scope.formRequest.deliveryAddress = $scope.auctionItem.deliveryLocation;
        
		auctionsService.generatepo($scope.formRequest)
		.then(function(response){
			if (response.objectID != 0) {
                swal({
                    title: "Done!",
                    text: "Purchase Order Generated Successfully.",
                    type: "success",
                    showCancelButton: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true
                },
	                function () {
	                    //$state.go('view-requirement');
	                    $state.go('view-requirement', { 'Id': response.objectID });
	                });
            }
		})
	}
})