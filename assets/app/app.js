(function () {

    'use strict';

    angular
    .module('myApp', [
    'ui.router','ui.bootstrap','ui.bootstrap.modal','ui.bootstrap.datepicker',
    'httpi','datatables','ngAnimate','toastr', 'ngCookies','ngLodash','angularMoment',
    'angular-loading-bar','chart.js','angularUtils.directives.dirPagination','validation.match','flow',
    'ngFileUpload','ngMap','decipher.tags', 'ui.bootstrap.typeahead'
    ])
    .config(config)
    .run(run);

    config.$inject = ['$stateProvider', '$urlRouterProvider','$locationProvider','cfpLoadingBarProvider'];

    function config($stateProvider, $urlRouterProvider,$locationProvider,cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;

    	$locationProvider.hashPrefix('');

        $urlRouterProvider.otherwise("/userDashboard");

        // Now set up the states
        $stateProvider

        .state('userDashboard', {
            url: '/userDashboard',
            templateUrl: 'app/views/dashboard/userDashboard.html',
            controller:'userDashboardController',
            controllerAs:'vm',
            resolve:{
                getTop3ReviewsResolve:function(userDashboardServices){
                    return userDashboardServices.getTop3Reviews();
                },
                getTop3BusinessResolve:function(userDashboardServices){
                    return userDashboardServices.getTop3Business();
                },
                getStatesTagResolve:function(userDashboardServices){
                    return userDashboardServices.getStatesTagResolve();
                }
            }
        })

        .state('profile',{
            url: '/profile?id',
            templateUrl: 'app/views/user/profilePage.html',
            controller:'userController',
            controllerAs:'vm',
            resolve:{
                getUser:function(userServices,$stateParams){
                    return userServices.getUserDetails($stateParams.id);
                },

                getTopTagsResolve:function(userServices,$stateParams){
                    return userServices.getTopTagsResolve($stateParams.id);
                },

                getUserAnalyticsResolve:function(userServices,$stateParams){
                    return userServices.getUserAnalyticsResolve($stateParams.id);
                }
            }
        })

        .state('forgetPassword',{
            url: '/forgetPassword',
            templateUrl: 'app/views/user/forgetPassword.html',
            controller:'forgetPasswordController',
            controllerAs:'vm'
        })

        .state('login',{
            url: '/login',
            templateUrl: 'app/views/user/loginPage.html',
            controller:'loginController',
            controllerAs:'vm'
        })

        .state('businessDashboard',{
            url: '/businessDashboard',
            templateUrl: 'app/views/dashboard/businessDashboardPage.html',
            controller:'businessDashboardController',
            controllerAs:'vm',
            resolve:{
                getBusinessesDashboardResolve:function(businessDashboardService){
                    return businessDashboardService.getBusinesses();
                }
            }
        })

        .state('settings',{
            url: '/settings',
            templateUrl: 'app/views/user/settings.html',
            controller:'settingsController',
            controllerAs:'vm',
            resolve:{
                userDetailsSettingsResolve:function(userServices){
                    return userServices.userDetailsSettings();
                },
                getStatesResolve:function(userServices){
                    return userServices.getStateDetails();
                }
            } 
        })

        .state('businessPage',{
            url: '/businessPage?id',
            templateUrl: 'app/views/business/business.html',
            controller:'businessController',
            controllerAs:'vm',
            resolve:{
                basicBusinessDataResolve:function(businessService,$stateParams){
                    return businessService.basicBusinessDetails($stateParams.id);
                },

                basicBusinessReviewResolve:function(businessService,$stateParams){
                    return businessService.getBusinessReviewsForResolve($stateParams.id);
                },

                basicBusinessDataTagResolve:function(businessService,$stateParams){
                    return businessService.basicBusinessDetailsTagResolve($stateParams.id);
                },

                firstReviewerResolve:function(businessService,$stateParams){
                    return businessService.firstReviewerResolve($stateParams.id);
                },

                reviewDistributionResolve:function(businessService,$stateParams){
                    return businessService.reviewDistributionResolve($stateParams.id);
                }
            } 
        })

        .state('writeReview',{
            url: '/writeReview?id',
            templateUrl: 'app/views/user/writeReview.html',
            controller:'reviewController',
            controllerAs:'vm',
            resolve:{
                basicBusinessDataResolve:function(businessService,$stateParams){
                    return businessService.basicBusinessDetails($stateParams.id);
                },

                basicBusinessReviewWithLimitResolve:function(businessService,$stateParams){
                    return businessService.basicBusinessReviewWithLimitResolve($stateParams.id);
                },

                basicBusinessDataTagResolve:function(businessService,$stateParams){
                    return businessService.basicBusinessDetailsTagResolve($stateParams.id);
                },
            } 
        })

        .state('search',{
            url: '/search?FindDesc&Tag&City&State&PriceRange&orderBy',
            templateUrl: 'app/views/user/searchPage.html',
            controller:'searchController',
            controllerAs:'vm',
            resolve:{
                getSearchDetailsResolve:function(businessService,$stateParams){
                    return businessService.getSearchDetailsResolve($stateParams);
                }
            } 
        })

        .state('businessMetrics',{
            url: '/businessMetrics?id&name',
            templateUrl: 'app/views/business/businessMetrics.html',
            controller:'businessMetricsController',
            controllerAs:'vm',
            resolve:{
                getBusinessAnalyticsResolve:function(businessService,$stateParams){
                    return businessService.getBusinessAnalyticsResolve($stateParams.id,$stateParams.name);
                }
            } 

        })

        .state('signup',{
            url: '/signup',
            templateUrl: 'app/views/user/signup.html',
            controller:'signupController',
            controllerAs:'vm',
            resolve:{
                getRolesResolve:function(userServices){
                    return userServices.getRolesResolve();
                },

                getStatesResolveSignUp:function(userServices){
                    return userServices.getStateDetails();
                }
            } 
        })

    }

    run.$inject = ['$rootScope', '$cookieStore', '$http', '$location','$state','authenticationService','$localStorage','$window'];

    function run($rootScope, $cookieStore,$http,$location,$state,authenticationService,$localStorage,$window) {
        //$rootScope.globals = $cookieStore.get('globals') || {};
        //Hardcoded the User id over here

        //  $http.defaults.headers.common['content-type'] = 'application/json';
        //  $http.defaults.headers.common['id'] = 10001235;
        //  $http.defaults.headers.common['token'] = 12345678;   

        //  $rootScope.$on('$stateChangeError', 
        //        function(event, toState, toParams, fromState, fromParams, error){ 
        // this is required if you want to prevent the $UrlRouter reverting the URL to the previous valid location
        //        event.preventDefault();

        $rootScope.globals = $cookieStore.get('globals') || {};
        console.log($state.current);
        console.log($rootScope.globals.currentUser);
        if ($rootScope.globals.currentUser) {
                $http.defaults.headers.common['id'] = $rootScope.globals.currentUser.user.UserId;
                $http.defaults.headers.common['token'] = $rootScope.globals.currentUser.user.token;
                $http.defaults.headers.common['content-type'] = 'application/json';
        }

        $rootScope.$auth = authenticationService;

        $rootScope.isAuthenticated = authenticationService.IsAuthenticated();

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            var restrictedRoutes = ['/login','/forgetPassword','/signup'];
            var restrictedPage = $.inArray($location.path(), restrictedRoutes) === -1;
            console.log(next.split("#/"));
            if($location.path()==""){

            }else if (restrictedPage && (_.isEmpty($localStorage.getObject('user')))) {
                $location.path('/login');
             }else if (!(_.isEmpty($localStorage.getObject('user')))) {
                   
                   if(next.split("#/").length>1 && next.split("#/")[1]=="login" && !(_.isEmpty($localStorage.getObject('user')))){
                        //$location.path('/userDashboard');
                        $state.go('userDashboard');
                   }else if(next.split("#/")[1]==""){
                       $state.go('userDashboard');
                   }else if(next.split("#/").length==1){
                       //$location.path('/userDashboard');
                       $state.go('userDashboard');
                   }else if(next.split("#/").length>1){
                        $window.location.href=next;
                        // if(next.split("#/")[1].split("?").length>1){
                        //      $location.path(next.split("#/")[1]);
                        // }else{
                        //     $state.go(next.split("#/")[1]);
                        // }
                        
                   }else if(next=="http://localhost:1337/" || next=="http://localhost:1337"){
                        $state.go('userDashboard');
                   }
             }
        });
      }; 
    })();