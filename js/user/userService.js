angular.module("prm.user").service('userService', userService);


function userService($http, store, $state, $rootScope, version, domain, growlService) {
    //var domain = 'http://182.18.169.32/services/';
    var self = this;
    var successMessage = '';

    // currentUser must be stored in an object since it is nullable
    // If we two-way bind to currentUser directly, the bind would break
    // when currentUser is set to null.

    self.userData = { currentUser: null };

    self.getUserObj = function () {
        if (!self.userData.currentUser || !self.userData.currentUser.id) {
            self.userData.currentUser = store.get('currentUser');
        }
        return self.userData.currentUser || {};
    };
    self.getUserToken = function () {
        return store.get('sessionid');
    };

    self.getOtpVerified = function () {
        return self.getUserObj().isOTPVerified;
    };

    self.getEmailOtpVerified = function () {
        return self.getUserObj().isEmailOTPVerified;
    };

    self.reloadProfileObj = function(){
        
    }

    self.getDocsVerified = function () {
        return self.getUserObj().credentialsVerified;
    };
    self.removeUserToken = function () {
        store.remove('sessionid');
    };

    self.getRememberMeToken = function () {
        return store.get('rememberMeToken');
    };
    self.removeRememberMeToken = function () {
        store.remove('rememberMeToken');
    };

    self.removeUser = function () {
        store.remove('currentUser');
    };

    self.getUsername = function () {
        return self.getUserObj().username;
    };

    self.getFirstname = function () {
        return self.getUserObj().firstName;
    };

    self.getLastname = function () {
        return self.getUserObj().lastName;
    };

    self.getUserId = function () {
        return self.getUserObj().userID;
    };

    self.setMessage = function (msg) {
        successMessage = msg;
    };

    self.getMessage = function () {
        return successMessage;
    };

    self.getUserType = function () {
        return self.getUserObj().userType;
    };


    self.setCurrentUser = function () {
        self.userData.sessionid = self.getUserToken();
        self.userData.currentUser = self.getUserObj();
    };

    self.setCurrentUser();

    self.checkUniqueValue21 = function (type, currentvalue) {
        var data = {
            "type": type,
            "currentvalue": currentvalue
        };
        console.log(data);
        return false;
        // return $http.post("", data).then( function(res) {
        //   return res.data.isUnique;
        // });
    };

    self.checkUniqueValue = function (type, currentvalue) {
        var data = {
            "phone": currentvalue,
            "idtype": type
        };
        console.log(data);
        //return false;
        return $http({
            method: 'POST',
            url: domain + 'checkuserifexists',
            headers: { 'Content-Type': 'application/json' },
            encodeURI: true,
            data: data
        }).then(function (response) {
            //console.log(response);
            return response.data.CheckUserIfExistsResult;
        });
    };

    self.forgotpassword = function (forgot) {
        var data = {
            "email": forgot.email,
            "sessionid":''
        };
        //data=forgot.email;
        return $http({
            method: 'POST',
            url: domain + 'forgotpassword',
            headers: { 'Content-Type': 'application/json' },
            encodeURI: true,
            data: data
        }).then(function (response) {
            return response;
        });
        //  $http.post(domain+"forgotassword", data).then( function(res) {
        //   return res;
        // });
    };

    self.resetpassword = function (resetpass) {
        var data = {
            "email": resetpass.email,
            "sessionid":resetpass.sessionid,
            "NewPass": resetpass.NewPass,
            "ConfNewPass": resetpass.ConfNewPass
        };
        //data=forgot.email;
        return $http({
            method: 'POST',
            url: domain + 'resetpassword',
            headers: { 'Content-Type': 'application/json' },
            encodeURI: true,
            data: data
        }).then(function (response) {
            $state.go('login');
            return response;
        });
        //  $http.post(domain+"forgotassword", data).then( function(res) {
        //   return res;
        // });
    };

    self.resendotp = function (userid) {
        var data = {
            "userID": userid
        };
        return $http({
            method: 'POST',
            url: domain + 'sendotp',
            headers: { 'Content-Type': 'application/json' },
            encodeURI: true,
            data: data
        }).then(function (response) {
            swal("Done!", "OTP send to your registered Mobile No.", "success");
        });
    };


    self.isnegotiationrunning = function () {
        var data = {
            "userID": self.getUserId(),
            "sessionID": self.getUserToken()
        };
        return $http({
            method: 'POST',
            url: domain + 'isnegotiationrunning',
            headers: { 'Content-Type': 'application/json' },
            encodeURI: true,
            data: data
        }).then(function (response) {
            console.log('isnegotiationrunning');
            return response;
        });
    };


    self.resendemailotp = function (userid) {
        var data = {
            "userID": userid
        };
        return $http({
            method: 'POST',
            url: domain + 'sendotpforemail',
            headers: { 'Content-Type': 'application/json' },
            encodeURI: true,
            data: data
        }).then(function (response) {
            swal("Done!", "OTP send to your registered Email.", "success");
        });
    };


    self.getUserDataNoCache = function(){
        var params = {
            userid: self.getUserId(),
            sessionid: self.getUserToken()
        }
        return $http({
            method: 'GET',
            url: domain + 'getuserinfo?userid=' + params.userid + '&sessionid=' + params.sessionid,
            encodeURI: true,
            headers: { 'Content-Type': 'application/json' }
            //data: params
        }).then(function (response) {

            store.set('currentUser', response.data);
            self.setCurrentUser();
            var list = {};
            if (response && response.data) {
                list = response.data;
                return list;
            } else {
                console.log(response.data.errorMessage);
            }
        }, function (result) {
            console.log(result);
        });
    }

    self.verifyOTP = function (otpobj) {
        var data = {
            "OTP": otpobj,
            "userID": self.getUserId(),
            "phone": otpobj.phone ? otpobj.phone : ""
        };
        return $http({
            method: 'POST',
            url: domain + 'verifyotp',
            headers: { 'Content-Type': 'application/json' },
            encodeURI: true,
            data: data
        }).then(function (response) {
            if (response.data.sessionID != "" || response.data.userInfo.sessionID != "") {
                store.set('sessionid', response.data.sessionID != "" ? response.data.sessionID : response.data.userInfo.sessionID);
                if (response.data.userInfo.isOTPVerified == 1 && response.data.userInfo.credentialsVerified == 1) {
                    store.set('verified', 1);
                } else {
                    store.set('verified', 0);
                }
                if (response.data.userInfo.isEmailOTPVerified == 1) {
                    store.set('emailverified', 1);
                } else {
                    store.set('emailverified', 0);
                }
                if(response.data.userInfo.credentialsVerified == 1){
                    store.set('credverified', 1);
                } else {
                    store.set('credverified', 0);
                }
                store.set('currentUser', response.data.userInfo);
                self.setCurrentUser();
                $state.go('pages.profile.profile-about');
            } else {
                swal('Warning', "The OTP is not valid. Please enter the valid OTP sent to your mobile number", "warning");
            }
            /*if(response.data.userInfo.isOTPVerified==1 && response.data.userInfo.credentialsVerified==1){
              store.set('verified',response.data.userInfo.credentialsVerified);
              $state.go('home');
              growlService.growl('Welcome to PRM360', 'inverse');                                                
            }*/
            return response.data;
        });
    };





    self.verifyEmailOTP = function (otpobj) {
        var data = {
            "OTP": otpobj,
            "userID": self.getUserId(),
            "email": otpobj.email ? otpobj.email : ""
        };
        return $http({
            method: 'POST',
            url: domain + 'verifyemailotp',
            headers: { 'Content-Type': 'application/json' },
            encodeURI: true,
            data: data
        }).then(function (response) {
            if (response.data.sessionID != "" || response.data.userInfo.sessionID != "") {
                store.set('sessionid', response.data.sessionID != "" ? response.data.sessionID : response.data.userInfo.sessionID);
                if (response.data.userInfo.isEmailOTPVerified == 1) {
                    store.set('emailverified', 1);
                } else {
                    store.set('emailverified', 0);
                }
                if (response.data.userInfo.isOTPVerified == 1) {
                    store.set('verified', 1);
                } else {
                    store.set('verified', 0);
                }
                if(response.data.userInfo.credentialsVerified == 1){
                    store.set('credverified', 1);
                } else {
                    store.set('credverified', 0);
                }
                store.set('currentUser', response.data.userInfo);
                self.setCurrentUser();
                $state.go('pages.profile.profile-about');
            } else {
                swal('Warning', "The OTP is not valid. Please enter the valid OTP sent to your Email", "warning");
            }
            /*if(response.data.userInfo.isOTPVerified==1 && response.data.userInfo.credentialsVerified==1){
              store.set('verified',response.data.userInfo.credentialsVerified);
              $state.go('home');
              growlService.growl('Welcome to PRM360', 'inverse');                                                
            }*/
            return response.data;
        });
    };









  		self.isLoggedIn = function () {
        return (self.getUserToken() && self.getOtpVerified() && self.getDocsVerified()) ? true : false;
  		};

    self.updateUser = function (params) {


        var params1 = {
            "user": {
                "userID": params.userID,
                "firstName": params.firstName,
                "lastName": params.lastName,
                "email": params.email,
                "phoneNum": params.phoneNum,
                "sessionID": params.sessionID,
                "isOTPVerified": params.isOTPVerified,
                "credentialsVerified": params.credentialsVerified,
                "errorMessage": params.errorMessage,
                "logoFile": params.logoFile ? params.logoFile : null,
                "logoURL": params.logoURL ? params.logoURL : "",
                "aboutUs": params.aboutUs ? params.aboutUs : "",
                "achievements": params.achievements ? params.achievements : "",
                "assocWithOEM": params.assocWithOEM ? params.assocWithOEM : false ,
                "assocWithOEMFile": params.assocWithOEMFile ? params.assocWithOEMFile : null ,                
                "assocWithOEMFileName": params.assocWithOEMFileName ? params.assocWithOEMFileName : "" ,                
                "clients": params.clients ? params.clients : "",
                "establishedDate": ("establishedDate" in params) ? params.establishedDate :'/Date(634334872000+0000)/',
                "products": params.products ? params.products : "",
                "strengths": params.strengths ? params.strengths : "",
                "responseTime": params.responseTime ? params.responseTime : "",
                "oemCompanyName": params.oemCompanyName ? params.oemCompanyName : "",
                "oemKnownSince": params.oemKnownSince? params.oemKnownSince : "",
                "files": [],
                "profileFile": params.profileFile ? params.profileFile : null ,                
                "profileFileName": params.profileFileName ? params.profileFileName : "",
                "workingHours": params.workingHours ? params.workingHours : "",
                "directors": params.directors ? params.directors : "",
                "address": params.address ? params.address : "",
                "subcategories": params.subcategories
            }
        }
        // if (params.hasOwnProperty("establishedDate")) {
        //     var establishedDate = params.establishedDate.replace(/(\d+)\/(\d+)\/(\d+)/, "$3/$2/$1");
        //     var date = new Date(establishedDate);
        //     console.log(date);
        //     var milliseconds = parseInt(date.getTime() / 1000.0);
        //     console.log(milliseconds);
        //     params1.user.establishedDate = "/Date(" + milliseconds + "000+0530)/";
        // }
        console.log(params1);
        return $http({
            method: 'POST',
            url: domain + 'updateuserinfo',
            headers: { 'Content-Type': 'application/json' },
            encodeURI: true,
            data: params1
        }).then(function (response) {
            if (response && response.data && response.data.errorMessage == "" && response.data.objectID != 0) {
                store.set('sessionid', response.data.sessionID);
                store.set('verified', 0);
                store.set('emailverified', 0);
                store.set('currentUser', response.data.userInfo);
                self.setCurrentUser();
                if (response.data.userInfo.isOTPVerified == 1 && response.data.userInfo.credentialsVerified == 1) {
                    store.set('verified', 1);
                } if (response.data.userInfo.isEmailOTPVerified == 1) {
                    store.set('emailverified', 1);
                }
                if(response.data.userInfo.credentialsVerified == 1){
                    store.set('credverified', 1);
                } else {
                    store.set('credverified', 0);
                }
                if (response.data.objectID > 0) {

                    growlService.growl('User data has updated Successfully!', 'inverse');
                    //self.getProfileDetails();
                    //$state.go('pages.profile.profile-about');
                    if(params.ischangePhoneNumber == 1){
                        //self.logout();
                        $state.go('login');
                        return responce.data;
                    }else{
                        $state.reload();
                    }
                    return "true";
                } else {
                    return "false";
                }
            } else if (response && response.data && response.data.errorMessage != "") {
                swal('Error', response.data.errorMessage, 'error');
                //store.set('emailverified', 1);
                return response.data.errorMessage;
                
            } else {
                return "Update failed";
            }
        }, function (result) {
            return "Update failed";
        });
    }

    self.getProfileDetails = function (params) {
        return $http({
            method: 'GET',
            url: domain + 'getuserdetails?userid=' + params.userid + '&sessionid=' + params.sessionid,
            encodeURI: true,
            headers: { 'Content-Type': 'application/json' }
            //data: params
        }).then(function (response) {
            var list = {};
            if (response && response.data) {
                list = response.data;
                return list;
            } else {
                console.log(response.data.errorMessage);
            }
        }, function (result) {
            console.log(result);
        });
        $state.go('pages.profile.profile-about');
    }

    self.updatePassword = function(params){
        return $http({
            method: 'POST',
            url: domain + 'changepassword',
            headers: { 'Content-Type': 'application/json' },
            encodeURI: true,
            data: params
        }).then(function (response) {
            return response.data;
        });
    }


    self.getSubUsersData = function (params) {
        return $http({
            method: 'GET',
            url: domain + 'getsubuserdata?userid=' + params.userid + '&sessionid=' + params.sessionid,
            encodeURI: true,
            headers: { 'Content-Type': 'application/json' }
            //data: params
            }).then(function (response) {
                return response.data;
        });
    }



	   self.updateVerified = function (verified) {
        store.set('credverified', verified);
    }
    self.checkUserUniqueResult = function (uniquevalue, idtype) {
        var data = {
            "phone": uniquevalue,
            "idtype": idtype
        };
        return $http({
            method: 'POST',
            url: domain + 'checkuserifexists',
            headers: { 'Content-Type': 'application/json' },
            encodeURI: true,
            data: data
        }).then(function (response) {
            return response.data.CheckUserIfExistsResult;
        });
    }
    self.login = function (user) {
        return $http({
            method: 'POST',
            url: domain + 'loginuser',
            headers: { 'Content-Type': 'application/json' },
            encodeURI: true,
            data: user
        }).then(function (response) {
            if (response && response.data && response.data.errorMessage == "" && response.data.objectID != 0) {
                store.set('sessionid', response.data.sessionID);
                store.set('verified', 0);
                store.set('emailverified', 0);
                store.set('currentUser', response.data.userInfo);
                self.setCurrentUser();
                if (response.data.userInfo.isOTPVerified == 1) {
                    store.set('verified', 1);
                }
                else if (response.data.userInfo.isOTPVerified == 0) {
                    self.resendotp(response.data.objectID);                    
                }
                if(response.data.userInfo.credentialsVerified == 1){
                    store.set('credverified', 1);
                } else {
                    store.set('credverified', 0);
                }
                if (response.data.userInfo.isEmailOTPVerified == 1) {
                    store.set('emailverified', 1);
                }
                else if (response.data.userInfo.isEmailOTPVerified == 0) {
                    self.resendemailotp(response.data.objectID);                    
                }
                $state.go('home');
                return response.data;
            } else if (response && response.data && response.data.errorMessage != "") {
                return response.data.errorMessage;
            } else {
                return "Login failed";
            }
        }, function (result) {
            return "Login failed";
        });
    };

    self.logout = function () {
        return $http({
            method: 'POST',
            data: { "userID": self.getUserId(), "sessionID": self.userData.sessionid },
            url: domain + 'logoutuser',
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            self.removeUserToken();
            self.removeUser();
            delete self.userData.sessionid;
            delete self.userData.currentUser;
            self.setMessage("Successfully Logged Out");
            $state.go('login');
        });
    };

    self.deleteUser = function(params){
        params.sessionID = self.getUserToken();
        return $http({
            method: 'POST',
            data: params,
            url: domain + 'deleteuser',
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response.data;
        });
    }

    self.activateUser = function(params){
        params.sessionID = self.getUserToken();
        return $http({
            method: 'POST',
            data: params,
            url: domain + 'activateuser',
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response.data;
        });
    }

    self.userregistration = function (register) {
        var params = {
            "userInfo": {
                "userID": "0",
                "firstName": register.firstName,
                "lastName": register.lastName,
                "email": register.email,
                "phoneNum": register.phoneNum,
                "username": register.username,
                "password": register.password,
                "birthday": '/Date(634334872000+0000)/',
                "userType": "CUSTOMER",
                "isOTPVerified": 0,
                "category": "",
                "institution": ("institution" in register) ? register.institution : "",
                "addressLine1": "",
                "addressLine2": "",
                "addressLine3": "",
                "city": "",
                "state": "",
                "country": "",
                "zipCode": "",
                "addressPhoneNum": "",
                "extension1": "",
                "extension2": "",
                "userData1": "",
                "registrationScore" : 0,
                "errorMessage": "",
                "sessionID": ""
            }
        };

        return $http({
            method: 'POST',
            url: domain + 'registeruser',
            encodeURI: true,
            headers: { 'Content-Type': 'application/json' },
            data: params
        }).then(function (response) {
            if (response && response.data && response.data.errorMessage == "" && response.data.objectID != 0) {
                store.set('sessionid', response.data.sessionID);
                store.set('verified', 0);
                store.set('emailverified', 0);
                if(response.data.userInfo.credentialsVerified == 1){
                    store.set('credverified', 1);
                } else {
                    store.set('credverified', 0);
                }
                store.set('currentUser', response.data.userInfo);
                self.setCurrentUser();
                return response.data;
                //$state.go('home');
                //growlService.growl('Welcome to PRM360, To add new requirement Please use "+" at the Bottom.', 'inverse');
            } else if (response && response.data && response.data.errorMessage != "") {
                return response.data.errorMessage;
            } else {
                return "Registeration failed";
            }
        }, function (result) {
            return "Registeration failed";
        });
    };

    self.vendorregistration = function (vendorregisterobj) {
        var vendorcat = [];
        vendorcat.push(vendorregisterobj.category);

        var params = {
            "vendorInfo": {
                "firstName": vendorregisterobj.firstName,
                "lastName": vendorregisterobj.lastName,
                "email": vendorregisterobj.email,
                "contactNum": vendorregisterobj.phoneNum,
                "username": vendorregisterobj.username,
                "password": vendorregisterobj.password,
                "institution": vendorregisterobj.institution ? vendorregisterobj.institution : "",
                "rating": 1,
                "isOTPVerified": 0,
                "category": vendorcat,
                "panNum": ("panno" in vendorregisterobj) ? vendorregisterobj.panno : "",
                "serviceTaxNum": ("taxno" in vendorregisterobj) ? vendorregisterobj.taxno : "",
                "vatNum": ("vatno" in vendorregisterobj) ? vendorregisterobj.vatno : "",
                "referringUserID": 0,
                "knownSince": "",
                "errorMessage": "",
                "sessionID": ""
            }
        };
        return $http({
            method: 'POST',
            url: domain + 'addnewvendor',
            encodeURI: true,
            headers: { 'Content-Type': 'application/json' },
            data: params
        }).then(function (response) {
            if (response && response.data && response.data.errorMessage == "") {
                store.set('sessionid', response.data.sessionID);
                store.set('currentUser', response.data);
                store.set('verified', 0);
                store.set('emailverified', 0);
                if(response.data.credentialsVerified == 1){
                    store.set('credverified', 1);
                } else {
                    store.set('credverified', 0);
                }
                self.setCurrentUser();
                return response.data;
                //growlService.growl('Welcome to PRM360, Please go thourgh with your Auctions', 'inverse');
                //return "Vendor Registration Successfully Completed.";
            } else if (response && response.data && response.data.errorMessage != "") {
                return response.data.errorMessage;
            } else {
                return "Vendor Registration Failed.";
            }
        });
    };


    self.vendorregistration1 = function (vendorregisterobj) {
        var vendorcat = [];
        vendorcat.push(vendorregisterobj.category);
        console.log(vendorregisterobj.role);
        var params = {
            "register": {
                "firstName": vendorregisterobj.firstName,
                "lastName": vendorregisterobj.lastName,
                "email": vendorregisterobj.email,
                "phoneNum": vendorregisterobj.phoneNum,
                "username": vendorregisterobj.username,
                "password": vendorregisterobj.password,
                "companyName": vendorregisterobj.institution ? vendorregisterobj.institution : "",
                "isOTPVerified": 0,
                "category": vendorregisterobj.category ? vendorregisterobj.category : "",
                "userType": vendorregisterobj.role,
                "panNumber": ("panno" in vendorregisterobj) ? vendorregisterobj.panno : "",
                "stnNumber": ("taxno" in vendorregisterobj) ? vendorregisterobj.taxno : "",
                "vatNumber": ("vatno" in vendorregisterobj) ? vendorregisterobj.vatno : "",
                "referringUserID": 0,
                "knownSince": "",
                "errorMessage": "",
                "sessionID": "",
                "userID": 0,
                "department": "",
                "subcategories" : vendorregisterobj.subcategories ? vendorregisterobj.subcategories : []
            }
        };
        return $http({
            method: 'POST',
            url: domain + 'register',
            encodeURI: true,
            headers: { 'Content-Type': 'application/json' },
            data: params
        }).then(function (response) {
            if (response && response.data && response.data.errorMessage == "") {
                store.set('sessionid', response.data.sessionID);
                store.set('currentUser', response.data.userInfo);
                store.set('verified', 0);
                store.set('emailverified', 0);
                if(response.data.credentialsVerified == 1){
                    store.set('credverified', 1);
                } else {
                    store.set('credverified', 0);
                }
                self.setCurrentUser();
                return response.data;
                //growlService.growl('Welcome to PRM360, Please go thourgh with your Auctions', 'inverse');
                //return "Vendor Registration Successfully Completed.";
            } else if (response && response.data && response.data.errorMessage != "") {
                return response.data.errorMessage;
            } else {
                return "Vendor Registration Failed.";
            }
        });
    };




    self.addnewuser = function (addnewuserobj) {
        var referringUserID = 0;
        referringUserID = self.getUserId();
        var params = {
            "register": {
                "firstName": addnewuserobj.firstName,
                "lastName": addnewuserobj.lastName,
                "email": addnewuserobj.email,
                "phoneNum": addnewuserobj.phoneNum,
                "username": addnewuserobj.email,
                "password": addnewuserobj.phoneNum,
                "companyName": addnewuserobj.companyName ? addnewuserobj.companyName : "",
                "isOTPVerified": 0,
                "category": addnewuserobj.category ? addnewuserobj.category : "",
                "userType": addnewuserobj.userType,
                "panNumber": "",
                "stnNumber": "",
                "vatNumber": "",
                "referringUserID": referringUserID,
                "knownSince": "",
                "errorMessage": "",
                "sessionID": "",
                "userID": 0,
                "department": ""
            }
        };
        return $http({
            method: 'POST',
            url: domain + 'register',
            encodeURI: true,
            headers: { 'Content-Type': 'application/json' },
            data: params
        }).then(function (response) {
            return response.data;
        });
    };


};


