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

	private puzzle: Griddler;
	private $element: JQuery;
	
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
		this.$element = $(element);
		
		element.html('');
		this.puzzle = $scope.puzzle;

		if($scope.puzzle) {
			
			
			let $container = $('<table></table>').appendTo(element);
			let $containerTopRow = $('<tr></tr>').appendTo($container);
			let $containerBottomRow = $('<tr></tr>').appendTo($container);
		
			let $controlArea = $('<td></td>').appendTo($containerTopRow);
			$('<button>Solve</button>').appendTo($controlArea)
				.click(() => this.Solve());
				
			$('<button>Solve in slo-mo</button>').appendTo($controlArea)
				.click(() => this.Solve(true));
		
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
		}
	}
	
	private Solve(slomo: boolean = false) {
		
		this.$element.find('table.grid td.cell').each(function() {
			$(this).removeClass('fill-state-filled')
				.removeClass('fill-state-empty')
		})
		
		let solvedCells: {x:number;y:number;filled:boolean}[] = [];
		let solver = new GridSolver(this.puzzle, 
			(x,y,filled) => {
				solvedCells.push({x: x, y: y, filled: filled});
			});
		
		solver.Solve();
		
		let interval = 25;
		
		function showNextSolvedCell(){
			if(solvedCells.length){
				let cell = solvedCells.shift();
				let fillCell = () => {
					$(`#${cell.x}-${cell.y}`).addClass(cell.filled ? 'fill-state-filled' : 'fill-state-empty');
					showNextSolvedCell();
				};
				
				if(slomo) setTimeout(fillCell, interval);
				else fillCell();
			}
		}
		
		showNextSolvedCell();
    }
}