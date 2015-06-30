'use strict';
// Declare app level module which depends on views, and components
angular.module('myApp', [
        'ui.bootstrap',
        'ui.router',
        'myApp.view1'
    ]).
    config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/view1");
    }]);
