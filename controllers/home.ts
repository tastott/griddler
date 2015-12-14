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
		$scope.puzzle = require('../gchq-christmas-quiz.json')
	}
}

export interface GriddlerDirectiveScope extends ng.IScope {
	puzzle: Griddler
}

export class GriddlerDirective implements ng.IDirective {

    public scope = {
       	puzzle: '='
    }

	private drawClues($element: JQuery, clues: number[][], horizontal: boolean) {
		//Find longest clue
		let longestClue = clues.reduce((previous, current) => {
			return previous.length > current.length ? previous : current
		}, []);
		
		//Draw table
		let $table = $('<table></table>')
			.appendTo($element)
			.addClass('clues');
			
		let rows = horizontal ? clues.length : longestClue.length;
		let columns = horizontal ? longestClue.length : clues.length;
		
		for(let row = 0; row < rows; row++){
			let $row = $('<tr></tr>').appendTo($table);
			for(let column = 0; column < columns; column++){
				let $cell = $('<td></td>').appendTo($row)
					.addClass('cell');
			
				let clue = horizontal
					? clues[row][clues[row].length - longestClue.length + column]
					: clues[column][clues[column].length - longestClue.length + row];
				if(clue !== undefined) $cell.text(clue);
				
			}
		}
		
	}
	
    public link = ($scope: GriddlerDirectiveScope, element: JQuery, attributes: ng.IAttributes) => {

		if($scope.puzzle) {
			let solver = new GridSolver($scope.puzzle);
			let result = solver.Solve();
		
			let $container = $('<table></table>').appendTo(element);
			let $containerTopRow = $('<tr></tr>').appendTo($container);
			let $containerBottomRow = $('<tr></tr>').appendTo($container);
		
			let $controlArea = $('<td></td>').appendTo($containerTopRow);
		
			this.drawClues($('<td></td>').appendTo($containerTopRow), $scope.puzzle.columns, false);
			this.drawClues($('<td></td>').appendTo($containerBottomRow), $scope.puzzle.rows, true);
			
			let $grid = $('<table></table>')
				.appendTo($('<td></td>').appendTo($containerBottomRow))
				.addClass('grid');
				
			$scope.puzzle.rows.forEach((row, rIndex) => {
				let $row = $('<tr></tr>').appendTo($grid);
				$scope.puzzle.columns.forEach((column, cIndex) => {
					$('<td></td>').appendTo($row)
						.addClass('cell')
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