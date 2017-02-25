angular.module("prm.user").service('userService',userService);


function userService ($http,store,$state,$rootScope, version,domain ,growlService) {
      //var domain = 'http://182.18.169.32/services/';
      var self = this;
      var successMessage = '';

      // currentUser must be stored in an object since it is nullable
      // If we two-way bind to currentUser directly, the bind would break
      // when currentUser is set to null.

      self.userData = { currentUser: null};

      self.getUserObj = function() {
        if (!self.userData.currentUser || !self.userData.currentUser.id) {
          self.userData.currentUser = store.get('currentUser');
        }
        return self.userData.currentUser || {};
      };
      self.getUserToken = function(){
          return store.get('sessionid');
      };

      self.getOtpVerified = function(){
          return self.getUserObj().isOTPVerified;
      };
      self.removeUserToken = function(){
          store.remove('sessionid');
      };

      self.getRememberMeToken = function(){
          return store.get('rememberMeToken');
      };
      self.removeRememberMeToken = function(){
          store.remove('rememberMeToken');
      };

      self.removeUser = function(){
          store.remove('currentUser');
      };

      self.getUsername = function() {
        return self.getUserObj().username;
      };

      self.getFirstname = function() {
        return self.getUserObj().firstName;
      };
      
      self.getLastname = function() {
        return self.getUserObj().lastName;
      };

      self.getUserId = function() {
        return self.getUserObj().userID;
      };

      self.setMessage = function(msg) {
        successMessage = msg;
      };

      self.getMessage = function() {
        return successMessage;
      };

      self.getUserType = function() {
         return self.getUserObj().userType;
       };


      self.setCurrentUser = function() {
        self.userData.sessionid = self.getUserToken();
        self.userData.currentUser = self.getUserObj();
      };

      self.setCurrentUser();
      
      self.checkUniqueValue = function(type, currentvalue) {
        var data = {
          "type": type,
          "currentvalue": currentvalue
        };
        console.log(data);
        return false;
        // return $http.post("", data).then( function(res) {
        //   return res.data.isUnique;
        // });
      } ; 

      self.forgotpassword = function(forgot) {
        var data = {
          "email":forgot.email
        };
        //data=forgot.email;
        return $http({
              method: 'POST',
              url: domain+'PRMService.svc/REST/forgotpassword',
              headers: {'Content-Type': 'application/json'},
              encodeURI: true,
              data: data
             }).then(function(response) {
              return response;
          });
        //  $http.post(domain+"PRMService.svc/REST/forgotassword", data).then( function(res) {
        //   return res;
        // });
      };  

      self.resendotp = function(userid) {
        var data = {
          "userID":userid
        };
        return $http({
              method: 'POST',
              url: domain+'PRMService.svc/REST/sendotp',
              headers: {'Content-Type': 'application/json'},
              encodeURI: true,
              data: data
             }).then(function(response) {
              swal("Done!", "OTP send to your registered Mobile No.", "success"); 
          });
      };

      self.verifyOTP = function(otpobj) {
        var data = {
          "OTP":otpobj.otp,
          "userID":self.getUserId()
        };
        return $http({
              method: 'POST',
              url: domain+'PRMService.svc/REST/verifyotp',
              headers: {'Content-Type': 'application/json'},
              encodeURI: true,
              data: data
             }).then(function(response) {
              store.set('sessionid',response.data.sessionID);
              store.set('currentUser',response.data.userInfo);
              self.setCurrentUser();
              if(response.data.userInfo.isOTPVerified==1 && response.data.userInfo.credentialsVerified==1){
                $state.go('home');
                $state.reload();
                growlService.growl('Welcome to PRM360', 'inverse');                                
              }
              return response.data;              
          });
      };  

  		self.isLoggedIn = function(){
  			return (self.getUserToken() && self.getOtpVerified()) ? true : false;
  		};
        
      self.updateUser = function(params){
          var params1 = {
              "user":{
                  "userID": params.userID,
                  "firstName":params.firstName,
                  "lastName":params.lastName,
                  "email":params.emailAddress,
                  "phoneNum":params.phoneNum,
                  "sessionID":params.sessionID,
                  "isOTPVerified":params.isOTPVerified,
                  "credentialsVerified":params.credentialsVerified,
                  "errorMessage":params.errorMessage,
                  "achievements": ("achievements" in params)? params.achievements : "",
                  "assocWithOEM": ("assocWithOEM" in params)? params.assocWithOEM : "",
                  "clients": ("clients" in params)? params.clients : "",
                  "establishedDate": '/Date(634334872000+0000)/',
                  "products": ("products" in params)? params.products : "",
                  "strengths": ("strengths" in params)? params.strengths : "",
                  "responseTime": ("responseTime" in params)? params.responseTime : "",
                  "oemCompanyName": ("oemCompanyName" in params)? params.oemCompanyName : "",
                  "oemKnownSince": ("oemKnownSince" in params)? params.oemKnownSince : "",
                  "files": []
              }
          }
        return $http({
          method: 'POST',
          url: domain+'PRMService.svc/REST/updateuserinfo',
          headers: {'Content-Type': 'application/json'},
          encodeURI: true,
          data: params1
         }).then(function(response) {
            if(response && response.data && response.data.errorMessage=="" && response.data.objectID!=0){
            	store.set('sessionid',response.data.sessionID);
            	store.set('currentUser',response.data.userInfo);
             	self.setCurrentUser();
                if(response.data.objectID > 0){
                    growlService.growl('User data has updated Successfully!', 'inverse');
                    return true;
                } else {
                    return false;
                }
          	}else if(response && response.data && response.data.errorMessage!=""){
                return response.data.errorMessage;  
	        }else{
             return "Update failed";
          }
        }, function(result) {
            return "Update failed";
        });
      }
      
      self.getProfileDetails = function(params){
          return $http({
                method: 'GET',
                url: domain+'PRMService.svc/REST/getuserdetails?userid='+params.userid+'&sessionid='+params.sessionid,
                encodeURI: true,
                headers: {'Content-Type': 'application/json'}
                //data: params
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     list=response.data;
                     return list;
                }else{
                    console.log(response.data.errorMessage);
                }
            }, function(result) {
                console.log(result);
            });
      }
	
      self.login = function(user) {
         return $http({
          method: 'POST',
          url: domain+'PRMService.svc/REST/loginuser',
          headers: {'Content-Type': 'application/json'},
          encodeURI: true,
          data: user
         }).then(function(response) {
            if(response && response.data && response.data.errorMessage=="" && response.data.objectID!=0){
            	store.set('sessionid',response.data.sessionID);
            	store.set('currentUser',response.data.userInfo);
             	self.setCurrentUser();
              if(response.data.userInfo.isOTPVerified==1 && response.data.userInfo.credentialsVerified==1){
                $state.go('home');                
              }else if(response.data.userInfo.isOTPVerified==0){
                self.resendotp(response.data.objectID);
              }
              return response.data;
          	}else if(response && response.data && response.data.errorMessage!=""){
                return response.data.errorMessage;  
	        }else{
             return "Login failed";
          }
        }, function(result) {
            return "Login failed";
        });
      };

      self.logout = function() {
        return $http({
                    method : 'POST',
                    data : {"userid":self.getUserId()},
                    url : domain+'PRMService.svc/REST/logoutuser',
                    headers: {'Content-Type': 'application/json'}
                }).then(function(response) {              
                    self.removeUserToken();
                    self.removeUser();
                    delete self.userData.sessionid;
                    delete self.userData.currentUser;
                    self.setMessage("Successfully Logged Out");
                    $state.go('login');
                });
      };
      
      self.userregistration = function(register) {            
       var params={
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
                "institution":  ("institution" in register)? register.institution : "",
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
                "errorMessage": "",
                "sessionID": ""
            }
        };

        return $http({
            method: 'POST',
            url: domain+'PRMService.svc/REST/registeruser',
            encodeURI: true,
            headers: {'Content-Type': 'application/json'},
            data: params
          }).then(function(response) {
            if(response && response.data && response.data.errorMessage=="" && response.data.objectID!=0){
                store.set('sessionid',response.data.sessionID);
                store.set('currentUser',response.data.userInfo);
                self.setCurrentUser();
                return response.data;
                //$state.go('home');
                //growlService.growl('Welcome to PRM360, To add new requirement Please use "+" at the Bottom.', 'inverse');
            }else if(response && response.data && response.data.errorMessage!=""){
                    return response.data.errorMessage;  
            }else{
                return "Registeration failed";
            }
        }, function(result) {
           return "Registeration failed";
        });
      };

      self.vendorregistration = function(vendorregisterobj) {
          var vendorcat=[];
          vendorcat.push(vendorregisterobj.category);
            var params = {
              "vendorInfo": {
                  "firstName": vendorregisterobj.firstName,
                  "lastName": vendorregisterobj.lastName,
                  "email": vendorregisterobj.email,
                  "contactNum":vendorregisterobj.phoneNum,
                  "username": vendorregisterobj.username,
                  "password": vendorregisterobj.password,
                  "rating": 1,
                  "category": vendorcat,
                  "panNum": ("panno" in vendorregisterobj)? vendorregisterobj.panno : "",
                  "serviceTaxNum": ("taxno" in vendorregisterobj)? vendorregisterobj.taxno : "",
                  "vatNum": ("vatno" in vendorregisterobj)? vendorregisterobj.vatno : "",
                  "referringUserID":0,
                  "knownSince": "",
                  "errorMessage": "",
                  "sessionID": ""
                }
            };
            return $http({
                method: 'POST',
                url: domain+'PRMService.svc/REST/addnewvendor',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: params
              }).then(function(response) {
                if(response && response.data && response.data.errorMessage==""){
                     store.set('sessionid',response.data.sessionID);
                    store.set('currentUser',response.data.userInfo);
                    self.setCurrentUser();
                    $state.go('home');
                    growlService.growl('Welcome to PRM360, Please go thourgh with your Auctions', 'inverse');
                    return "Vendor Registration Successfully Completed.";
                }else if(response && response.data && response.data.errorMessage != ""){
                    return response.data.errorMessage;  
                } else {
                    return "Vendor Registration Failed.";
                }
            });
      };  
		
};


