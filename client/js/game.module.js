(function () {
    "use strict";

    angular.module('game', ['ui.router'])
        .config(config)
        .constant('socket', io('http://localhost:3000'));

    config.$inject = ['$urlRouterProvider'];
    function config($urlRouterProvider) {
        // If user goes to a path that doesn't exist, redirect to public root
        $urlRouterProvider.otherwise('/');
    }
})();