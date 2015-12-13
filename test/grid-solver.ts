///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />
import chai = require('chai')
var expect = chai.expect;

import {CellState, CellFillState} from '../griddler/models'
import {CellResolver} from '../griddler/cell-resolver'
import {GridSolver} from '../griddler/grid-solver'

describe('Grid solver', () => {
	it('Should solve griddler', () => {
		let griddler = require('../gchq-christmas-quiz.json')
		let solver = new GridSolver(griddler);
		var result = solver.Solve();

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

	})

})

