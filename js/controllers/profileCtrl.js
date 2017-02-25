prmApp

    //=================================================
    // Profile
    //=================================================

    //.controller('profileCtrl', function ($scope,growlService,$http,domain,auctionsService,userService) {
    .controller('profileCtrl', function ($timeout, $uibModal, $state, $scope, growlService, userService, auctionsService, $http, domain, $rootScope, fileReader, $filter, $log) {

		$scope.sessionid = userService.getUserToken();
        //Get Profile Information from profileService Service
        $scope.userObj = {};
        userService.getUserDataNoCache()
        .then(function(response){
            $scope.userObj = response;
        })
        $scope.newVendor = {};

        $scope.newVendor.panno = "";
        $scope.newVendor.vatNum = "";
        $scope.newVendor.serviceTaxNo = "";


        $scope.basicinfoCollapse = $scope.contactinfo = $scope.docsverification = $scope.professionalinfo = true;
        $scope.pwdmng = true;
        $scope.isnegotiationrunning = '';
        $scope.subcategories = '';
        userService.isnegotiationrunning()
        .then(function(response){
            $scope.isnegotiationrunning = response.data.IsNegotationRunningResult;
            console.log($scope.isnegotiationrunning);
        })
        //User
        $scope.editPwd = 0;

        $scope.isPhoneModifies = 0;
        $scope.isEmailModifies = 0;
        $scope.totalSubcats = [];

        $scope.showIsSuperUser = function () {
            if (userService.getUserObj().isSuperUser) {
                return true;
            } else {
                return false;
            }
        }

        $scope.addVendorShow = false;

        $scope.checkVendorUniqueResult = function (idtype, inputvalue) {
            if (inputvalue == "" || inputvalue == undefined) {
                return false;
            }
            /*$scope.checkVendorPhoneUniqueResult=false;
            $scope.checkVendorEmailUniqueResult=false;*/
            //$scope.checkPANUniqueResult = false;
            //$scope.checkTINUniqueResult = false;
            //$scope.checkSTNUniqueResult = false;
            userService.checkUserUniqueResult(inputvalue, idtype).then(function (response) {
                if (idtype == "PHONE") {
                    $scope.checkVendorPhoneUniqueResult = !response;
                } else if (idtype == "EMAIL") {
                    $scope.checkVendorEmailUniqueResult = !response;
                }
                else if (idtype == "PAN") {
                    $scope.checkPANUniqueResult = !response;
                }
                else if (idtype == "TIN") {
                    $scope.checkTINUniqueResult = !response;
                }
                else if (idtype == "STN") {
                    $scope.checkSTNUniqueResult = !response;
                }
            });
        };
        

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
                $scope.addVendorCats = _.uniq(_.map(response, 'category'));
            })
        }
        
        /*pagination code*/
         $scope.totalItems = 0;
         $scope.totalLeads = 0;
          $scope.currentPage = 1;
          $scope.itemsPerPage = 5;
          $scope.maxSize = 5; //Number of pager buttons to show

          $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
          };

          $scope.pageChanged = function() {
            console.log('Page changed to: ' + $scope.currentPage);
          };

        $scope.getCategories();

        $scope.userDetails = {
            achievements: "",
            assocWithOEM: false,
            clients: "",
            establishedDate: "01-01-1970",
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
            address: "",
            dateshow: 0

        };

        $scope.userObj = userService.getUserObj();
        $scope.uId = userService.getUserId();

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

        $scope.getSubCats = function () {
            
        }

        $scope.getSubCats();

        $scope.callGetUserDetails = function () {
            userService.getProfileDetails({ "userid": userService.getUserId(), "sessionid": userService.getUserToken() })
                .then(function (response) {
                    $scope.userStatus = "registered";
                    if(response != undefined){
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
                                    if ($scope.userDetails.subcategories && $scope.userDetails.subcategories.length > 0) {
                                        for (i = 0; i < $scope.userDetails.subcategories.length; i++) {
                                            for (j = 0; j < $scope.totalSubcats.length; j++) {
                                                if ($scope.userDetails.subcategories[i].id == $scope.totalSubcats[j].id) {
                                                    $scope.totalSubcats[j].ticked = true;
                                                }
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
                        if ($scope.userDetails.subcategories && $scope.userDetails.subcategories.length > 0) {
                            for (i = 0; i < $scope.userDetails.subcategories.length; i++) {
                                $scope.subcategories += $scope.userDetails.subcategories[i].subcategory + ";";
                            }
                        }
                        var data = response.establishedDate;
                        var date = new Date(parseInt(data.substr(6)));
                        $scope.userDetails.establishedDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
                        
                        var today = new Date();
                        var todayDate = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
                        $scope.userDetails.dateshow = 0;
                        if($scope.userDetails.establishedDate == todayDate){
                            $scope.userDetails.dateshow = 1;
                        }

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
        this.editPwd = 0;
        this.addUser = 0;
        this.addVendor = 0;
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
                        if (response.data.length == verifiedDocsCount + 1 || response.data.length == verifiedDocsCount) {
                            userService.updateVerified(1);
                        } else {
                            userService.updateVerified(0);
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
                            $scope.totalItems = $scope.myAuctions.length;
                        } else {
                            $scope.myAuctionsLoaded = false;
                            $scope.totalItems = 0;
                            $scope.myAuctionsMessage = "There are no auctions running right now for you.";
                        }
                    }); 

                
                    auctionsService.getactiveleads({ "userid": userService.getUserId(), "sessionid": userService.getUserToken() })
                    .then(function (response) {
                        $scope.myActiveLeads = response;
                        if ($scope.myActiveLeads.length > 0) {
                            $scope.myAuctionsLoaded = true;
                            $scope.totalLeads = $scope.myActiveLeads.length;
                        } else {
                            $scope.totalLeads = 0;
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
           // userService.resendemailotp(userService.getUserId());
            return $uibModal.open({
                animation: true,
                templateUrl: 'verifyEmailOTPModal.html',
                controller: 'modalInstanceCtrlOTP',
                size: 'sm',
                backdrop: 'static',
                keyboard: false
            });
        }

        $scope.addVendor = function () {
            $scope.emailRegx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            $scope.mobileRegx = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
            $scope.panregx = /^([a-zA-Z]{5})(\d{4})([a-zA-Z]{1})$/;
            //$scope.emailRegx = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
            var addVendorValidationStatus = false;
            $scope.firstvalidation = $scope.companyvalidation = $scope.lastvalidation = $scope.contactvalidation = $scope.emailvalidation = $scope.categoryvalidation = $scope.emailregxvalidation = $scope.contactvalidationlength = $scope.panregxvalidation = $scope.tinvalidation = $scope.stnvalidation = false;
            if ($scope.newVendor.companyName == "" || $scope.newVendor.companyName === undefined) {
                $scope.companyvalidation = true;
                addVendorValidationStatus = true;
            }
            if ($scope.newVendor.firstName == "" || $scope.newVendor.firstName === undefined) {
                $scope.firstvalidation = true;
                addVendorValidationStatus = true;
            }
            if ($scope.newVendor.lastName == "" || $scope.newVendor.lastName === undefined) {
                $scope.lastvalidation = true;
                addVendorValidationStatus = true;
            }
            if ($scope.newVendor.contactNum == "" || $scope.newVendor.contactNum === undefined || isNaN($scope.newVendor.contactNum)) {
                $scope.contactvalidation = true;
                addVendorValidationStatus = true;
            } else if (!$scope.mobileRegx.test($scope.newVendor.contactNum)) {
                $scope.contactvalidationlength = true;
                addVendorValidationStatus = true;
            }
            if ($scope.newVendor.email == "" || $scope.newVendor.email === undefined) {
                $scope.emailvalidation = true;
                addVendorValidationStatus = true;
            } else if (!$scope.emailRegx.test($scope.newVendor.email)) {
                $scope.emailregxvalidation = true;
                addVendorValidationStatus = true;
            }
            if ($scope.checkPANUniqueResult && $scope.newVendor.panno != "") {
                addVendorValidationStatus = true;
            }
            else if($scope.newVendor.panno != "" && !$scope.panregx.test($scope.newVendor.panno)) {
                $scope.panregxvalidation = true;
                addVendorValidationStatus = true;
            }
            if ($scope.checkTINUniqueResult && $scope.newVendor.vatNum != "") {
                addVendorValidationStatus = true;
            }
            else if(($scope.newVendor.vatNum != "" && $scope.newVendor.vatNum.length != 11) || ($scope.newVendor.vatNum != "" && isNaN($scope.newVendor.vatNum)) ) {
                $scope.tinvalidation = true;
                addVendorValidationStatus = true;
            }
            if ($scope.checkSTNUniqueResult && $scope.newVendor.serviceTaxNo != "") {
                addVendorValidationStatus = true;
            }
            else if (($scope.newVendor.serviceTaxNo != "" && $scope.newVendor.serviceTaxNo.length != 15) || ($scope.newVendor.serviceTaxNo != "" && isNaN($scope.newVendor.serviceTaxNo))) {
                $scope.stnvalidation = true;
                addVendorValidationStatus = true;
            }
            if ($scope.newVendor.category == "" || $scope.newVendor.category === undefined) {
                $scope.categoryvalidation = true;
                addVendorValidationStatus = true;
            }
            if ($scope.checkVendorEmailUniqueResult || $scope.checkVendorEmailUniqueResult) {
                addVendorValidationStatus = true;
            }
            
            
            
            if (addVendorValidationStatus) {
                return false;
            }
            var vendCAtegories = [];
            $scope.newVendor.category = $scope.newVendor.category;
            vendCAtegories.push($scope.newVendor.category);
            var params = {
                /*"vendorInfo": {
                    "firstName": $scope.newVendor.firstName,
                    "lastName": $scope.newVendor.lastName,
                    "email": $scope.newVendor.email,
                    "contactNum": $scope.newVendor.contactNum,
                    "username": $scope.newVendor.contactNum,
                    "password": $scope.newVendor.contactNum,
                    "rating": 1,
                    "category": vendCAtegories,
                    "panNum": ("panno" in $scope.newVendor) ? $scope.newVendor.panno : "",
                    "serviceTaxNum": ("serviceTaxNo" in $scope.newVendor) ? $scope.newVendor.serviceTaxNo : "",
                    "vatNum": ("vatNum" in $scope.newVendor) ? $scope.newVendor.vatNum : "",
                    "referringUserID": parseInt(userService.getUserId()),
                    "knownSince": ("knownSince" in $scope.newVendor) ? $scope.newVendor.knownSince : "",
                    "errorMessage": "",
                    "sessionID": userService.getUserToken(),
                    "institution": ""
                }*/
                "register": {
                    "firstName": $scope.newVendor.firstName,
                    "lastName": $scope.newVendor.lastName,
                    "email": $scope.newVendor.email,
                    "phoneNum": $scope.newVendor.contactNum,
                    "username": $scope.newVendor.contactNum,
                    "password": $scope.newVendor.contactNum,
                    "companyName": $scope.newVendor.companyName ? $scope.newVendor.companyName : "",
                    "isOTPVerified": 0,
                    "category": $scope.newVendor.category,
                    "userType": "VENDOR",
                    "panNumber": ("panno" in $scope.newVendor) ? $scope.newVendor.panno : "",
                    "stnNumber": ("serviceTaxNo" in $scope.newVendor) ? $scope.newVendor.serviceTaxNo : "",
                    "vatNumber": ("vatNum" in $scope.newVendor) ? $scope.newVendor.vatNum : "",
                    "referringUserID": userService.getUserId(),
                    "knownSince": ("knownSince" in $scope.newVendor) ? $scope.newVendor.knownSince : "",
                    "errorMessage": "",
                    "sessionID": "",
                    "userID": 0,
                    "department": ""
                }
            };
            $http({
                method: 'POST',
                url: domain + 'register',
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' },
                data: params
            }).then(function (response) {
                if (response && response.data && response.data.errorMessage == "") {
                    //$scope.formRequest.auctionVendors.push({ vendorName: $scope.newVendor.firstName + " " + $scope.newVendor.lastName, companyName: $scope.newVendor.companyName, vendorID: response.data.objectID });
                    $scope.newVendor = null;
                    $scope.newVendor = {};
                    //$scope.addVendorForm.$setPristine();
                    $scope.addVendorShow = false;
                    growlService.growl("Vendor Added Successfully.", 'inverse');
                    this.addVendor = 0;
                } else if (response && response.data && response.data.errorMessage) {
                    growlService.growl(response.data.errorMessage, 'inverse');
                } else {
                    growlService.growl('Unexpected Error Occurred', 'inverse');
                }
            });
        }


        this.updateUserInfo = function () {
            console.log('JJJJJJJJJ');
            if($scope.oldPhoneNum != $scope.userObj.phoneNum)
            {
                $scope.isPhoneModifies = 1;
            }
            
            var params = {};
            if($scope.userDetails.assocWithOEM){
                if($scope.userDetails.oemCompanyName == "" || $scope.userDetails.oemKnownSince == "" || $scope.userDetails.assocWithOEMFileName == ""){
                    growlService.growl("If Associated with OEM, please provide further details.", "inverse");
                    return false;
                }
            }
            if($scope.userObj.firstName.toString() == ""){
                growlService.growl("Name cannot be empty.", "inverse");
                return false;
            }
            if($scope.userObj.lastName.toString() == ""){
                growlService.growl("Name cannot be empty.", "inverse");
                return false;
            }
            if($scope.userObj.phoneNum.toString() == ""){
                growlService.growl("Phone Number cannot be empty.", "inverse");
                return false;
            }
            if(isNaN($scope.userObj.phoneNum)){
                growlService.growl("Please Enter correct Mobile number.", "inverse");
                return false;
            }
            if($scope.userObj.phoneNum.toString().length != 10){
                growlService.growl("Phone Number Must be 10 digits.", "inverse");
                return false;
            }
            if($scope.userObj.email.toString() == ""){
                growlService.growl("Email cannot be empty.", "inverse");
                return false;
            }
            if(this.editPro == 1 && $scope.userDetails.aboutUs == ""){
                growlService.growl("Please update your about us section", "inverse");
                return false;
            }

            var ts = moment($scope.userDetails.establishedDate, "DD-MM-YYYY").valueOf();
            var m = moment(ts);
            var auctionStartDate = new Date(m);
            var milliseconds = parseInt(auctionStartDate.getTime() / 1000.0);
            $scope.userDetails.establishedDate = "/Date(" + milliseconds + "000+0530)/";

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
            params.subcategories = $scope.userDetails.subcategories;
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
        $scope.panregx = new RegExp("/^([a-zA-Z]{5})(\d{4})([a-zA-Z]{1})$/");
        $scope.panValidations = function (pannumber) {
            /*var panvalue="";
            panvalue=pannumber;*/
			$log.debug($scope.panregx.test(pannumber));
            if (pannumber != "" && !$scope.panregx.test(pannumber)) {
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
           
            var panObj = _.filter($scope.CredentialsResponce, ['fileType', 'PAN'])[0];
            var tinObj = _.filter($scope.CredentialsResponce, ['fileType', 'TIN'])[0];
            var stnObj = _.filter($scope.CredentialsResponce, ['fileType', 'STN'])[0];

			if((!$scope.panObject.fileType || pannumber === "" || !(/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(pannumber.toUpperCase()))) && panObj.credentialID != pannumber){
				$scope.pannumberalpha = false;
                $scope.pannumberlengthvalidation = false;
				$scope.pannumberrequired = false;
				
				if(pannumber === "")
				{
					$scope.pannumberrequired = true;
				}
				else
				{
					if(!(/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(pannumber.toUpperCase())))
					{
						$scope.pannumberlengthvalidation = true;
					}
				}
                
                return false;
            }
			else{
				$scope.pannumberalpha = false;
                $scope.pannumberlengthvalidation = false;
				$scope.pannumberrequired = false;
			}
            if((!$scope.tinObject.fileType || vatnumber === "" || !(/^\d{11}$/.test(vatnumber))) && tinObj.credentialID != vatnumber){
                $scope.tinnumberrequired = false;
				$scope.tinnumberlengthvalidation = false;
				if(vatnumber === "")
				{
					$scope.tinnumberrequired = true;
				}
				else
				{
					if(!(/^\d{11}$/.test(vatnumber.toUpperCase())))
					{
						$scope.tinnumberlengthvalidation = true;
					}
				}
				
                return false;
            }
			else{
				$scope.tinnumberrequired = false;
				$scope.tinnumberlengthvalidation = false;
			}
            if((!$scope.stnObject.fileType || taxnumber === "" || !(/^[a-zA-Z0-9]{15}$/.test(taxnumber))) && stnObj.credentialID != taxnumber){
                $scope.taxnumberalpha = false;
                $scope.taxnumberlengthvalidation = false;
                $scope.taxnumberrequired = false;
				if(taxnumber === "")
				{
					$scope.taxnumberrequired = true;
				}
				else
				{
					if(!(/^[a-zA-Z0-9]{15}$/.test(taxnumber.toUpperCase())))
					{
						$scope.taxnumberlengthvalidation = true;
					}
				}
				
				
                return false;
            }
			else{
				$scope.taxnumberalpha = false;
                $scope.taxnumberlengthvalidation = false;
                $scope.taxnumberrequired = false;
			}


            if(pannumber !== "" && (panObj.credentialID != pannumber || $scope.panObject.fileStream)){
                $scope.panObject.credentialID = pannumber;
                if($scope.panObject.fileStream){
                    $scope.CredentialUpload.push($scope.panObject);
                }                
            }
            
            if(vatnumber !== "" && (tinObj.credentialID != vatnumber || $scope.tinObject.fileStream)){
                $scope.tinObject.credentialID = vatnumber;
                if($scope.tinObject.fileStream){
                    $scope.CredentialUpload.push($scope.tinObject);
                }                
            }
            if(taxnumber !== "" && (stnObj.credentialID != taxnumber || $scope.stnObject.fileStream)){
                $scope.stnObject.credentialID = taxnumber;
                if($scope.stnObject.fileStream){
                    $scope.CredentialUpload.push($scope.stnObject);
                }                
            }

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
                    growlService.growl(response.data.errorMessage, "inverse");
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
                            fileobj.credentialID = $scope.pannumber;
                            $scope.panObject = fileobj;
                        }
                        else if (doctype == "TIN"){
                            fileobj.credentialID = $scope.vatnumber;
                            $scope.tinObject = fileobj;
                        }
                        else if (doctype == "STN"){
                            fileobj.credentialID = $scope.taxnumber;
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
