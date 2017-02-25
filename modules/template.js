prmApp

    // =========================================================================
    // LAYOUT
    // =========================================================================
    
    .directive('changeLayout', function(){
        
        return {
            restrict: 'A',
            scope: {
                changeLayout: '='
            },
            
            link: function(scope, element, attr) {
                
                //Default State
                if(scope.changeLayout === '1') {
                    element.prop('checked', true);
                }
                
                //Change State
                element.on('change', function(){
                    if(element.is(':checked')) {
                        localStorage.setItem('ma-layout-status', 1);
                        scope.$apply(function(){
                            scope.changeLayout = '1';
                        })
                    }
                    else {
                        localStorage.setItem('ma-layout-status', 0);
                        scope.$apply(function(){
                            scope.changeLayout = '0';
                        })
                    }
                })
            }
        }
    })



    // =========================================================================
    // MAINMENU COLLAPSE
    // =========================================================================

    .directive('toggleSidebar', function(){

        return {
            restrict: 'A',
            scope: {
                modelLeft: '=',
                modelRight: '='
            },
            
            link: function(scope, element, attr) {
                element.on('click', function(){
 
                    if (element.data('target') === 'mainmenu') {
                        if (scope.modelLeft === false) {
                            scope.$apply(function(){
                                scope.modelLeft = true;
                            })
                        }
                        else {
                            scope.$apply(function(){
                                scope.modelLeft = false;
                            })
                        }
                    }
                    
                    if (element.data('target') === 'chat') {
                        if (scope.modelRight === false) {
                            scope.$apply(function(){
                                scope.modelRight = true;
                            })
                        }
                        else {
                            scope.$apply(function(){
                                scope.modelRight = false;
                            })
                        }
                        
                    }
                })
            }
        }
    
    })
    

    
    // =========================================================================
    // SUBMENU TOGGLE
    // =========================================================================

    .directive('toggleSubmenu', function(){

        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.click(function(){
                    element.next().slideToggle(200);
                    element.parent().toggleClass('toggled');
                });
            }
        }
    })


    // =========================================================================
    // STOP PROPAGATION
    // =========================================================================
    
    .directive('stopPropagate', function(){
        return {
            restrict: 'C',
            link: function(scope, element) {
                element.on('click', function(event){
                    event.stopPropagation();
                });
            }
        }
    })

    .directive('aPrevent', function(){
        return {
            restrict: 'C',
            link: function(scope, element) {
                element.on('click', function(event){
                    event.preventDefault();
                });
            }
        }
    })


    // =========================================================================
    // PRINT
    // =========================================================================
    
    .directive('print', function(){
        return {
            restrict: 'A',
            link: function(scope, element){
                element.click(function(){
                    window.print();
                })   
            }
        }
    })

    .directive('miniItems', function(){
        return{
            restrict: 'EA',
            scope:
            {
                item:'=',
                timeleft:'='
            },
            templateUrl:'views/mini-item.html',
            controller:['$scope','$element','$attrs','$timeout','userService','auctionsService',function($scope,$element,$attrs,$timeout,userService,auctionsService){
                $scope.countdown1 = 2;
                $scope.auctionStarted = $scope.item.auctionStarted;
                $scope.stopBids = function(){
                    swal({
                        title: "Are you sure?",
                        text: "The Auction will be stopped after one minute.",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#F44336",
                        confirmButtonText: "Yes, Stop Bids!",
                        closeOnConfirm: false
                    }, function () {                        
                        $scope.$broadcast('timer-set-countdown-seconds', 60);
                        $scope.disableButtons();
                        var params={};
                        params.reqID=$scope.item.auctionID;
                        params.sessionID=userService.getUserToken();
                        params.userID=userService.getUserId();
                        params.newTicks=60
;                        auctionsService.updatebidtime(params);
                        swal("Done!", "Auction time reduced to oneminute.", "success");
                    });
                };
                $scope.updateTime = function(timerId,time){
                    var isDone = false;
                    $scope.$on('timer-tick', function (event, args) {
                        if(!isDone){
                            addCDSeconds($scope.item.auctionID,time);
                            isDone = true;
                            var params={};
                            params.reqID=$scope.item.auctionID;
                            params.sessionID=userService.getUserToken();
                            params.userID=userService.getUserId();
                            params.newTicks=($scope.countdownVal + time);
                            auctionsService.updatebidtime(params);
                        }                        
                    });
                }
                
                $scope.$on('timer-tick', function (event, args) {
                    $scope.countdownVal = event.targetScope.countdown;
                    if(event.targetScope.countdown < 61 && !$scope.disableStopBids && !$scope.disablereduceTime){
                        $timeout($scope.disableButtons(),1000);
                    }
                });
                
                $scope.disableButtons = function(){
                    $scope.disablereduceTime = true;
                    $scope.disableStopBids = true;
                }                
                $scope.userType = userService.getUserType();
                if($scope.userType=="VENDOR"){
                    $scope.customerBtns=false;   
                    $scope.vendorBtns = true; 
                } else {
                    $scope.customerBtns=true;  
                    $scope.vendorBtns = false;
                }
                $scope.cancelBid = function(itemId){
                    swal({
                        title: "Are you sure?",
                        text: "The Auction will be cancelled and vendors will be notified.",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#F44336",
                        confirmButtonText: "Yes, Cancel.",
                        closeOnConfirm: false
                    }, function () {                        
                        $scope.$broadcast('timer-set-countdown-seconds', 0);
                        $scope.disableButtons();
                        var params={};
                        params.reqID=$scope.item.auctionID;
                        params.sessionID=userService.getUserToken();
                        params.userID=userService.getUserId();
                        params.newTicks=-1;
;                       auctionsService.updatebidtime(params);
                        swal("Done!", "Requirement cancelled.", "success");
                    });
                }
            }]
        }
    }).directive('dateTimePicker', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      recipient: '='
    },link: function(scope, element, attrs, itemCtrl) {
      var input = element.find('input');
      console.log(input);
 
      input.datetimepicker({
        format: "mm/dd/yyyy hh:ii"
      });
 
      element.bind('blur keyup change', function(){
        itemCtrl.startTime = input.val();
        console.log(itemCtrl.startTime);
      });
    }
  }
})
.directive("owlCarousel", function() {
    return {
        restrict: 'E',
        transclude: false,
        link: function (scope) {
            scope.initCarousel = function(element) {
              // provide any default options you want
                var defaultOptions = {
                };
                var customOptions = scope.$eval($(element).attr('data-options'));
                // combine the two options objects
                for(var key in customOptions) {
                    defaultOptions[key] = customOptions[key];
                }
                // init carousel
                $(element).owlCarousel(defaultOptions);
            };
        }
    };
})
.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}])

.directive('owlCarouselItem', [function() {
    return {
        restrict: 'A',
        transclude: false,
        link: function(scope, element) {
          // wait for the last item in the ng-repeat then call init
            if(scope.$last) {
                scope.initCarousel(element.parent());
            }
        }
    };
}])
.directive("ngFileSelect",function(){

  return {
    link: function($scope,el){      
      el.bind("change", function(e){      
        $scope.file = (e.srcElement || e.target).files[0];
        $scope.getFile();
      })      
    }    
  }
}).directive("ngFileSelectDocs",function(){

  return {
    link: function($scope,el){      
      el.bind("change", function(e){ 
        var id=e.currentTarget.attributes['id'].nodeValue;     
        var doctype=e.currentTarget.attributes['doctype'].nodeValue;   
        $scope.file = (e.srcElement || e.target).files[0];
        var ext = $scope.file.name.split('.').pop();  
        $scope.getFile1(id,doctype,ext);
      })      
    }    
  }
}).directive('pwCheck', [function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = '#' + attrs.pwCheck;
        elem.add(firstPassword).on('keyup', function () {
          scope.$apply(function () {
            var v = elem.val()===$(firstPassword).val();
            ctrl.$setValidity('pwmatch', v);
          });
        });
      }
    }
  }]).directive("ngUnique", function(userService) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {
      element.bind('blur', function (e) {
        if (!ngModel || !element.val()) return;
        var type = attrs.ngUnique;
        console.log(type);
        var currentValue = element.val();
        userService.checkUniqueValue(type, currentValue)
          .then(function (unique) {
            //since the Ajax call was made
            if (currentValue == element.val()) {
              console.log('unique = '+unique);
              ngModel.$setValidity('unique', unique);
              scope.$broadcast('show-errors-check-validity');
            }
          });
      });
    }
  }
}).filter('ctime', function(){

  return function(jsonDate){
    var date='';
    if(jsonDate!=undefined )
    date = parseInt(jsonDate.substr(6));
    return date;
  };

});