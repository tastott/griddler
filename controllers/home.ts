///<reference path="../typings/angularjs/angular.d.ts" />
import {CellFillState, Griddler} from '../griddler/models'
import {GridSolver} from '../griddler/grid-solver'

export interface HomeScope extends ng.IScope {
	Message : string;
	puzzle: Griddler;
}

export class HomeController {
	constructor($scope : HomeScope){
		$scope.Message = 'Welcome to griddler!'
		$scope.puzzle = require('../butterfly.json')
	}
}

export interface GriddlerDirectiveScope extends ng.IScope {
	puzzle: Griddler
}

export class GriddlerDirective implements ng.IDirective {

    public scope = {
       	puzzle: '='
    }

    public link($scope: GriddlerDirectiveScope, element: JQuery, attributes: ng.IAttributes) {

		if($scope.puzzle) {
			let solver = new GridSolver($scope.puzzle);
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
}