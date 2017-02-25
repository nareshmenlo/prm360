prmApp

.controller('viewprofileCtrl', function ($scope, $http, $state, domain, $filter, $stateParams, $timeout, auctionsService, userService, SignalRFactory, fileReader, growlService) {
$scope.userId = $stateParams.Id;
$scope.userObj = {};
this.userdetails = {};

$scope.subcategories = '';

$scope.callGetUserDetails = function () {
    userService.getProfileDetails({ "userid": userService.getUserId(), "sessionid": userService.getUserToken() })
        .then(function (response) {
            $scope.userStatus = "registered";
            if (response != undefined) {
                $scope.userDetails = response;
                $http({
                    method: 'GET',
                    url: domain + 'getcategories?userid=' + userService.getUserId() + '&sessionid=' + userService.getUserToken(),
                    encodeURI: true,
                    headers: { 'Content-Type': 'application/json' }
                }).then(function (response) {
                    if (response && response.data) {
                        if (response.data.length > 0) {
                            $scope.totalSubcats = $filter('filter')(response.data, { category: $scope.userDetails.category });
                            for (i = 0; i < $scope.userDetails.subcategories.length; i++) {
                                for (j = 0; j < $scope.totalSubcats.length; j++) {
                                    if ($scope.userDetails.subcategories[i].id == $scope.totalSubcats[j].id) {
                                        $scope.totalSubcats[j].ticked = true;
                                    }
                                }
                            }
                        }
                    } else {
                        console.log(response.data[0].errorMessage);
                    }
                }, function (result) {
                    console.log("there is no current auctions");
                });
                for (i = 0; i < $scope.userDetails.subcategories.length; i++) {
                    $scope.subcategories += $scope.userDetails.subcategories[i].subcategory + ";";
                }
                var data = response.establishedDate;
                var date = new Date(parseInt(data.substr(6)));
                $scope.userDetails.establishedDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

                var today = new Date();
                var todayDate = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
                $scope.userDetails.dateshow = 0;
                if ($scope.userDetails.establishedDate == todayDate) {
                    $scope.userDetails.dateshow = 1;
                }

                if (response.registrationScore > 89) {

                    $scope.userStatus = "Authorised";

                }
            }
        });
}


    $scope.callGetUserDetails();
    /*this.getuserdetails = function () {*/

    /*getuserdetails*/
    userService.getProfileDetails({ "userid": $scope.userId, "sessionid": userService.getUserToken() })
                .then(function (response) {
                    $scope.userObj = response;
                    var data = response.establishedDate;
                    var date = new Date(parseInt(data.substr(6)));
                    $scope.userObj.establishedDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
                    for (i = 0; i < $scope.userObj.subcategories.length; i++) {
                        $scope.subcategories += $scope.userObj.subcategories[i].subcategory + ";";
                    }
                }
            );

    /*getuserinfo*/
    userService.getUserDataNoCache()
                .then(function(response){
                    $scope.userdetails = response;
            })
    })