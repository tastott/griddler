///<reference path="typings/angularjs/angular.d.ts" />
///<reference path="typings/angularjs/angular-route.d.ts" />

import hc = require('./controllers/home')

angular.module('griddler', ['ngRoute'])
	.controller('homeController', hc.HomeController)
	.directive('griddler', () => new hc.GriddlerDirective())
	.config(['$routeProvider', ($routeProvider: angular.route.IRouteProvider) => {
	
			$routeProvider.when('/home', {
					templateUrl: 'views/home.html',
					controller: 'homeController'
				})
				.otherwise({
					redirectTo: '/home'
				});
	
		}]);