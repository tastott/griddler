///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />
import chai = require('chai')
var expect = chai.expect;

import {CellState,CellFillState} from '../griddler/models'

describe('CellState', () => {
	it('Should add group', () => {
		var cs = new CellState();
		cs.Add(0,0);
		cs.Add(1,0);
		
		expect(cs.GetGroups()).to.be.deep.equal([0,1]);
	})
	
	it('Should have unknown fill state when both odd and even groups are present', () => {
		var cs = new CellState();
		cs.Add(0,0);
		cs.Add(1,0);
		
		expect(cs.GetFillState()).to.be.equal(CellFillState.Unknown);
	})
	
	it('Should have empty fill state when only even groups are present', () => {
		var cs = new CellState();
		cs.Add(0,0);
		cs.Add(2,0);
		
		expect(cs.GetFillState()).to.be.equal(CellFillState.Empty);
	})
	
	it('Should have filled fill state when only odd groups are present', () => {
		var cs = new CellState();
		cs.Add(1,0);
		cs.Add(1,1);
		
		expect(cs.GetFillState()).to.be.equal(CellFillState.Filled);
	})
})
