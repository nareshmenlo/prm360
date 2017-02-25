prmApp
    //=================================================
    // LOGIN
    //=================================================

    .controller('loginCtrl', function ($timeout, $state, $scope, growlService, userService, auctionsService, $http, domain, $rootScope, fileReader) {

        //Status
        $scope.login = 1;
        $scope.register = 0;
        $scope.otp = 0;
        $scope.otpvalue = 0;
        $scope.verification = 0;
        $scope.verificationObj = {};
        $scope.otpobj = {};
        $scope.register_vendor = 0;
        $scope.forgot = 0;
        $scope.forgotpassword = {};
        $scope.loggedIn = userService.isLoggedIn();
        $scope.userError = {};
        $scope.user = {};
        $scope.checkEmailUniqueResult = false;
        $scope.checkPhoneUniqueResult = false;
        $scope.vendorregisterobj = $scope.registerobj = {};
        $scope.otpvalueValidation = false;
        $scope.otpvalueValidationEmpty = false;
        $scope.otpvalueValidationError = false;

        $scope.registrationbtn = function () {
            $scope.register = 1;
            $scope.registerobj = {};
            $scope.otp = $scope.forgot = $scope.register_vendor = $scope.login = 0;
            $scope.checkEmailUniqueResult = false;
            $scope.checkPhoneUniqueResult = false;
        };
        $scope.loginbtn = function () {
            $scope.login = 1;
            $scope.user = {};
            $scope.otp = $scope.forgot = $scope.register_vendor = $scope.register = 0;
        };
        $scope.forgotbtn = function () {
            $scope.otp = $scope.login = $scope.register_vendor = $scope.register = 0;
            $scope.forgot = 1;
        };

        $scope.sendOTPagain = function () {
            userService.resendotp(userService.getUserId());
        };
        $scope.vendorregistrationbtn = function () {
            $scope.otp = $scope.login = $scope.forgot = $scope.register = 0;
            $scope.vendorregisterobj = {};
            $scope.register_vendor = 1;
            $scope.checkEmailUniqueResult = false;
            $scope.checkPhoneUniqueResult = false;
        };

         $scope.PhoneValidate = function(){
            console.log("siva  1111111---->"); 
            var phoneno = /^\d{10}$/; 
            var input = $scope.registerobj.phoneNum;
             if (input = phoneno) {
                console.log("siva  2222222---->");
                return true
                console.log("siva  2222222---->");
                    
            }
            
        };

        function validate(evt) {
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;
  key = String.fromCharCode( key );
  var regex = /[0-9]|\./;
  if( !regex.test(key) ) {
    theEvent.returnValue = false;
    if(theEvent.preventDefault) theEvent.preventDefault();
  }
}


        $scope.PhoneValidate1 = function(){
             if ($scope.vendorregisterobj.phoneNum != "" && isNaN($scope.vendorregisterobj.phoneNum)) {
                return false;
            }
        };
        

        $scope.EmailValidate = function(){
            var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
            var result = re.test($scope.registerobj.email);
            if (!result){
                $scope.showMessage = true;
                $scope.msg = $scope.getErrMsg("Please enter a valid Email Address");
            } else {
                $scope.showMessage = false;
                $scope.msg = '';
            }
        }


        $scope.EmailValidateVendor = function(){
            var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
            var result = re.test($scope.vendorregisterobj.email);
            if (!result){
                $scope.showMessage = true;
                $scope.msg = $scope.getErrMsg("Please enter a valid Email Address");
            } else {
                $scope.showMessage = false;
                $scope.msg = '';
            }
        }


        $scope.userregistration = function () {
            var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
            var result = re.test($scope.registerobj.email);
            if (isNaN($scope.registerobj.phoneNum)) {
                $scope.showMessage = true;
                $scope.msg = $scope.getErrMsg("Please enter a valid Phone Number");
            } else if (!result){
                $scope.showMessage = true;
                $scope.msg = $scope.getErrMsg("Please enter a valid Email Address");
            } else {
                $scope.showMessage = false;
                $scope.msg = '';
            }
            if (!$scope.showMessage) {
                $scope.registerobj.username = $scope.registerobj.email;
                userService.userregistration($scope.registerobj).then(function (error) {
                    $scope.loggedIn = userService.isLoggedIn();
                    if (error.errorMessage != "") {
                        $scope.showMessage = true;
                        $scope.msg = $scope.getErrMsg(error);
                    } else {
                        $scope.otp = 1;
                        $scope.forgot = $scope.login = $scope.register_vendor = $scope.register = 0;
                    }
                });
            }
        };

        $scope.docsVerification = function () {
            var params = { 'userID': userService.getUserId(), 'files': $scope.CredentialUpload, 'sessionID': userService.getUserToken() };
            $http({
                method: 'POST',
                url: domain + 'updatecredentials',
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' },
                data: params
            }).then(function (response) {
                console.log(response);
                if (response && response.data && response.data.errorMessage == "") {
                    $state.go('pages.profile.profile-about');
                    growlService.growl('Welcome to PRM360! Your credentials are being verified. Our associates will contact you as soon as it is done.', 'inverse');
                } else {
                    console.log(response.data[0].errorMessage);
                }
            }, function (result) {
                console.log("there is no current auctions");
            });
        }

        $scope.verifyOTP = function () {
            $scope.otpvalue = $scope.otpobj.otp;
            $scope.otpvalue.phone = $scope.registerobj.phoneNum;
            if ($scope.otpvalue == "") {
                $scope.otpvalueValidation = true;
                $scope.otpvalueValidationEmpty = true;
            } else {
                $scope.otpvalueValidationEmpty = false;
                $scope.otpvalueValidation = false;
            }
            if (isNaN($scope.otpvalue)) {
                $scope.otpvalueValidationError = true;
                $scope.otpvalueValidation = true;
            } else {
                $scope.otpvalueValidationError = false;
                $scope.otpvalueValidation = false;
            }
            if (!$scope.otpvalueValidation) {
                userService.verifyOTP($scope.otpvalue)
                    .then(function (response) {
                        if (response.errorMessage == "") {
                            if (response.userInfo.isOTPVerified == 1) {
                                $scope.isOTPVerified = 1;
                                
                                swal("Done!", "Mobile OTP Verified successfully.", "success");                                
                            } else {
                                $scope.isOTPVerified = 0;
                                swal("Warning", "Please enter valid OTP", "warning");
                            }
                        } else {
                            swal("Warning", response.errorMessage, "warning");
                        }
                    });
            }
        };

        $scope.getFile1 = function (id, doctype, ext) {
            $scope.progress = 0;
            $scope.file = $("#" + id)[0].files[0];
            $scope.docType = doctype + "." + ext;
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    var bytearray = new Uint8Array(result);
                    var fileobj = {};
                    fileobj.fileStream = $.makeArray(bytearray);
                    fileobj.fileType = $scope.docType;
                    fileobj.isVerified = 0;
                    //$scope.verificationObj.attachmentName=$scope.file.name;
                    $scope.CredentialUpload.push(fileobj);
                });
            //console.log($scope.CredentialUpload);
        };

        $scope.changePhoneNumber = function () {
            $scope.newphonenumber = $("#newphonenumber").val();
            console.log($scope.newphonenumber);
            if ($scope.newphonenumber == "") {
                $scope.newphonenumber_errors = true;
                $scope.newphonenumber_required_error = true;
                return false;
            } else {
                $scope.newphonenumber_errors = false;
                $scope.newphonenumber_required_error = false;
            }
            if (isNaN($scope.newphonenumber)) {
                $scope.newphonenumber_errors = true;
                $scope.newphonenumber_validation_error = true;
                return false;
            } else {
                $scope.newphonenumber_errors = false;
                $scope.newphonenumber_validation_error = false;
            }
            if (!$scope.newphonenumber_errors) {
                var userinfo = userService.getUserObj();
                userinfo.phoneNum = $scope.newphonenumber;
                userinfo.sessionID = userService.getUserToken();
                userinfo.emailAddress = userinfo.email;
                userinfo.aboutUs = "";
                userService.updateUser(userinfo);
                $scope.changepasswordstatus = false;
            }
        };

        $scope.vendorregistration = function () {
            if (isNaN($scope.vendorregisterobj.phoneNum)) {
                $scope.showMessage = true;
                $scope.msg = $scope.getErrMsg("Please enter a valid Phone Number");
            } else {
                $scope.showMessage = false;
                $scope.msg = '';
            }
            $scope.vendorregisterobj.username = $scope.vendorregisterobj.email;
            userService.vendorregistration($scope.vendorregisterobj).then(function (error) {
                $scope.loggedIn = userService.isLoggedIn();
                /*if (error) {
                    $scope.showMessage = true;
                    $scope.msg = $scope.getErrMsg(error);
                }else{
                   $scope.otp =1;  
                   $scope.forgot = $scope.login = $scope.register_vendor = $scope.register = 0;                     
                }*/
                if (error.errorMessage != "") {
                    $scope.showMessage = true;
                    $scope.msg = $scope.getErrMsg(error);
                } else {
                    $scope.otp = 1;
                    $scope.forgot = $scope.login = $scope.register_vendor = $scope.register = 0;
                }
            });
        };

        $scope.RegisterVendor = function () {
            console.log($scope.vendorregisterobj);
            if (isNaN($scope.vendorregisterobj.phoneNum)) {
                $scope.showMessage = true;
                $scope.msg = $scope.getErrMsg("Please enter a valid Phone Number");
            } else {
                $scope.showMessage = false;
                $scope.msg = '';
            }
            if (!$scope.showMessage) {
                $scope.vendorregisterobj.username = $scope.vendorregisterobj.email;
                userService.vendorregistration1($scope.vendorregisterobj).then(function (error) {
                    $scope.loggedIn = userService.isLoggedIn();
                    if (error.errorMessage != "") {
                        $scope.showMessage = true;
                        $scope.msg = $scope.getErrMsg(error);
                    } else {
                        $scope.otp = 1;
                        $scope.forgot = $scope.login = $scope.register_vendor = $scope.register = 0;
                    }
                });
            }
        }


        $scope.RegisterVendor1 = function () {
            console.log($scope.vendorregisterobj);
            if (isNaN($scope.vendorregisterobj.phoneNum)) {
                $scope.showMessage = true;
                $scope.msg = $scope.getErrMsg("Please enter a valid Phone Number");
            } else {
                $scope.showMessage = false;
                $scope.msg = '';
            }
            if (!$scope.showMessage) {
                $scope.vendorregisterobj.username = $scope.vendorregisterobj.email;
                userService.vendorregistration1($scope.vendorregisterobj).then(function (error) {
                    $scope.loggedIn = userService.isLoggedIn();
                    if (error.errorMessage != "") {
                        $scope.showMessage = true;
                        $scope.msg = $scope.getErrMsg(error);
                    } else {
                        $scope.otp = 1;
                        $scope.forgot = $scope.login = $scope.register_vendor = $scope.register = 0;
                    }
                });
            }
        }



        $scope.checkUserUniqueResult = function (idtype, inputvalue) {
            if (inputvalue == "" || inputvalue == undefined) {
                return false;
            }
            $scope.checkPhoneUniqueResult = false;
            $scope.checkEmailUniqueResult = false;
            userService.checkUserUniqueResult(inputvalue, idtype).then(function (response) {
                if (idtype == "PHONE") {
                    $scope.checkPhoneUniqueResult = !response;
                } else if (idtype == "EMAIL") {
                    $scope.checkEmailUniqueResult = !response;
                }
            });
        };
        $scope.forgotpasswordfunction = function () {
            userService.forgotpassword($scope.forgotpassword)
                .then(function (response) {
                    if (response.data.errorMessage != "No user found") {
                        $scope.forgotpassword = {};
                        swal("Done!", "Email sent to your registered email.", "success");
                        $scope.login = 1;
                        $scope.user = {};
                        $scope.forgot = $scope.register_vendor = $scope.register = 0;
                    } else {
                        swal("Warning", "Please check the email address you have entered.", "warning");
                    }
                });
        };


        $scope.closeMsg = function () {
            $scope.showMessage = false;
        }
        $scope.loginSubmit = function () {
            userService.login($scope.user).then(function (error) {
                $scope.loggedIn = userService.isLoggedIn();
                if (error.errorMessage != "") {
                    $scope.showMessage = true;
                    $scope.msg = $scope.getErrMsg(error);
                } else if (error.userInfo.credentialsVerified == 0 || error.userInfo.isOTPVerified == 0) {
                    $state.go('pages.profile.profile-about');
                    //$scope.otp =1;  
                    //$scope.verification =$scope.forgot = $scope.login = $scope.register_vendor = $scope.register = 0; 
                }
                //else if(error.userInfo.credentialsVerified==0){
                //     $scope.verification =1;  
                //     $scope.otp =$scope.forgot = $scope.login = $scope.register_vendor = $scope.register = 0; 
                // }
            });
        };
    })
