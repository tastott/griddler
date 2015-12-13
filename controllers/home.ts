///<reference path="../typings/angularjs/angular.d.ts" />
import fs = require('fs')
import {GridSolver} from '../griddler/grid-solver'

export interface HomeScope extends ng.IScope {
	Message : string;
}

export class HomeController {
	constructor($scope : HomeScope){
		$scope.Message = 'Welcome to griddler!'
		let griddler = JSON.parse(fs.readFileSync('./butterfly.json', 'utf8'))
		let solver = new GridSolver(griddler);
		solver.Solve();
	}
}