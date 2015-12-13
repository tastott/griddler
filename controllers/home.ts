///<reference path="../typings/angularjs/angular.d.ts" />
import fs = require('fs')

export interface HomeScope extends ng.IScope {
	Message : string;
	Griddler:string;
}

export class HomeController {
	constructor($scope : HomeScope){
		$scope.Message = 'Welcome to griddler!'
		$scope.Griddler = fs.readFileSync('./gchq-christmas-quiz.json', 'utf8')
	}
}