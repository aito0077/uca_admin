(function () {
    'use strict';


    angular.module('app')
        .config(['$stateProvider', '$urlRouterProvider', '$authProvider', 'api_host', function($stateProvider, $urlRouterProvider, $authProvider, api_host, $state) {
            var routes, setRoutes;

            routes = [
                'uca/activities/list',
                'uca/pages/list',
                'uca/organizations/list',
                'uca/sliders/list',
                'uca/users/list',
                'uca/users/edit'
            ];

            setRoutes = function(route) {
                var config, url;
                url = '/' + route;
                config = {
                    url: url,
                    templateUrl: 'views/' + route + '.html',
                    resolve: {
                        loginRequired: loginRequired
                    }

                };
                $stateProvider.state(route, config);

                return $stateProvider;
            };

            routes.forEach(function(route) {
                return setRoutes(route);
            });


            $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/uca/account/signin.html',
                resolve: {
                    skipIfLoggedIn: skipIfLoggedIn
                }
            })
            .state('home', {
                url: '/',
                templateUrl: 'views/dashboard.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'views/dashboard.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('user-view', {
                url: '/user-view/:userId',
                templateUrl: 'views/uca/users/view.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('page-new', {
                url: '/page-new',
                templateUrl: 'views/uca/pages/edit.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('page-edit', {
                url: '/page-edit/:pageId',
                templateUrl: 'views/uca/pages/edit.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })

            .state('activity-new', {
                url: '/activity-new/:type/:id',
                templateUrl: 'views/uca/activities/edit.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('activity-edit', {
                url: '/activity-edit/:activityId',
                templateUrl: 'views/uca/activities/edit.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('activity-view', {
                url: '/activity-view/:activityId',
                templateUrl: 'views/uca/activities/view.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })



            .state('organization-new', {
                url: '/organization-new',
                templateUrl: 'views/uca/organizations/edit.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('organization-edit', {
                url: '/organization-edit/:organizationId',
                templateUrl: 'views/uca/organizations/edit.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('organization-view', {
                url: '/organization-view/:organizationId',
                templateUrl: 'views/uca/organizations/view.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('signin', {
                url: '/signup',
                templateUrl: 'views/uca/account/signup.html',
                resolve: {
                    skipIfLoggedIn: skipIfLoggedIn
                }
            });

            $urlRouterProvider
                //.when('/', '/dashboard')
                .otherwise('/login');

            function skipIfLoggedIn($q, $auth) {
                var deferred = $q.defer();
                if ($auth.isAuthenticated()) {
                    deferred.reject();
                } else {
                    deferred.resolve();
                }
                return deferred.promise;
            }

            function loginRequired($q, $location, $state, $auth) {
                var deferred = $q.defer();
                if ($auth.isAuthenticated()) {
                    deferred.resolve();
                } else {
                    //$state.go('login');
                    $location.path('/login');
                }
                return deferred.promise;
            }

            //Satellizer
            $authProvider.baseUrl = api_host+'/';
            $authProvider.httpInterceptor = true;
            $authProvider.signupRedirect = null;

        

        }]
    );

})(); 
