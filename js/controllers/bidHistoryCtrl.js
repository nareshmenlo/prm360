prmApp

.controller('bidHistoryCtrl', function ($scope, $http, $state, domain, $filter, $stateParams, $timeout, auctionsService, userService, SignalRFactory, fileReader, growlService) {
    $scope.bidhistory = {};
    $scope.bidhistory.uID = $stateParams.Id;
    $scope.bidhistory.reqID = $stateParams.reqID;

    $scope.bidHistory = {};
    $scope.CovertedDate = '';
    $scope.Name = 'No previous bids';
    $scope.GetBidHistory = function () {
        auctionsService.GetBidHistory({ "reqid": $scope.bidhistory.reqID, 'userid': $scope.bidhistory.uID, "sessionid": userService.getUserToken()})
            .then(function (response) {
                $scope.bidHistory = response;

                if ($scope.bidHistory.length > 0) {
                    $scope.Name = $scope.bidHistory[0].firstName + ' ' + $scope.bidHistory[0].lastName;
                }

                //var data = response.createdTime;
                //var date = new Date(parseInt(data.substr(6)));
                //$scope.bidHistory.createdTime = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

            });
    }

    $scope.GetBidHistory();

    $scope.GetDateconverted = function (dateBefore) {
        //var data = dateBefore;
        //var date = new Date(parseInt(data.substr(6)));
        //$scope.CovertedDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
        //return $scope.CovertedDate;

        var date = dateBefore.split('+')[0].split('(')[1];        
        var newDate = new Date(parseInt(parseInt(date)));
        $scope.CovertedDate = newDate.toString().replace('Z', '');
        return $scope.CovertedDate;

    }
   
})