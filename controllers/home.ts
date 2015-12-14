///<reference path="../typings/angularjs/angular.d.ts" />
import {CellFillState} from '../griddler/models'
import {GridSolver} from '../griddler/grid-solver'

export interface HomeScope extends ng.IScope {
	Message : string;
}

export class HomeController {
	constructor($scope : HomeScope){
		$scope.Message = 'Welcome to griddler!'
		let griddler = require('../butterfly.json')
		let solver = new GridSolver(griddler);
		let result = solver.Solve();
		for (var y = 0; y < result[0].length; y++) {
			var row: string[] = [];
			for (var x = 0; x < result.length; x++) {
				switch(result[x][y]){
					case CellFillState.Unknown:
						row.push('?'); break;
					case CellFillState.Empty:
						row.push(' '); break;
					case CellFillState.Filled:
						row.push('X'); break;
				}
			}
			
			console.log(row.join(''));
		}
	}
}