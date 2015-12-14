///<reference path="../typings/angularjs/angular.d.ts" />
import {CellFillState, Griddler} from '../griddler/models'
import {GridSolver} from '../griddler/grid-solver'
import $ = require('jquery')

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
		
			let $table = $('<table></table>').appendTo(element);
			$scope.puzzle.rows.forEach((row, rIndex) => {
				let $row = $('<tr></tr>').appendTo($table);
				$scope.puzzle.columns.forEach((column, cIndex) => {
					$('<td></td>').appendTo($row)
						.attr('id', `${cIndex}-${rIndex}`);
				})
			})
		
			for (var y = 0; y < result[0].length; y++) {
				let cssClass: string;
				for (var x = 0; x < result.length; x++) {
					switch(result[x][y]){
						case CellFillState.Unknown:
							cssClass = 'fill-state-unknown'; break;
						case CellFillState.Empty:
							cssClass = 'fill-state-empty'; break;
						case CellFillState.Filled:
							cssClass = 'fill-state-filled'; break;
					}
					
					$(`#${x}-${y}`).addClass(cssClass);
				}
			}
		}
		
		
        
    }
}