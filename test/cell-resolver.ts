///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />
import chai = require('chai')
var expect = chai.expect;

import {CellState,CellFillState} from '../griddler/models'
import {CellResolver} from '../griddler/cell-resolver'

describe('CellState', () => {
	it('Should initialize first cell with Item 1:0 if line has no slack', () => {
		let sequence = [1,3];
		let resolver = new CellResolver(sequence, 5);
		let expected = new CellState().Add(1,0);
		
		expect(resolver.InitializeLine()[0]).to.be.deep.equal(expected);
	})
	
	it('Should initialize first cell with Items 0:0 and 1:0 if line has slack', () => {
		let sequence = [1,3];
		let resolver = new CellResolver(sequence, 6);
		let expected = new CellState().Add(0,0).Add(1,0);
		
		expect(resolver.InitializeLine()[0]).to.be.deep.equal(expected);
	})
	
	it('Should initialize line correctly', () => {
		let sequence = [1,3];
		let resolver = new CellResolver(sequence, 7);
		let expected = [
			new CellState().Add(0,0).Add(1,0),
			new CellState().Add(0,1).Add(1,0).Add(2,0),
			new CellState().Add(1,0).Add(2,0).Add(2,1).Add(3,0),
			new CellState().Add(2,0).Add(2,1).Add(2,2).Add(3,0).Add(3,1),
			new CellState().Add(2,1).Add(2,2).Add(3,0).Add(3,1).Add(3,2),
			new CellState().Add(2,2).Add(3,0).Add(3,1).Add(3,2).Add(4,0),
			new CellState().Add(3,0).Add(3,1).Add(3,2).Add(4,0).Add(4,1)
		]
		.map((x, i) => ({Index: i, State: x}));
		
		let actual = resolver.InitializeLine().map((x, i) => ({Index: i, State: x}));
		
		expect(actual).to.be.deep.equal(expected);
	})
})