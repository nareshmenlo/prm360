prmApp

    //=================================================
    // Profile
    //=================================================

    //.controller('profileCtrl', function ($scope,growlService,$http,domain,auctionsService,userService) {
    .controller('profileCtrl', function ($timeout, $uibModal, $state, $scope, growlService, userService, auctionsService, $http, domain, $rootScope, fileReader, $filter, $log) {

        //Get Profile Information from profileService Service
        $scope.userObj = {};
        userService.getUserDataNoCache()
        .then(function(response){
            $scope.userObj = response;
        })

        $scope.isnegotiationrunning = '';
        userService.isnegotiationrunning()
        .then(function(response){
            $scope.isnegotiationrunning = response.data.IsNegotationRunningResult;
            console.log($scope.isnegotiationrunning);
        })
        //User
        $scope.editPwd = 0;

        $scope.isPhoneModifies = 0;
        $scope.isEmailModifies = 0;

        $scope.showIsSuperUser = function () {
            if (userService.getUserObj().isSuperUser) {
                return true;
            } else {
                return false;
            }
        }
        

        $scope.pwdObj = {
            username: userService.getUserObj().username,
            oldPass: '',
            newPass: ''
        };

        $scope.categories = [];

        $scope.getCategories = function(){
            auctionsService.getCategories(userService.getUserId())
            .then(function(response){
                $scope.categories = response;
            })
        }


        /*$scope.currencyFormat = function(amount)
          {
            x=amount;
            x=x.toString();
            var afterPoint = '';
            if(x.indexOf('.') > 0)
               afterPoint = x.substring(x.indexOf('.'),x.length);
            x = Math.floor(x);
            x=x.toString();
            var lastThree = x.substring(x.length-3);
            var otherNumbers = x.substring(0,x.length-3);
            if(otherNumbers != '')
              lastThree = ',' + lastThree;
            var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
            return "&#8377; " + res;
            //return amount.toLocaleString('en-in', { style: 'currency', currency: 'INR' });
          }*/
        


        $scope.getCategories();

        $scope.userDetails = {
            achievements: "",
            assocWithOEM: false,
            clients: "",
            establishedDate: "",
            aboutUs: "",
            logoFile: "",
            logoURL: "",
            products: "",
            strengths: "",
            responseTime: "",
            oemCompanyName: "",
            oemKnownSince: "",
            workingHours: "",
            files: [],
            directors: "",
            address: ""

        };

        $scope.userObj = userService.getUserObj();

        this.updatePwd = function(){
            if($scope.pwdObj.newPass.length < 6){
                growlService.growl("Password should be at least 6 characters long.", "inverse");
                return false;
            }else if($scope.pwdObj.newPass != $scope.pwdObj.confirmNewPass){
                growlService.growl('Passwords do not match, please enter the same password in both new and Confirm Password fields', 'inverse');
                return false;
            }
            $scope.pwdObj.userID = parseInt(userService.getUserId());
            userService.updatePassword($scope.pwdObj)
            .then(function(response){
                if(response.errorMessage == ""){
                    $scope.pwdObj = {
                    username: userService.getUserObj().username
                    };
                    swal("Done!", 'Your password has been successfully updated.', 'success');
                } else {
                    swal("Error!", response.errorMessage, 'error');
                }
            })
        }

        $scope.callGetUserDetails = function () {
            userService.getProfileDetails({ "userid": userService.getUserId(), "sessionid": userService.getUserToken() })
                .then(function (response) {
                    $scope.userStatus = "registered";
                    if(response != undefined){
                        $scope.userDetails = response;
                        var data = response.establishedDate;
                        var date = new Date(parseInt(data.substr(6)));
                        $scope.userDetails.establishedDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
                        
                        if (response.registrationScore > 89){
                            
                           $scope.userStatus = "Authorised";
                           
                        } 
                    } 
                });       
        }



        $scope.subUsers = [];
        $scope.inactiveSubUsers = [];

        $scope.getSubUserData = function() {
            userService.getSubUsersData({ "userid": userService.getUserId(), "sessionid": userService.getUserToken() })
            .then(function (response) {
                $scope.subUsers = $filter('filter')(response, {isValid: true});
                $scope.inactiveSubUsers = $filter('filter')(response, {isValid: false});
            });
        }

        $scope.deleteUser = function(userid){
            userService.deleteUser({"userID": userid, "referringUserID": userService.getUserId() })
            .then(function (response) {
                if(response.errorMessage != ""){
                    growlService.growl(response.errorMessage,"inverse");
                } else {
                    growlService.growl("User deleted Successfully", "inverse");
                    $scope.getSubUserData();
                }
            });
        }
        
        $scope.activateUser = function(userid){
            userService.activateUser({"userID": userid, "referringUserID": userService.getUserId() })
            .then(function (response) {
                if(response.errorMessage != ""){
                    growlService.growl(response.errorMessage,"inverse");
                } else {
                    growlService.growl("User deleted Successfully", "inverse");
                    $scope.getSubUserData();
                }
            });
        }

        $scope.getSubUserData();


        this.profileSummary = "";

        var loginUserData = userService.getUserObj();
        $scope.userObj.fullName = loginUserData.firstName + " " + loginUserData.lastName;
        $scope.userObj.firstName = loginUserData.firstName;
        $scope.userObj.lastName = loginUserData.lastName;
        $scope.userObj.gender = "male";
        $scope.userObj.birthDay = "23/06/1988";
        $scope.userObj.martialStatus = "Single";
        $scope.userObj.phoneNum = loginUserData.phoneNum;
        $scope.userObj.email = loginUserData.email;
        $scope.oldPhoneNum = loginUserData.phoneNum;
        $scope.oldemail = loginUserData.email;
        /*this.aboutUs="";*/
        $scope.userObj.email = loginUserData.email;
        
        $scope.userObj.addressSuite = loginUserData.addressLine1 + " " + loginUserData.addressLine2 + " " + loginUserData.addressLine3;
        $scope.userObj.addressCity = loginUserData.city;
        $scope.userObj.addressCountry = loginUserData.country;
        this.userId = userService.getUserId();
        $scope.isOTPVerified = loginUserData.isOTPVerified;
        $scope.isEmailOTPVerified = loginUserData.isEmailOTPVerified;
        $rootScope.$on("CallProfileMethod", function () {
            $scope.updateUserDataFromService();
        });
        this.imagefilesonlyforlogo = false;
        this.editSummary = 0;
        this.editInfo = 0;
        this.editPic = 0;
        this.editDocVerification = 0;
        this.editContact = 0;
        this.editPro = 0;
        this.addUser = 0;
        $scope.myAuctionsLoaded = false;
        $scope.myAuctions = [];
        $scope.myActiveLeads = [];
        var date = new Date();
        
        $scope.getFile = function () {
            $scope.progress = 0;
            $scope.file = $("#tindoc")[0].files[0];
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    
                });
        };

        this.changepasswordstatus = this.newphonenumber_validation_error = this.newphonenumber_required_error = false;
        this.newphonenumber = "";
        $scope.CredentialUpload = [];
        $scope.uploadedCredentials = [{ "credentialID": '', "fileType": 'PAN', 'fileLink': "", 'isVerified': 0 }, { "credentialID": '', "fileType": 'TIN', 'fileLink': "", 'isVerified': 0 }, { "credentialID": '', "fileType": 'STN', 'fileLink': "", 'isVerified': 0 }];
        $scope.logoFile = { "fileName": '', 'fileStream': "" };
        this.newphonenumber_errors = false;
        $scope.otpvalue = "";
        
        $scope.getUserCredentials = function () {
            $http({
                method: 'GET',
                url: domain + 'getusercredentials?sessionid=' + userService.getUserToken() + "&userid=" + userService.getUserId(),
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' }
            }).then(function (response) {

                $scope.CredentialsResponce = response.data;
                //var pan = $filter('filter')($scope.CredentialsResponce, 'pan');
                
                
                if (response && response.data && response.data.length > 0) {
                    if (response.data[0].errorMessage == "") {
                        var panObj = _.filter($scope.CredentialsResponce, ['fileType', 'PAN']);
                $scope.pannumber = panObj[0].credentialID;
                $scope.vatnumber = _.filter($scope.CredentialsResponce, ['fileType', 'TIN'])[0].credentialID;
                $scope.taxnumber = _.filter($scope.CredentialsResponce, ['fileType', 'STN'])[0].credentialID;
                        var verifiedDocsCount = 0;
                        $.each(response.data, function (key, value) {
                            $scope.PAN = value.credentialID;
                            if (value.isVerified == 1) {
                                verifiedDocsCount++;
                            }
                        });
                        if (response.data.length == verifiedDocsCount) {
                            userService.updateVerified(1);
                        }
                        $scope.uploadedCredentials = response.data;
                        if (response.data.length > 0) {
                            this.editDocVerification = 0;
                            $scope.editDocVerification = 0;
                        }
                    }
                }

               

            

            }, function (result) {
                $log.error("error in request service");
            });
        };
        $scope.updateUserDataFromService = function (msg) {
            loginUserData = userService.getUserObj();
            $scope.oldPhoneNum = loginUserData.phoneNum;
            $scope.oldemail = loginUserData.email;
            $scope.userObj.fullName = loginUserData.firstName + " " + loginUserData.lastName;
            $scope.userObj.firstName = loginUserData.firstName;
            $scope.userObj.lastName = loginUserData.lastName;
            $scope.userObj.gender = "male";
            $scope.userObj.birthDay = "23/06/1988";
            $scope.userObj.martialStatus = "Single";
            $scope.userObj.phoneNum = loginUserData.phoneNum;
            $scope.userObj.email = loginUserData.email;
            $scope.userObj.addressSuite = loginUserData.addressLine1 + " " + loginUserData.addressLine2 + " " + loginUserData.addressLine3;
            $scope.userObj.addressCity = loginUserData.city;
            $scope.userObj.addressCountry = loginUserData.country;
            this.userId = userService.getUserId();
            $scope.isOTPVerified = loginUserData.isOTPVerified;
            $scope.isEmailOTPVerified = loginUserData.isEmailOTPVerified;
            $scope.credentialsVerified = loginUserData.credentialsVerified;
            $scope.callGetUserDetails();
            $scope.getUserCredentials();
            if ($scope.isOTPVerified && $scope.isEmailOTPVerified) {
                    auctionsService.getmyAuctions({ "userid": userService.getUserId(), "sessionid": userService.getUserToken() })
                    .then(function (response) {
                        $scope.myAuctions = response;
                        if ($scope.myAuctions.length > 0) {
                            $scope.myAuctionsLoaded = true;
                        } else {
                            $scope.myAuctionsLoaded = false;
                            $scope.myAuctionsMessage = "There are no auctions running right now for you.";
                        }
                    }); 

                
                    auctionsService.getactiveleads({ "userid": userService.getUserId(), "sessionid": userService.getUserToken() })
                    .then(function (response) {
                        $scope.myActiveLeads = response;
                        if ($scope.myActiveLeads.length > 0) {
                            $scope.myAuctionsLoaded = true;
                        } else {
                            $scope.myAuctionsLoaded = false;
                            $scope.myAuctionsMessage = "There are no auctions running right now for you.";
                        }
                    });

                
                
            
        }
    }

        // var intervalPromise = window.setInterval(function () {
        //     if (window.location.hash.indexOf("#/pages/profile/profile-timeline") > -1) {
        //         $scope.updateUserDataFromService();
        //     }
        // }, 100000);
        $scope.updateUserDataFromService('default call');

        

        //$scope.updateUserDataFromService(userService);
        this.editMode = function () {
            this.editPro = 1;

        }



        /* $scope.sendOTPagain=function(){
             userService.resendotp(userService.getUserId());
         };*/
        $scope.generatePDF = function () {
            var doc = new jsPDF();

            // We'll make our own renderer to skip this editor
            var specialElementHandlers = {
                '#editor': function (element, renderer) {
                    return true;
                }
            };

            // All units are in the set measurement for the document
            // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
            doc.fromHTML($('.myTables').get(0), 15, 15, {
                'width': 170,
                'elementHandlers': specialElementHandlers
            });
            doc.save("test.pdf");
        }

        $scope.otpModalInstances = function () {
            //userService.resendotp(userService.getUserId());
            return $uibModal.open({
                animation: true,
                templateUrl: 'verifyOTPModal.html',
                controller: 'modalInstanceCtrlOTP',
                size: 'sm',
                backdrop: 'static',
                keyboard: false
            });
        }

        $scope.emailModalInstances = function () {
            userService.resendemailotp(userService.getUserId());
            return $uibModal.open({
                animation: true,
                templateUrl: 'verifyEmailOTPModal.html',
                controller: 'modalInstanceCtrlOTP',
                size: 'sm',
                backdrop: 'static',
                keyboard: false
            });
        }


        this.updateUserInfo = function () {
            console.log('JJJJJJJJJ');
            if($scope.oldPhoneNum != $scope.userObj.phoneNum)
            {
                $scope.isPhoneModifies = 1;
            }
            var ts = moment($scope.userDetails.establishedDate, "DD-MM-yyyy HH:mm").valueOf();
            var m = moment(ts);
            var auctionStartDate = new Date(m);
            var milliseconds = parseInt(auctionStartDate.getTime() / 1000.0);
            $scope.userDetails.establishedDate = "/Date(" + milliseconds + "000+0530)/";
            var params = {};
            params   = $scope.userDetails;
            
            params.firstName = $scope.userObj.firstName;
            params.lastName = $scope.userObj.lastName;
            params.phoneNum = $scope.userObj.phoneNum;
            if($scope.logoFile != '' && $scope.logoFile != null){
                params.logoFile = $scope.logoFile;
                params.logoURL += $scope.logoFile.fileName;
            }
            params.isOTPVerified = $scope.isOTPVerified;
            params.credentialsVerified = $scope.credentialsVerified;
            if (params.phoneNum != $scope.userObj.phoneNum) {
                params.isOTPVerified = 0;
            }
            params.email = $scope.userObj.email;
            params.isEmailOTPVerified = $scope.isEmailOTPVerified;
            if (params.email != $scope.userObj.email) {
                params.isEmailOTPVerified = 0;
            }
            params.sessionID = userService.getUserToken();
            params.userID = userService.getUserId();
            params.errorMessage = "";
            userService.updateUser(params)
            .then(function(response){
                if(response.toLowerCase().indexOf('already exists') > 0){
                    userService.getUserDataNoCache().then(function(response){
                    
                    var loginUserData = userService.getUserObj();
                    $scope.userObj.fullName = loginUserData.firstName + " " + loginUserData.lastName;
                    $scope.userObj.firstName = loginUserData.firstName;
                    $scope.userObj.lastName = loginUserData.lastName;
                    $scope.userObj.gender = "male";
                    $scope.userObj.birthDay = "23/06/1988";
                    $scope.userObj.martialStatus = "Single";
                    $scope.userObj.phoneNum = loginUserData.phoneNum;
                    $scope.userObj.email = loginUserData.email;
                    $scope.oldPhoneNum = loginUserData.phoneNum;
                    $scope.oldemail = loginUserData.email;
                    $scope.userObj = loginUserData;
                    //$scope.callGetUserDetails();
                    $scope.callGetUserDetails();
                    $scope.updateUserDataFromService();
                    $state.go('pages.profile.profile-about');
                    $state.reload();
                    

                });
                }
                $state.go('pages.profile.profile-about');
                $state.reload();
            });
            
            this.editSummary = 0;
            this.editInfo = 0;
            this.editPic = 0;
            this.editContact = 0;
            this.editDocVerification = 0;
            this.editPro = 0;
            this.imagefilesonlyforlogo = false;
            this.addUser = 0;
            $scope.callGetUserDetails();
        };
        $scope.taxnumberalpha = false;
        $scope.taxnumberlengthvalidation = false;
        $scope.taxnumberrequired = false;
        $scope.pannumberalpha = false;
        $scope.pannumberlengthvalidation = false;
        $scope.pannumberrequired = false;
        $scope.tinnumberrequired = false;
        $scope.pannumber = "";
        $scope.vatnumber = "";
        $scope.taxnumber = "";
        $scope.panValidations = function (pannumber) {
            /*var panvalue="";
            panvalue=pannumber;*/
            if (pannumber == "") {
                $scope.pannumberalpha = false;
                $scope.pannumberlengthvalidation = false;
                $scope.pannumberrequired = true;
            } else if (('' + pannumber).length < 10) {
                $scope.pannumberalpha = false;
                $scope.pannumberlengthvalidation = true;
                $scope.pannumberrequired = false;
            } else if (!(/^[a-zA-Z0-9]*$/.test(pannumber))) {
                $scope.pannumberalpha = true;
                $scope.pannumberlengthvalidation = false;
                $scope.pannumberrequired = false;
            } else {
                $scope.pannumberalpha = false;
                $scope.pannumberlengthvalidation = false;
                $scope.pannumberrequired = false;
            }
        }
        $scope.tinValidations = function (vatnumber) {
            if (vatnumber == "") {
                $scope.tinnumberrequired = true;
            } else {
                $scope.tinnumberrequired = false;
            }
        }
        $scope.taxValidations = function (taxnumber) {
            if (taxnumber == "") {
                $scope.taxnumberalpha = false;
                $scope.taxnumberlengthvalidation = false;
                $scope.taxnumberrequired = true;
            } else if (("" + taxnumber).length < 15) {
                $scope.taxnumberalpha = false;
                $scope.taxnumberlengthvalidation = true;
                $scope.taxnumberrequired = false;
            } else if (!(/^[a-zA-Z0-9]*$/.test(taxnumber))) {
                $scope.taxnumberalpha = true;
                $scope.taxnumberlengthvalidation = false;
                $scope.taxnumberrequired = false;
            } else {
                $scope.taxnumberalpha = false;
                $scope.taxnumberlengthvalidation = false;
                $scope.taxnumberrequired = false;
            }
        }
        this.updateVerficationInfo = function (pannumber, vatnumber, taxnumber) {
            /*if (pannumber == "") {
                $scope.pannumberalpha = false;
                $scope.pannumberlengthvalidation = false;
                $scope.pannumberrequired = true;
                return false;
            } else if (('' + pannumber).length < 10) {
                $scope.pannumberalpha = false;
                $scope.pannumberlengthvalidation = true;
                $scope.pannumberrequired = false;
                return false;
            } else if (!(/^[a-zA-Z0-9]*$/.test(pannumber))) {
                $scope.pannumberalpha = true;
                $scope.pannumberlengthvalidation = false;
                $scope.pannumberrequired = false;
                return false;
            } else {
                $scope.pannumberalpha = false;
                $scope.pannumberlengthvalidation = false;
                $scope.pannumberrequired = false;
            }
            if (vatnumber == "") {
                $scope.tinnumberrequired = true;
                return false;
            } else {
                $scope.tinnumberrequired = false;
            }
            if (taxnumber == "") {
                $scope.taxnumberalpha = false;
                $scope.taxnumberlengthvalidation = false;
                $scope.taxnumberrequired = true;
                return false;
            } else if (("" + taxnumber).length < 15) {
                $scope.taxnumberalpha = false;
                $scope.taxnumberlengthvalidation = true;
                $scope.taxnumberrequired = false;
                return false;
            } else if (!(/^[a-zA-Z0-9]*$/.test(taxnumber))) {
                $scope.taxnumberalpha = true;
                $scope.taxnumberlengthvalidation = false;
                $scope.taxnumberrequired = false;
                return false;
            } else {
                $scope.taxnumberalpha = false;
                $scope.taxnumberlengthvalidation = false;
                $scope.taxnumberrequired = false;
            }*/
            var panObj = _.filter($scope.CredentialsResponce, ['fileType', 'PAN'])[0];
            var tinObj = _.filter($scope.CredentialsResponce, ['fileType', 'TIN'])[0];
            var stnObj = _.filter($scope.CredentialsResponce, ['fileType', 'STN'])[0];

            if((!panObj.fileType || panObj.credentialID == "" || $scope.panObject.credentialID != panObj.credentialID) && ((pannumber !== "" && !$scope.panObject.fileType) || (pannumber === "" && $scope.panObject.fileType))){
                $scope.pannumberalpha = false;
                $scope.pannumberlengthvalidation = false;
                $scope.pannumberrequired = true;
                return false;
            }
            if((!tinObj.fileType || tinObj.credentialID == "" || $scope.tinObject.credentialID != tinObj.credentialID) && ((vatnumber !== "" && !$scope.tinObject.fileType)|| (vatnumber === "" && $scope.tinObject.fileType))){
                $scope.tinnumberrequired = true;
                return false;
            }
            if((!stnObj.fileType || stnObj.credentialID == "" || $scope.stnObject.credentialID != stnObj.credentialID) && ((taxnumber !== "" && !$scope.stnObject.fileType) || (taxnumber === "" && $scope.stnObject.fileType))){
                $scope.taxnumberalpha = false;
                $scope.taxnumberlengthvalidation = false;
                $scope.taxnumberrequired = true;
                return false;
            }

            if((!panObj.fileType || panObj.credentialID == "" || $scope.panObject.credentialID != panObj.credentialID) && pannumber !== ""){
                $scope.panObject.credentialID = pannumber;
                $scope.CredentialUpload.push($scope.panObject);
            }
            
            if((!tinObj.fileType || tinObj.credentialID == "" || $scope.tinObject.credentialID != tinObj.credentialID) && vatnumber !== ""){
                $scope.tinObject.credentialID = vatnumber;
                $scope.CredentialUpload.push($scope.tinObject);
            }
            if((!stnObj.fileType || stnObj.credentialID == "" || $scope.stnObject.credentialID != stnObj.credentialID) && taxnumber !== ""){
                $scope.stnObject.credentialID = taxnumber;
                $scope.CredentialUpload.push($scope.stnObject);
            }

            /*angular.forEach($scope.CredentialUpload, function (value, key) {
                if (value.fileType.indexOf('PAN') > -1) { value.credentialID = pannumber; }
                if (value.fileType.indexOf('TIN') > -1) { value.credentialID = vatnumber; }
                if (value.fileType.indexOf('STN') > -1) { value.credentialID = taxnumber; }
                if(pannumber !== '' && value.fileType.indexOf('PAN') < 1){
                    $scope.pannumberalpha = false;
                    $scope.pannumberlengthvalidation = false;
                    $scope.pannumberrequired = true;
                    return false;
                }
                if(vatnumber !== '' && value.fileType.indexOf('TIN') < 1){
                    $scope.tinnumberrequired = true;
                    return false;
                }
                if(taxnumber !== '' && value.fileType.indexOf('STN') < 1){
                    $scope.taxnumberalpha = false;
                    $scope.taxnumberlengthvalidation = false;
                    $scope.taxnumberrequired = true;
                    return false;
                }
            });*/
            if($scope.CredentialUpload.length == 0){
                growlService.growl("Please enter at least one credential for upload", "inverse");
                return false;
            }
            var params = { 'userID': userService.getUserId(), 'files': $scope.CredentialUpload, 'sessionID': userService.getUserToken() };
            $http({
                method: 'POST',
                url: domain + 'updatecredentials',
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' },
                data: params
            }).then(function (response) {
                if (response && response.data && response.data.errorMessage == "") {
                    this.editSummary = 0;
                    this.editInfo = 0;
                    this.editPic = 0;
                    this.editContact = 0;
                    this.editDocVerification = 0;
                    this.editPro = 0;
                    this.addUser = 0;
                    $scope.pannumberalpha = false;
                    $scope.pannumberlengthvalidation = false;
                    $scope.pannumberrequired = false;
                    $scope.taxnumberalpha = false;
                    $scope.taxnumberlengthvalidation = false;
                    $scope.taxnumberrequired = false;
                    $scope.tinnumberrequired = false;
                    $scope.getUserCredentials();
                    //userService.updateVerified(1);
                    swal("Done!", 'Your credentials are being verified. Our associates will contact you as soon as it is done.', 'success');
                    this.editDocVerification = 0;
                } else {
                    $log.info(response.data.errorMessage);
                }
            }, function (result) {
                $log.info(result);
            });
            this.editDocVerification = 0;
        };

        $scope.panObject = {};
        $scope.tinObject = {};
        $scope.stnObject = {};

        $scope.getFile1 = function (id, doctype, ext) {
            $scope.progress = 0;
            $scope.file = $("#" + id)[0].files[0];
            $scope.docType = doctype + "." + ext;
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    if(id != "assocWithOEMFile" && id != 'storeLogo'){
                        var bytearray = new Uint8Array(result);
                        var fileobj = {};
                        fileobj.fileStream = $.makeArray(bytearray);
                        fileobj.fileType = $scope.docType;
                        fileobj.isVerified = 0;
                        //$scope.CredentialUpload.push(fileobj);
                        if(doctype == "PAN"){
                            $scope.panObject = fileobj;
                        }
                        else if (doctype == "TIN"){
                            $scope.tinObject = fileobj;
                        }
                        else if (doctype == "STN"){
                            $scope.stnObject = fileobj;
                        }
                    } if (id == "storeLogo"){
                        var bytearray = new Uint8Array(result);
                        $scope.logoFile.fileStream = $.makeArray(bytearray);
                        //$scope.bidAttachementName=$scope.file.name;
                        //$scope.formRequest.attachment=$scope.file.name;
                        $scope.logoFile.fileName = $scope.file.name;
                    } if (id == "profileFile"){
                        var bytearray = new Uint8Array(result);
                        $scope.userDetails.profileFile = $.makeArray(bytearray);
                        $scope.userDetails.profileFileName = $scope.file.name;
                    } else {
                        var bytearray = new Uint8Array(result);
                        $scope.userDetails.assocWithOEMFile = $.makeArray(bytearray);
                        //$scope.bidAttachementName=$scope.file.name;
                        //$scope.formRequest.attachment=$scope.file.name;
                        $scope.userDetails.assocWithOEMFileName = $scope.file.name;
                    }
                    
                });
        };

        $scope.getFile2 = function () {
            $scope.progress = 0;
            $scope.file = $("#storeLogo")[0].files[0];
            if ($scope.file.type == "image/jpeg" || $scope.file.type == "image/jpg" || $scope.file.type == "image/png") {
                fileReader.readAsDataUrl($scope.file, $scope)
                    .then(function (result) {
                        var bytearray = new Uint8Array(result);
                        $scope.logoFile.fileStream = $.makeArray(bytearray);
                        $scope.logoFile.fileName = $scope.file.name;
                        this.imagefilesonlyforlogo = false;
                    });
            } else {
                this.imagefilesonlyforlogo = true;
            }
        };

        $scope.addnewuserobj = {};

        this.AddNewUser = function () {

            if (isNaN($scope.addnewuserobj.phoneNum)) {
                $scope.showMessage = true;
                $scope.msg = $scope.getErrMsg("Please enter a valid Phone Number");
            } else {
                $scope.showMessage = false;
                $scope.msg = '';
            }
                $scope.addnewuserobj.userType = userService.getUserType();
                $scope.addnewuserobj.username = $scope.addnewuserobj.email;
                $scope.addnewuserobj.companyName = $scope.userObj.institution;
                userService.addnewuser($scope.addnewuserobj)
                .then(function (response) {
                    if (response.errorMessage != "") {
                        growlService.growl(response.errorMessage, "inverse");
                    } else {
                        growlService.growl("User added successfully.", "inverse");
                        this.addUser = 0;
                        $state.reload();
                    }
                });
                               
        };


        

        


    })
