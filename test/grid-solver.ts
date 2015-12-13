///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />
import chai = require('chai')
var expect = chai.expect;

import {CellState, CellFillState} from '../griddler/models'
import {CellResolver} from '../griddler/cell-resolver'
import {GridSolver} from '../griddler/grid-solver'

describe('Grid solver', () => {
	it('Should solve griddler', () => {
		let griddler = require('../butterfly.json')
		let solver = new GridSolver(griddler);
		solver.Solve();
	})

})

