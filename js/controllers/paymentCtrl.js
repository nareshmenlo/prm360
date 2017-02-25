prmApp
.controller('paymentCtrl', function($scope, $state, $stateParams, userService, auctionsService){
	$scope.id = $stateParams.Id;
	$scope.formRequest = {};

	console.log("ABCD===========");
	
	$scope.getData = function(){
		auctionsService.getrequirementdata({ "reqid": $stateParams.Id, "sessionid": userService.getUserToken(), 'userid': userService.getUserId() })
		.then(function(response){
			$scope.auctionItem = response;
			$scope.formRequest.selectedVendor = $scope.auctionItem.auctionVendors[0];

			console.log("ABCD===========");
		})
	}

	$scope.getData();

	$scope.postRequest = function(){
		var ts = moment($scope.formRequest.paymentDate, "DD-MM-yyyy HH:mm").valueOf();
        var m = moment(ts);
        var deliveryDate = new Date(m);
        var milliseconds = parseInt(deliveryDate.getTime() / 1000.0);
        $scope.formRequest.paymentDate = "/Date(" + milliseconds + "000+0530)/";

        /*var ts1 = moment($scope.formRequest.paymentScheduleDate, "DD-MM-yyyy HH:mm").valueOf();
        var m1 = moment(ts1);
        var deliveryDate1 = new Date(m1);
        var milliseconds1 = parseInt(deliveryDate1.getTime() / 1000.0);
        $scope.formRequest.paymentScheduleDate = "/Date(" + milliseconds1 + "000+0530)/";*/

		$scope.formRequest.sessionID = userService.getUserToken();
		$scope.formRequest.requirementID = $scope.auctionItem.requirementID;
		$scope.formRequest.userID = userService.getUserId();
		auctionsService.paymentdetails($scope.formRequest)
		.then(function(response){
			if (response.objectID != 0) {
                swal({
                    title: "Done!",
                    text: "Data Saved Successfully.",
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