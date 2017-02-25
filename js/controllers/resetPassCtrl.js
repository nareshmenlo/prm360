prmApp

    .controller('resetPassCtrl', function ($scope, $http, $state, domain, $filter, $stateParams, $timeout, auctionsService, userService, SignalRFactory, fileReader, growlService) {
        $scope.resetpass = {};
        $scope.resetpass.email = $stateParams.email;
        $scope.resetpass.sessionid = $stateParams.sessionid;
        $scope.resetpass.OTP = '';
        $scope.resetpass.NewPass = '';
        $scope.resetpass.ConfNewPass = '';

        $scope.resetpassword = function () {
            userService.resetpassword($scope.resetpass)
                .then(function (response) {
                    if (response.data.errorMessage =='') {                     
                        swal("Done!", "Password reset successfully.", "success");
                    } else {
                        swal("Warning", response.data.errorMessage, "warning");
                        return;
                    }
                    //$state.go('login');
                    //return;
                });

        };
    })
