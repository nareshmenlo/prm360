//prmApp.constant('domain','http://prm360.com/services/');
prmApp.constant('domain','PRMService.svc/REST/');
prmApp.constant('version','v1');
prmApp.constant('signalR', '~');
prmApp.constant('signalRHubName', 'requirementHub');

prmApp.run(function (store, $rootScope,userService,$state) {
        $rootScope.fieldsLoaded = false;
        //$state.go('login');
        $rootScope.$on('$stateChangeStart',function(e, to,toparm, from, fromParam) {
            /*if (to.name === "login" && store.get('sessionid') && store.get('verified')) {
                e.preventDefault();
                $state.go('home');
            }       
            if (to.name === "login" && store.get('sessionid') && !store.get('verified')) {
                e.preventDefault();
                $state.go('login');
            }*/
            /*if(!store.get('emailverified')){
                store.set('verified', 0);
            }*/

            if(to.name != 'resetpassword'){
                if(to.name === 'login'){
                    if(store.get('sessionid')){
                        if(userService.getUserId() != null){
                            if(store.get('verified') && store.get('credverified') && store.get('emailverified')){
                                $state.go('home');
                            } else {          
                                e.preventDefault();              
                                $state.go('pages.profile.profile-about');
                                swal("Warning", "Please verify your Credential documents/OTP", "warning");
                            } 
                        }
                    }
                }else if (to.name === 'pages.profile.profile-about'){
                    if(store.get('sessionid') && userService.getUserId() != null){

                    } else {
                        e.preventDefault();
                        $state.go('login');
                    }
                }else{
                    if(store.get('sessionid') && userService.getUserId() != null){
                        if(store.get('verified') && store.get('credverified') && store.get('emailverified')){

                        } else {
                            e.preventDefault();
                            $state.go('pages.profile.profile-about');
                            swal("Warning", "Please verify your Credential documents/OTP", "warning");
                        }
                    }else{
                        e.preventDefault();
                        $state.go('login');
                    }
                }
            }
            
            /*if(to.name !== 'login'){
                if(store.get('sessionid')){
                    if(store.get('verified')){
                        $state.go('home');
                    } else {
                        $state.go('pages.profile.profile-about');
                    }
                } else {
                    $state.go('home');
                }
            }*/
        }); 
    });
    
    prmApp.directive('errSrc', function() {
      return {
        link: function(scope, element, attrs) {
          element.bind('error', function() {
            if (attrs.src != attrs.errSrc) {
              attrs.$set('src', attrs.errSrc);
            }
          });
          attrs.$observe('ngSrc', function(value) {
            if (!value && attrs.errSrc) {
              attrs.$set('src', attrs.errSrc);
            }
          });
        }
      }
    });

prmApp
    .config(function ($stateProvider, $urlRouterProvider,$httpProvider, $provide,domain,version){
        $urlRouterProvider.otherwise('/login');

        $provide.factory('httpInterceptor', function($q,$injector,store,$rootScope) {
            return {
                'request': function(config) {
                  if(store.get('sessionid') && store.get('verified') && store.get('emailverified')){
                    config.headers['X-AUTHORIZATION'] = store.get('sessionid');
                  }
                  if(config.url.indexOf('v/') == 0){
                        config.url = domain+config.url.replace("v/",version);
                  }
                  return config;
                },
                'response': function(response) {
                    
                    if(response.data.error && response.data.message == "Unauthorized"){
                        store.remove('sessionid');
                        store.remove('verified');
                        location.reload();
                    }
                    return response;
                }
            };
        });
        $httpProvider.interceptors.push('httpInterceptor');
        $httpProvider.defaults.useXDomain = true;
        //delete $httpProvider.defaults.headers.common['X-Requested-With'];
        
        //added by Nikhil
        //$httpProvider.defaults.headers.common = {};
        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $httpProvider.defaults.headers.patch = {};

        $stateProvider
        
            //------------------------------
            // HOME
            //------------------------------

            .state ('home', {
                url: '/home',
                templateUrl: 'views/home.html',
                 onEnter: function (store,$state) {
                   //console.log('entry');
                   if(store.get('sessionid') && store.get('verified') && store.get('emailverified')){
                        //console.log('verified user');          
                   }else{                        
                        $state.go('pages.profile.profile-about');
                        swal("Warning", "Please verify your Credential documents/OTP", "warning"); 
                   }
                },
                onExit: function () {
                //write code when you change state
                //console.log('exit');
                },
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/fullcalendar/dist/fullcalendar.min.css',
                                ]
                            },
                            {
                                name: 'vendors',
                                insertBefore: '#app-level-js',
                                files: [
                                    'vendors/sparklines/jquery.sparkline.min.js',
                                    'vendors/bower_components/jquery.easy-pie-chart/dist/jquery.easypiechart.min.js',
                                    'vendors/bower_components/simpleWeather/jquery.simpleWeather.min.js'
                                ]
                            }
                        ])
                    }
                }
            })

        
            //------------------------------
            // FORMS
            //------------------------------
            .state ('form', {
                url: '/form',
                templateUrl: 'views/common.html'
            })


            /*.state ('subuser', {
                url: '/subuser',
                templateUrl: 'views/resetpassword.html'
            })*/


            .state ('resetpassword', {
                url: '/resetpassword/:email/:sessionid',
                templateUrl: 'views/resetpassword-1.html',

                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css',
                                    'vendors/bower_components/summernote/dist/summernote.css',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js',
                                    'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                    'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                                ]
                            }
                        ])
                    }
                }
            })





            //------------------------------
            // login
            //------------------------------
            .state ('login', {
                url: '/login',
                templateUrl: 'js/login/login1.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css',
                                    'vendors/bower_components/summernote/dist/summernote.css',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js',
                                    'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                    'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'                                
                                ]
                            }
                        ])
                    }
                }
            })


            .state('termsandconditions', {
                url: '/termsandconditions',
                templateUrl: 'js/login/termsConditions.html'
            })

            
            //------------------------------
            // CHARTS
            //------------------------------
            
            .state ('charts', {
                url: '/charts',
                templateUrl: 'views/common.html'
            })

            .state ('charts.flot-charts', {
                url: '/flot-charts',
                templateUrl: 'views/flot-charts.html',
            })
        
            //------------------------------
            // CALENDAR
            //------------------------------
            
            .state ('calendar', {
                url: '/calendar',
                templateUrl: 'views/calendar.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/fullcalendar/dist/fullcalendar.min.css',
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/fullcalendar/dist/fullcalendar.min.js'
                                ]
                            }
                        ])
                    }
                }
            })
        
        
           
            
            //------------------------------
            // PAGES
            //------------------------------
            
            .state ('pages', {
                url: '/pages',
                templateUrl: 'views/common.html'
            })
            
        
            //Profile
        
            .state ('pages.profile', {
                url: '/profile',
                templateUrl: 'views/profile.html'
            })
        
            .state ('pages.profile.profile-about', {
                url: '/profile-about',
                templateUrl: 'views/profile-about.html'
            })

            .state ('pages.profile.profile-timeline_SubUsers', {
                url: '/timeline_SubUsers',
                templateUrl: 'views/profile-timeline_SubUsers.html',
                onEnter: function (store,$state) {
                   //console.log('entry');
                   if(store.get('sessionid') && store.get('verified') && store.get('emailverified')){
                        //console.log('verified user');          
                   }else{                                               
                        $state.go('pages.profile.profile-about');
                        swal("Warning", "Please verify your Credential documents/OTP", "warning");  
                   }
                }
            })
        
            .state ('pages.profile.profile-timeline', {
                url: '/profile-timeline',
                templateUrl: 'views/profile-timeline.html',
                onEnter: function (store,$state) {
                   //console.log('entry');
                   if(store.get('sessionid') && store.get('verified') && store.get('emailverified')){
                        //console.log('verified user');          
                   }else{                                               
                        $state.go('pages.profile.profile-about');
                        swal("Warning", "Please verify your Credential documents/OTP", "warning");  
                   }
                },
                onExit: function () {
                //write code when you change state
                //console.log('exit');
                },
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/lightgallery/light-gallery/css/lightGallery.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/bower_components/lightgallery/light-gallery/js/lightGallery.min.js'
                                ]
                            }
                        ])
                    }
                }
            })



            .state ('pages.profile.profile-timeline_1', {
                url: '/profile-timeline_1',
                templateUrl: 'views/profile-timeline_1.html',
                onEnter: function (store,$state) {
                   //console.log('entry');
                   if(store.get('sessionid') && store.get('verified') && store.get('emailverified')){
                        //console.log('verified user');          
                   }else{                                               
                        $state.go('pages.profile.profile-about');
                        swal("Warning", "Please verify your Credential documents/OTP", "warning");  
                   }
                },
                onExit: function () {
                //write code when you change state
                //console.log('exit');
                },
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/lightgallery/light-gallery/css/lightGallery.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/bower_components/lightgallery/light-gallery/js/lightGallery.min.js'
                                ]
                            }
                        ])
                    }
                }
            })






            .state ('pages.profile.requirement-comments', {
                url: '/requirement-comments',
                templateUrl: 'views/requirementcomments.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/lightgallery/light-gallery/css/lightGallery.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/bower_components/lightgallery/light-gallery/js/lightGallery.min.js'
                                ]
                            }
                        ])
                    }
                }
            })

           
            //------------------------------
            // BREADCRUMB DEMO
            //------------------------------
            .state ('breadcrumb-demo', {
                url: '/breadcrumb-demo',
                templateUrl: 'views/breadcrumb-demo.html'
            })

            //--CUSTOME STATES
            //----New requirement 
            .state ('form.addnewrequirement', {
                url: '/addnewrequirement/:Id',
                templateUrl: 'views/addnewrequirement.html',
                onEnter: function (store,$state) {
                   //console.log('entry');
                   if(store.get('sessionid') && store.get('verified') && store.get('emailverified')){
                        //console.log('verified user');          
                   }else{
                         
                        $state.go('pages.profile.profile-about');
                        swal("Warning", "Please verify your Credential documents/OTP", "warning");  
                   }
                },
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css',
                                    'vendors/bower_components/summernote/dist/summernote.css',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js',
                                    'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                    'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                                ]
                            }
                        ])
                    }
                }
            })

            //---Reports
            .state ('charts.reports', {
                url: '/reports',
                templateUrl: 'views/flot-charts.html',
            })

            //---suppport

            //--myaccount
            .state ('pages.profile.myaccount', {
                url: '/myaccount',
                templateUrl: 'views/profile-about.html'
            })


            //View Profile

            /*.state ('pages.profile.viewprofile', {
                url: '/viewprofile',
                templateUrl: 'views/view-profile.html'
            })*/


            .state('viewProfile',{
                url: '/viewprofile/:Id',
                templateUrl: 'views/viewProfile.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css',
                                    'vendors/bower_components/summernote/dist/summernote.css',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js',
                                    'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                    'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                                ]
                            }
                        ])
                    }
                }
            })
            





             .state('bidhistory', {
                 url: '/bidhistory/:Id/:reqID',
                 templateUrl: 'views/bidHistory.html',
                 resolve: {
                     loadPlugin: function ($ocLazyLoad) {
                         return $ocLazyLoad.load([
                             {
                                 name: 'css',
                                 insertBefore: '#app-level',
                                 files: [
                                     'vendors/bower_components/nouislider/jquery.nouislider.css',
                                     'vendors/farbtastic/farbtastic.css',
                                     'vendors/bower_components/summernote/dist/summernote.css',
                                     'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                     'vendors/bower_components/chosen/chosen.min.css'
                                 ]
                             },
                             {
                                 name: 'vendors',
                                 files: [
                                     'vendors/input-mask/input-mask.min.js',
                                     'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                     'vendors/bower_components/moment/min/moment.min.js',
                                     'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                     'vendors/bower_components/summernote/dist/summernote.min.js',
                                     'vendors/fileinput/fileinput.min.js',
                                     'vendors/bower_components/chosen/chosen.jquery.js',
                                     'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                     'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                                 ]
                             }
                         ])
                     }
                 }
             })






            .state ('ui-bootstrap', {
                url: '/ui-bootstrap',
                templateUrl: 'views/ui-bootstrap.html'
            })

            .state('view-requirement',{
                url: '/view-requirement/:Id',
                templateUrl: 'views/list-item.html',
                onEnter: function (store,$state) {
                   //console.log('entry');
                   if(store.get('sessionid') && store.get('verified') && store.get('emailverified')){
                        //console.log('verified user');          
                   }else{
                        $state.go('login');   
                   }
                },
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css',
                                    'vendors/bower_components/summernote/dist/summernote.css',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js',
                                    'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                    'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                                ]
                            }
                        ])
                    }
                }
            })


            .state ('Meterial-Dispatchment', {
                url: '/Meterial-Dispatchment',
                templateUrl: 'Meterial-Dispatchment.html'
            })

            .state('generate-po',{
                url: '/generate-po/:Id',
                templateUrl: 'views/POForm.html',
                onEnter: function (store,$state) {
                   //console.log('entry');
                   if(store.get('sessionid') && store.get('verified') && store.get('emailverified')){
                        //console.log('verified user');          
                   }else{
                        $state.go('login');   
                   }
                },
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css',
                                    'vendors/bower_components/summernote/dist/summernote.css',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js',
                                    'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                    'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                                ]
                            }
                        ])
                    }
                }
            })

            .state('material-dispatchment',{
                url: '/material-dispatchment/:Id',
                templateUrl: 'views/Material-Dispatchment.html',
                onEnter: function (store,$state) {
                   //console.log('entry');
                   if(store.get('sessionid') && store.get('verified') && store.get('emailverified')){
                        //console.log('verified user');          
                   }else{
                        $state.go('login');   
                   }
                },
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css',
                                    'vendors/bower_components/summernote/dist/summernote.css',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js',
                                    'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                    'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                                ]
                            }
                        ])
                    }
                }
            })

            .state('payment-details',{
                url: '/payment-details/:Id',
                templateUrl: 'views/payment-details.html',
                onEnter: function (store,$state) {
                   //console.log('entry');
                   if(store.get('sessionid') && store.get('verified') && store.get('emailverified')){
                        //console.log('verified user');          
                   }else{
                        $state.go('login');   
                   }
                },
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css',
                                    'vendors/bower_components/summernote/dist/summernote.css',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js',
                                    'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                    'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                                ]
                            }
                        ])
                    }
                }
            })

            .state('view-requirement-test',{
                url: '/view-requirement-test/:Id',
                templateUrl: 'views/list-item-new.html',

            })
            .state ('form.editrequirement', {
                url: '/editrequirement/:Id',
                templateUrl: 'views/addnewrequirement.html',
                onEnter: function (store,$state) {
                   //console.log('entry');
                   if(store.get('sessionid') && store.get('verified') && store.get('emailverified')){
                        //console.log('verified user');          
                   }else{
                        $state.go('login');   
                   }
                },
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css',
                                    'vendors/bower_components/summernote/dist/summernote.css',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js',
                                    'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                    'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                                ]
                            }
                        ])
                    }
                }
            })
            .state('view-order',{
                url: '/view-order',
                templateUrl: 'views/my-order.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css',
                                    'vendors/bower_components/summernote/dist/summernote.css',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js',
                                    'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                    'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                                ]
                            }
                        ])
                    }
                }
            })
        
    });
