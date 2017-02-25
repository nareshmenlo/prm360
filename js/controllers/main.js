prmApp
    // =========================================================================
    // Base controller for common functions
    // =========================================================================

    .controller('prmAppCtrl', function ($timeout, $state, $scope, growlService, userService, auctionsService, $http, $rootScope, SignalRFactory) {
        $scope.loggedIn = userService.isLoggedIn();
        $scope.user = {};
        $scope.addrequirementaccess = true;

        $scope.showAddNewReq = function () {
            if (window.location.hash != "#/login" && userService.getUserType() == "CUSTOMER") {
                return true;
            } else {
                return false;
            }
        }





        $scope.showIsUserVendor = function () {
            if (window.location.hash != "#/login" && userService.getUserType() == "VENDOR") {
                return true;
            } else {
                return false;
            }
        }








        $scope.showAddButtons = function () {

        }

        $scope.registerobj = {};
        var options = {
            loop: true,
            margin: 10,
            dots: false,
            autoplay: true,
            autoplayTimeout: 3000,
            autoplayHoverPause: true,
            nav: false,
            responsive: {
                0: {
                    items: 1,
                },
                600: {
                    items: 3,
                },
                1000: {
                    items: 4
                }
            }
        }
        // $scope.formRequest = {};
        $scope.userError = {};
        $scope.msg = userService.getMessage();
        $scope.showMessage = true;
        $scope.successshowMessage = true;
        $scope.userData = userService.userData;
        if($scope.userData.currentUser != null){
            $scope.fullName = userService.userData.currentUser.firstName + " " + userService.userData.currentUser.lastName;
        } else {
            $scope.fullName = "";
        }
        
        $scope.closeMsg = function () {
            $scope.showMessage = false;
        }
        $scope.array = [1, 2, 3, 4];

        $scope.logout = function () {
            userService.logout().then(function () {
                $scope.loggedIn = userService.isLoggedIn();
            });
        }

        $scope.getErrMsg = function (message) {
            if (typeof message == 'string') {
                return message;
            } else if (typeof message == 'object') {
                var result = "";
                angular.forEach(message, function (value, key) {
                    result += value[0] + '<br />';
                });
                return result;
            }
        }
        // Detact Mobile Browser
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            angular.element('html').addClass('ismobile');
        }

        // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
        this.sidebarToggle = {
            left: false,
            right: false
        }

        // By default template has a boxed layout
        this.layoutType = localStorage.getItem('ma-layout-status');

        // For Mainmenu Active Class
        this.$state = $state;

        //Close sidebar on click
        this.sidebarStat = function (event) {
            if (!angular.element(event.target).parent().hasClass('active')) {
                this.sidebarToggle.left = false;
            }
        }

        //Listview Search (Check listview pages)
        this.listviewSearchStat = false;

        this.lvSearch = function () {
            this.listviewSearchStat = true;
        }

        //Listview menu toggle in small screens
        this.lvMenuStat = false;

        //Blog
        this.wallCommenting = [];

        this.wallImage = false;
        this.wallVideo = false;
        this.wallLink = false;

        //Skin Switch
        this.currentSkin = 'blue';

        this.skinList = [
            'lightblue',
            'bluegray',
            'cyan',
            'teal',
            'green',
            'orange',
            'blue',
            'purple'
        ]

        this.skinSwitch = function (color) {
            this.currentSkin = color;
        };

        /*$scope.addItem = function(){
            var obj = {
                auctionTimerId:1000,
                title:"test",
                price:11244354,
                bids:24,
                auctionEnds:'123465'
            }
            $scope.myHotAuctions.push(obj);
        }*/
        $scope.reduceTime = function (timerId, time) {
            addCDSeconds(timerId, time);
        }

        $scope.stopBid = function (item) {
            $scope.myHotAuctions[0].TimeLeft = 60;
        }
    })

// =========================================================================
// FORGOT PASSWORD
// =========================================================================

    /*.controller('frgtPassCtrl', function ($scope, $filter, $stateParams, $http, domain, $state, $timeout, auctionsService, userService, SignalRFactory, growlService) {
        $scope.hashLoc = window.location.hash;
        $scope.Id = $stateParams.Id;

    })*/

