prmApp

    .controller('editFormCtrl', function ($scope, $http, $state, domain, $filter, $stateParams, $timeout, auctionsService, userService, SignalRFactory, fileReader, growlService) {
        $scope.Id = $stateParams.Id;
        $scope.Vendors = [];
        $scope.selectedA = [];
        $scope.selectedB = [];
        $scope.formRequest = {
            auctionVendors: []
        };
        var origReq = {
            auctionVendors: []
        };
        $scope.categories = [];
        $scope.vendorsLoaded = false;
        $scope.selectVendorShow = true;
        $scope.addVendorShow = false;

        $scope.getData = function () {
            auctionsService.getrequirementdata({ "reqid": $stateParams.Id, "sessionid": userService.getUserToken(), "userid": userService.getUserId() })
                .then(function (response) {

                    var category = response.category[0];
                    response.category = category;
                    response.taxes = parseInt(response.taxes);
                    response.paymentTerms = parseInt(response.paymentTerms);
                    $scope.formRequest = response;
                    //$scope.formRequest.urgency.push(urgency);
                    $scope.SelectedVendors = $scope.formRequest.auctionVendors;
                    $scope.getvendors();
                });
            $http({
                method: 'GET',
                url: domain + 'PRMServiceQA.svc/REST/getcategories?sessionid=' + userService.getUserToken(),
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' }
            }).then(function (response) {
                if (response && response.data) {
                    if (response.data.length > 0) {
                        $scope.categories = response.data;
                        $scope.showCategoryDropdown = true;
                    }
                } else {
                    console.log(response.data[0].errorMessage);
                }
            }, function (result) {
                console.log("there is no current auctions");
            });

        }
        $scope.getData();
        $scope.getFile = function () {
            $scope.progress = 0;
            // console.log($("#attachement"));
            $scope.file = $("#attachement")[0].files[0];
            console.log($("#attachement")[0].files[0]);
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    var bytearray = new Uint8Array(result);
                    $scope.formRequest.attachment = $.makeArray(bytearray);
                    $scope.formRequest.attachmentName = $scope.file.name;
                });
        };

        $scope.changeCategory = function(){
            swal({
                title: "Are you sure?",
                text: "The existing vendors will be removed and an email will be sent to them notifying the same.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F44336",
                confirmButtonText: "Yes, I am sure",
                closeOnConfirm: true
            }, function () {
                $scope.getvendors();
                $scope.formRequest.auctionVendors =[];
            });
            
        }

        


        $scope.postRequest = function () {
            //console.log($scope.formRequest);
            $scope.formRequest.requirementID = $scope.Id;
            $scope.formRequest.customerID = userService.getUserId();
            $scope.formRequest.customerFirstname = userService.getFirstname();
            $scope.formRequest.customerLastname = userService.getLastname();
            $scope.formRequest.isClosed = "NOTSTARTED";
            $scope.formRequest.endTime = "";
            $scope.formRequest.sessionID = userService.getUserToken();
            var categories = [];
            categories.push($scope.formRequest.category);
            $scope.formRequest.category = categories;
            console.log($scope.formRequest.urgency);
            swal({
                title: "Are you sure?",
                text: "This will send an email invite to any new vendors you selected.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F44336",
                confirmButtonText: "OK",
                closeOnConfirm: true
            }, function () {
                auctionsService.postrequirementdata($scope.formRequest)
                    .then(function (response) {
                        if (response.objectID > 0) {
                            swal({
                                title: "Done!",
                                text: "Requirement Updated Successfully",
                                type: "success",
                                showCancelButton: false,
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Ok",
                                closeOnConfirm: true
                            },
                                function () {
                                    //$state.go('view-requirement');
                                    $state.go('view-requirement', { 'Id': response.objectID });
                                });
                        }
                    });
            });

        }

        $scope.getvendors = function () {
            $scope.vendorsLoaded = false;
            if ($scope.formRequest.category != undefined) {
                var category = [];
                category.push($scope.formRequest.category);
                var params = { 'Categories': category, 'sessionID': userService.getUserToken(), 'userid': userService.getUserId() };
                $http({
                    method: 'POST',
                    url: domain + 'PRMServiceQA.svc/REST/getvendors',
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
                            //$scope.Vendors = response.data;                            
                        }
                    } else {
                        console.log(response.data[0].errorMessage);
                    }
                }, function (result) {
                    console.log("there is no current auctions");
                });
            }

        };


        $scope.selectForA = function (item) {
            var index = $scope.selectedA.indexOf(item);
            if (index > -1) {
                $scope.selectedA.splice(index, 1);
            } else {
                $scope.selectedA.splice($scope.selectedA.length, 0, item);
            }
        }

        $scope.selectForB = function (item) {
            var index = $scope.selectedB.indexOf(item);
            if (index > -1) {
                $scope.selectedB.splice(index, 1);
            } else {
                $scope.selectedB.splice($scope.selectedA.length, 0, item);
            }
        }

        $scope.AtoB = function () {
            for (i = 0; i < $scope.selectedA.length; i++) {
                $scope.formRequest.auctionVendors.push($scope.selectedA[i]);
                $scope.Vendors.splice($scope.Vendors.indexOf($scope.selectedA[i]), 1);
            }
            $scope.reset();
        }

        $scope.BtoA = function () {
            for (i = 0; i < $scope.selectedB.length; i++) {
                $scope.Vendors.push($scope.selectedB[i]);
                $scope.formRequest.auctionVendors.splice($scope.formRequest.auctionVendors.indexOf($scope.selectedB[i]), 1);
            }
            $scope.reset();
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


        $scope.newVendor = {};

        $scope.addVendor = function () {
            $scope.emailRegx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            //$scope.emailRegx = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
            var addVendorValidationStatus = false;
            $scope.firstvalidation = $scope.lastvalidation = $scope.contactvalidation = $scope.emailvalidation = $scope.categoryvalidation = $scope.emailregxvalidation = false;
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
            if ($scope.newVendor.email == "" || $scope.newVendor.email === undefined) {
                $scope.emailvalidation = true;
                addVendorValidationStatus = true;
            } else if (!$scope.emailRegx.test($scope.newVendor.email)) {
                $scope.emailregxvalidation = true;
                addVendorValidationStatus = true;
            }
            if ($scope.formRequest.category == "" || $scope.formRequest.category === undefined) {
                $scope.categoryvalidation = true;
                addVendorValidationStatus = true;
            }
            if (addVendorValidationStatus) {
                return false;
            }
            var vendCategories = [];
            $scope.newVendor.category = $scope.formRequest.category;
            vendCategories.push($scope.newVendor.category);
            var params = {
                "vendorInfo": {
                    "firstName": $scope.newVendor.firstName,
                    "lastName": $scope.newVendor.lastName,
                    "email": $scope.newVendor.email,
                    "contactNum": $scope.newVendor.contactNum,
                    "username": $scope.newVendor.contactNum,
                    "password": $scope.newVendor.contactNum,
                    "rating": 1,
                    "category": vendCategories,
                    "panNum": ("panno" in $scope.newVendor) ? $scope.newVendor.panno : "",
                    "serviceTaxNum": ("serviceTaxNo" in $scope.newVendor) ? $scope.newVendor.serviceTaxNo : "",
                    "vatNum": ("vatNum" in $scope.newVendor) ? $scope.newVendor.vatNum : "",
                    "referringUserID": parseInt(userService.getUserId()),
                    "knownSince": ("knownSince" in $scope.newVendor) ? $scope.newVendor.knownSince : "",
                    "errorMessage": "",
                    "sessionID": userService.getUserToken()
                }
            };
            $http({
                method: 'POST',
                url: domain + 'PRMServiceQA.svc/REST/addnewvendor',
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' },
                data: params
            }).then(function (response) {
                if (response && response.data && response.data.errorMessage == "") {
                    $scope.formRequest.auctionVendors.push({ vendorName: $scope.newVendor.firstName + " " + $scope.newVendor.lastName, vendorID: response.data.objectID });
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
    })
