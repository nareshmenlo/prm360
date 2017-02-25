prmApp


    .controller('modalInstanceCtrlOTP', function ($scope, $uibModalInstance, userService, $rootScope) {

        //$scope.modalContent = content;
        $scope.otpvalueValidation = false;
        $scope.otpvalueValidationEmpty = false;
        $scope.otpvalueValidationError = false;
        $scope.modalotpvalue = "";
        $scope.ok = function () {
            $uibModalInstance.close();
        };
        $scope.afterOTPVerification = function () {
            $rootScope.$emit("CallProfileMethod");
        }
        $scope.verifyOTP = function () {
            if ($scope.modalotpvalue == "") {
                $scope.otpvalueValidation = true;
                $scope.otpvalueValidationEmpty = true;
            } else {
                $scope.otpvalueValidationEmpty = false;
                $scope.otpvalueValidation = false;
            }
            if (isNaN($scope.modalotpvalue)) {
                $scope.otpvalueValidationError = true;
                $scope.otpvalueValidation = true;
            } else {
                $scope.otpvalueValidationError = false;
                $scope.otpvalueValidation = false;
            }
            if (!$scope.otpvalueValidation) {
                userService.verifyOTP($scope.modalotpvalue)
                    .then(function (response) {
                        if (response.errorMessage == "") {
                            if (response.userInfo.isOTPVerified == 1) {
                                swal("Done!", "Mobile OTP Verified successfully.", "success");
                                $uibModalInstance.dismiss('cancel');
                                $scope.afterOTPVerification();
                            }
                        } else {
                            swal("Warning", response.errorMessage, "warning");
                        }
                    });
            }
        };

        $scope.sendOTPagain = function () {

            userService.resendotp(userService.getUserId());
        };


        $scope.sendEmailOTPagain = function () {

            userService.resendemailotp(userService.getUserId());
        };



        $scope.verifyEmailOTP = function () {
            if ($scope.modalotpvalue == "") {
                $scope.otpvalueValidation = true;
                $scope.otpvalueValidationEmpty = true;
            } else {
                $scope.otpvalueValidationEmpty = false;
                $scope.otpvalueValidation = false;
            }
            if (isNaN($scope.modalotpvalue)) {
                $scope.otpvalueValidationError = true;
                $scope.otpvalueValidation = true;
            } else {
                $scope.otpvalueValidationError = false;
                $scope.otpvalueValidation = false;
            }
            if (!$scope.otpvalueValidation) {
                userService.verifyEmailOTP($scope.modalotpvalue)
                    .then(function (response) {
                        if (response.errorMessage == "") {
                            if (response.userInfo.isEmailOTPVerified == 1) {
                                swal("Done!", "Email OTP Verified successfully.", "success");
                                $uibModalInstance.dismiss('cancel');
                                $scope.afterOTPVerification();
                            }
                        } else {
                            swal("Warning", response.errorMessage, "warning");
                        }
                    });
            }
        };





        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })
