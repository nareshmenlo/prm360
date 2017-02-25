prmApp
    // =========================================================================
    // COMMON FORMS
    // =========================================================================

    .controller('formCtrl', function ($state, $stateParams, $scope, auctionsService, userService, $http, domain, fileReader, growlService, $log, $filter, ngDialog) {

        var curDate = new Date();
         var today = moment();
        var tomorrow = today.add('days', 1);
        var dateObj = $('.datetimepicker').datetimepicker({
            format: 'DD/MM/YYYY',
            useCurrent: false,
            minDate: tomorrow,
            keepOpen:false
        });
        $scope.subcategories = [];
        $scope.sub = {
            selectedSubcategories: [],
        }

        
        $scope.postRequestLoding = false;
        $scope.selectedSubcategories = [];

        
        
        $scope.selectVendorShow = true;
        $scope.isEdit = false;
        //Input Slider
        this.nouisliderValue = 4;
        this.nouisliderFrom = 25;
        this.nouisliderTo = 80;
        this.nouisliderRed = 35;
        this.nouisliderBlue = 90;
        this.nouisliderCyan = 20;
        this.nouisliderAmber = 60;
        this.nouisliderGreen = 75;

        //Color Picker
        this.color = '#03A9F4';
        this.color2 = '#8BC34A';
        this.color3 = '#F44336';
        this.color4 = '#FFC107';

        $scope.Vendors = [];
        $scope.categories = [];
        $scope.selectedA = [];
        $scope.selectedB = [];
        $scope.showCategoryDropdown = false;
        $scope.checkVendorPhoneUniqueResult = false;
        $scope.checkVendorEmailUniqueResult = false;
        $scope.checkVendorPanUniqueResult = false;
        $scope.checkVendorTinUniqueResult = false;
        $scope.checkVendorStnUniqueResult = false;
        $scope.showFreeCreditsMsg = false;
        $scope.showNoFreeCreditsMsg = false;
        $scope.formRequest = {
            auctionVendors: []
        };
        $scope.Vendors.city = "";
        $scope.Vendors.quotationUrl = "";
        $scope.vendorsLoaded = false;
        $scope.requirementAttachment = [];

        $scope.budgetValidate = function(){
            $log.info("siva");
            if ($scope.formRequest.budget != "" && (isNaN($scope.formRequest.budget) || $scope.formRequest.budget.indexOf('.') > -1)) {
                $scope.postRequestLoding = false;
                swal({
                    title: "Error!",
                    text: "Please enter valid budget, budget should be greater than 1,00,000.",
                    type: "error",
                    showCancelButton: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true
                },
                    function () {
                       
                    });

                    $scope.formRequest.budget = "";
            }
        };

        $scope.clickToOpen = function () {
            ngDialog.open({ template: 'login/termsAddNewReq.html', width: 1000 });
        };

        $scope.changeCategory = function(){
            $scope.formRequest.auctionVendors = [];
            $scope.loadSubCategories();
            $scope.getvendors();
        }

        $scope.getCreditCount = function () {
            userService.getProfileDetails({ "userid": userService.getUserId(), "sessionid": userService.getUserToken() })
                .then(function (response) {
                    $scope.userDetails = response;
                    if (response.creditsLeft) {
                        $scope.showFreeCreditsMsg = true;
                    } else {
                        $scope.showNoFreeCreditsMsg = true;
                    }
                });
        }

        $scope.getCreditCount();

        $scope.getvendors = function () {
            $scope.vendorsLoaded = false;
            var category = [];

            category.push($scope.formRequest.category);
            //$scope.formRequest.category = category;
            if ($scope.formRequest.category != undefined) {
                var params = { 'Categories': category, 'sessionID': userService.getUserToken(), 'uID': userService.getUserId() };
                $http({
                    method: 'POST',
                    url: domain + 'getvendors',
                    encodeURI: true,
                    headers: { 'Content-Type': 'application/json' },
                    data: params
                }).then(function (response) {
                    if (response && response.data) {
                        if (response.data.length > 0) {
                            $scope.Vendors = response.data;
                            $scope.vendorsLoaded = true;
                            for (var j in $scope.formRequest.auctionVendors) {
                                for (var i in $scope.Vendors) {
                                    if ($scope.Vendors[i].vendorName == $scope.formRequest.auctionVendors[j].vendorName) {
                                        $scope.Vendors.splice(i, 1);
                                    }
                                }
                            }
                        }
                        //$scope.formRequest.auctionVendors =[];
                    } else {
                        console.log(response.data[0].errorMessage);
                    }
                }, function (result) {
                    console.log("there is no current auctions");
                });
            }

        };

        /*$scope.getvendorsbysubcat = function () {
            $scope.vendorsLoaded = false;
            var category = [];

            category.push($scope.sub.selectedSubcategories);
            //$scope.formRequest.category = category;
            if ($scope.formRequest.category != undefined) {
                var params = { 'Categories': category, 'sessionID': userService.getUserToken(), 'uID': userService.getUserId() };
                $http({
                    method: 'POST',
                    url: domain + 'getvendorsbycatnsubcat',
                    encodeURI: true,
                    headers: { 'Content-Type': 'application/json' },
                    data: params
                }).then(function (response) {
                    if (response && response.data) {
                        if (response.data.length > 0) {
                            $scope.Vendors = response.data;
                            $scope.vendorsLoaded = true;
                            for (var j in $scope.formRequest.auctionVendors) {
                                for (var i in $scope.Vendors) {
                                    if ($scope.Vendors[i].vendorName == $scope.formRequest.auctionVendors[j].vendorName) {
                                        $scope.Vendors.splice(i, 1);
                                    }
                                }
                            }
                        }
                        //$scope.formRequest.auctionVendors =[];
                    } else {
                        console.log(response.data[0].errorMessage);
                    }
                }, function (result) {
                    console.log("there is no current auctions");
                });
            }

        };*/

        $scope.getData = function () {
            $http({
                method: 'GET',
                url: domain + 'getcategories?userid=' + userService.getUserId() + '&sessionid=' + userService.getUserToken(),
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' }
            }).then(function (response) {
                if (response && response.data) {
                    if (response.data.length > 0) {
                        $scope.categories = _.uniq(_.map(response.data, 'category'));
                        $scope.categoriesdata = response.data;
                        $scope.showCategoryDropdown = true;
                    }
                } else {
                    console.log(response.data[0].errorMessage);
                }
            }, function (result) {
                console.log("there is no current auctions");
            });
            if($stateParams.Id){
                var id = $stateParams.Id;
                $scope.isEdit = true;
                
                auctionsService.getrequirementdata({ "reqid": $stateParams.Id, "sessionid": userService.getUserToken(), "userid": userService.getUserId() })
                    .then(function (response) {

                        var category = response.category[0];
                        response.category = category;
                        response.taxes = parseInt(response.taxes);
                        //response.paymentTerms = parseInt(response.paymentTerms);
                        $scope.formRequest = response;
                        $scope.formRequest.checkBoxEmail = true;
                        $scope.formRequest.checkBoxSms = true;
                        $scope.loadSubCategories();
                        

                        $scope.selectedSubcategories = response.subcategories.split(",");
                        for (i = 0; i < $scope.selectedSubcategories.length; i++) {
                            for (j = 0; j < $scope.subcategories.length; j++) {
                                if ($scope.selectedSubcategories[i] == $scope.subcategories[j].subcategory) {
                                    $scope.subcategories[j].ticked = true;
                                }
                            }
                        }
                        console.log($scope.formRequest);
                        //$scope.getvendors();
                        $scope.selectSubcat();
                        $scope.formRequest.attFile = response.attachmentName;
                        $scope.formRequest.deliveryTime = new moment($scope.formRequest.deliveryTime).format("DD-MM-YYYY");
                        $scope.formRequest.quotationFreezTime = new moment($scope.formRequest.quotationFreezTime).format("DD-MM-YYYY HH:mm");
                        //$scope.formRequest.urgency.push(urgency);
                        $scope.SelectedVendors = $scope.formRequest.auctionVendors;
                    });
            }
            
        };

        $scope.loadSubCategories = function(){
            $scope.subcategories = _.filter($scope.categoriesdata, {category: $scope.formRequest.category});
            /*$scope.subcategories = _.map($scope.subcategories, 'subcategory');*/
            console.log($scope.subcategories);
        }

        

        $scope.selectSubcat = function (subcat) {
            if (!$scope.isEdit) {
                $scope.formRequest.auctionVendors = [];
            }            
            $scope.vendorsLoaded = false;
            var category = [];
            var count = 0;
            var succategory = "";
            $scope.sub.selectedSubcategories = $filter('filter')($scope.subcategories, { ticked: true });
            selectedcount = $scope.sub.selectedSubcategories.length;
            if (selectedcount > 0) {
                succategory = _.map($scope.sub.selectedSubcategories, 'id');
                category.push(succategory);
                console.log(category);
                //$scope.formRequest.category = category;
                if ($scope.formRequest.category != undefined) {
                    var params = { 'Categories': succategory, 'sessionID': userService.getUserToken(), 'count': selectedcount, 'uID': userService.getUserId() };
                    $http({
                        method: 'POST',
                        url: domain + 'getvendorsbycatnsubcat',
                        encodeURI: true,
                        headers: { 'Content-Type': 'application/json' },
                        data: params
                    }).then(function (response) {
                        if (response && response.data) {
                            if (response.data.length > 0) {
                                $scope.Vendors = response.data;
                                $scope.vendorsLoaded = true;
                                for (var j in $scope.formRequest.auctionVendors) {
                                    for (var i in $scope.Vendors) {
                                        if ($scope.Vendors[i].vendorName == $scope.formRequest.auctionVendors[j].vendorName) {
                                            $scope.Vendors.splice(i, 1);
                                        }
                                    }
                                }
                            }
                            //$scope.formRequest.auctionVendors =[];
                        } else {
                            console.log(response.data[0].errorMessage);
                        }
                    }, function (result) {
                        console.log("there is no current auctions");
                    });
                }
            } else {
                $scope.getvendors();
            }
            
        }

        $scope.getData();

        $scope.checkVendorUniqueResult = function (idtype, inputvalue) {
            if (inputvalue == "" || inputvalue == undefined) {
                return false;
            }
            /*$scope.checkVendorPhoneUniqueResult=false;
            $scope.checkVendorEmailUniqueResult=false;*/
            userService.checkUserUniqueResult(inputvalue, idtype).then(function (response) {
                if (idtype == "PHONE") {
                    $scope.checkVendorPhoneUniqueResult = !response;
                } else if (idtype == "EMAIL") {
                    $scope.checkVendorEmailUniqueResult = !response;
                }
                else if (idtype == "PAN") {
                    $scope.checkVendorPanUniqueResult = !response;
                }
                else if (idtype == "TIN") {
                    $scope.checkVendorTinUniqueResult = !response;
                }
                else if (idtype == "STN") {
                    $scope.checkVendorStnUniqueResult = !response;
                }
            });
        };
        $scope.selectForA = function (item) {
            var index = $scope.selectedA.indexOf(item);
            if (index > -1) {
                $scope.selectedA.splice(index, 1);
            } else {
                $scope.selectedA.splice($scope.selectedA.length, 0, item);
            }
            for (i = 0; i < $scope.selectedA.length; i++) {
                $scope.formRequest.auctionVendors.push($scope.selectedA[i]);
                $scope.Vendors.splice($scope.Vendors.indexOf($scope.selectedA[i]), 1);
            }
            $scope.reset();
        }

        $scope.selectForB = function (item) {
            var index = $scope.selectedB.indexOf(item);
            if (index > -1) {
                $scope.selectedB.splice(index, 1);
            } else {
                $scope.selectedB.splice($scope.selectedA.length, 0, item);
            }
            for (i = 0; i < $scope.selectedB.length; i++) {
                $scope.Vendors.push($scope.selectedB[i]);
                $scope.formRequest.auctionVendors.splice($scope.formRequest.auctionVendors.indexOf($scope.selectedB[i]), 1);
            }
            $scope.reset();
        }

        $scope.AtoB = function () {

        }

        $scope.BtoA = function () {

        }

        $scope.reset = function () {
            $scope.selectedA = [];
            $scope.selectedB = [];
        }

        // $scope.getFile = function () {
        //     $scope.progress = 0;
        //     fileReader.readAsDataUrl($scope.file, $scope)
        //     .then(function(result) {
        //         $scope.formRequest.attachment = result;
        //     });
        // };

        $scope.getFile = function () {
            $scope.progress = 0;
            $scope.file = $("#attachement")[0].files[0];
            console.log($("#attachement")[0].files[0]);
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    var bytearray = new Uint8Array(result);
                    $scope.formRequest.attachment = $.makeArray(bytearray);
                    //$scope.bidAttachementName=$scope.file.name;
                    //$scope.formRequest.attachment=$scope.file.name;
                    $scope.formRequest.attachmentName = $scope.file.name;
                });
        };


        $scope.newVendor = {};
        $scope.Attaachmentparams = {};
        $scope.deleteAttachment = function(reqid){
            $scope.Attaachmentparams = {
                reqID: reqid,
                userID: userService.getUserId()
            }
            auctionsService.deleteAttachment($scope.Attaachmentparams)
            .then(function (response) {
                if(response.errorMessage != ""){
                    growlService.growl(response.errorMessage,"inverse");
                } else {
                    growlService.growl("Attachment deleted Successfully", "inverse");
                    $scope.getData();
                }
            });
        }

        $scope.newVendor.panno = "";
        $scope.newVendor.vatNum = "";
        $scope.newVendor.serviceTaxNo = "";

        $scope.addVendor = function () {
            $scope.emailRegx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            $scope.mobileRegx = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
            $scope.panregx = /^([a-zA-Z]{5})(\d{4})([a-zA-Z]{1})$/;
            //$scope.emailRegx = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
            var addVendorValidationStatus = false;
            $scope.firstvalidation = $scope.companyvalidation = $scope.lastvalidation = $scope.contactvalidation = $scope.emailvalidation = $scope.categoryvalidation = $scope.emailregxvalidation = $scope.contactvalidationlength = $scope.panregxvalidation = $scope.tinvalidation = $scope.stnvalidation = $scope.knownsincevalidation = false;
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
            }
            else if ($scope.newVendor.contactNum.length != 10) {
                $scope.contactvalidationlength = true;
                addVendorValidationStatus = true;
            }
            if ($scope.newVendor.email == "" || $scope.newVendor.email === undefined) {
                $scope.emailvalidation = true;
                addVendorValidationStatus = true;
            }
            else if (!$scope.emailRegx.test($scope.newVendor.email)) {
                $scope.emailregxvalidation = true;
                addVendorValidationStatus = true;
            }

           
            if ($scope.newVendor.panno != "" && $scope.newVendor.panno != undefined && !$scope.panregx.test($scope.newVendor.panno)) {
                $scope.panregxvalidation = true;
                addVendorValidationStatus = true;
            }
            if ($scope.newVendor.vatNum != "" && $scope.newVendor.vatNum != undefined && $scope.newVendor.vatNum.length != 11) {
                $scope.tinvalidation = true;
                addVendorValidationStatus = true;
            }
           
            if ($scope.newVendor.serviceTaxNo != "" && $scope.newVendor.serviceTaxNo != undefined && $scope.newVendor.serviceTaxNo.length != 15) {
                $scope.stnvalidation = true;
                addVendorValidationStatus = true;
            }
            if ($scope.formRequest.category == "" || $scope.formRequest.category === undefined) {
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
            $scope.newVendor.category = $scope.formRequest.category;
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
                    $scope.formRequest.auctionVendors.push({ vendorName: $scope.newVendor.firstName + " " + $scope.newVendor.lastName, companyName: $scope.newVendor.companyName, vendorID: response.data.objectID });
                    $scope.newVendor = null;
                    $scope.newVendor = {};
                    //$scope.addVendorForm.$setPristine();
                    $scope.addVendorShow = false;
                    $scope.selectVendorShow = true;
                    growlService.growl("Vendor Added Successfully.", 'inverse');
                } else if (response && response.data && response.data.errorMessage) {
                    growlService.growl(response.data.errorMessage, 'inverse');
                } else {
                    growlService.growl('Unexpected Error Occurred', 'inverse');
                }
            });
        }

        //$scope.checkboxModel = {
        //    value1: true
        //};

        $scope.formRequest.checkBoxEmail = true;
        $scope.formRequest.checkBoxSms = true;
        $scope.postRequestLoding = false;
        $scope.postRequest = function () {
            $scope.postRequestLoding = true;
            console.log("siva---->"+Number($scope.formRequest.budget));
            if (Number($scope.formRequest.budget) < 100000) {
                $scope.postRequestLoding = false;
                swal({
                    title: "Error!",
                    text: "Budget cannot be lest than 100000.",
                    type: "error",
                    showCancelButton: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true
                },
                    function () {
                        $scope.postRequestLoding = false;
                       return;
                    });
            }
            else
            {
                if ($scope.formRequest.checkBoxEmail == true && $scope.formRequest.checkBoxSms == true){
                    $scope.textMessage = "This will send an email and sms invite to all the vendors selected above.";
                }
                else if($scope.formRequest.checkBoxEmail == true){
                    $scope.textMessage = "This will send an email invite to all the vendors selected above.";
                }
                else if ($scope.formRequest.checkBoxSms == true) {
                    $scope.textMessage = "This will send an SMS invite to all the vendors selected above.";
                }
                else {
                    $scope.textMessage = "This will not send an SMS or EMAIL the vendors selected above.";
                }

                swal({
                    title: "Are you sure?",
                    text: $scope.textMessage,
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#F44336",
                    confirmButtonText: "OK",
                    closeOnConfirm: true
                }, function () {
                    $scope.postRequestLoding = true;
                    var ts = moment($scope.formRequest.deliveryTime, "DD-MM-YYYY HH:mm").valueOf();
                    var m = moment(ts);
                    var deliveryDate = new Date(m);
                    var milliseconds = parseInt(deliveryDate.getTime() / 1000.0);
                    $scope.formRequest.deliveryTime = "/Date(" + milliseconds + "000+0530)/";

                    var ts = moment($scope.formRequest.quotationFreezTime, "DD-MM-YYYY HH:mm").valueOf();
                    var m = moment(ts);
                    var quotationDate = new Date(m);
                    var milliseconds = parseInt(quotationDate.getTime() / 1000.0);
                    $scope.formRequest.quotationFreezTime = "/Date(" + milliseconds + "000+0530)/";

                    $scope.formRequest.requirementID = $stateParams.Id ? $stateParams.Id : -1;
                    $scope.formRequest.customerID = userService.getUserId();
                    $scope.formRequest.customerFirstname = userService.getFirstname();
                    $scope.formRequest.customerLastname = userService.getLastname();
                    $scope.formRequest.isClosed = "NOTSTARTED";
                    $scope.formRequest.endTime = "";
                    $scope.formRequest.sessionID = userService.getUserToken();
                    $scope.formRequest.subcategories = "";
                    for(i = 0; i < $scope.sub.selectedSubcategories.length; i++){
                        $scope.formRequest.subcategories += $scope.sub.selectedSubcategories[i].subcategory + ",";
                    }
                    var category = [];
                    category.push($scope.formRequest.category);
                     $scope.formRequest.category = category;
                    auctionsService.postrequirementdata($scope.formRequest)
                        .then(function (response) {
                            console.log(response);
                            if (response.objectID != 0) {
                                swal({
                                    title: "Done!",
                                    text: "Requirement Created Successfully",
                                    type: "success",
                                    showCancelButton: false,
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: "Ok",
                                    closeOnConfirm: true
                                },
                                    function () {
                                        $scope.postRequestLoding = false;                                       
                                        //$state.go('view-requirement');
                                        $state.go('view-requirement', { 'Id': response.objectID });
                                    });
                                
                            }
                        });
                });
                $scope.postRequestLoding = false;
            }
        }
    })