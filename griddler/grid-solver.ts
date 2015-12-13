import {Griddler, CellState, CellFillState} from './models'
import {CellResolver} from './cell-resolver'
let deepEqual = require('deep-equal')

interface GridLine {
	Resolver: CellResolver;
	Cells: CellState[];
}

enum Axis {
	Horizontal,
	Vertical
}

enum ReevaluationDirection {
	Forwards,
	Backwards
}

class Coordinates {
	constructor(public Axis: Axis, public A: number, public B: number){
		
	}
	
	Rotate(): Coordinates {
		return new Coordinates(this.Axis == Axis.Horizontal ? Axis.Vertical : Axis.Horizontal,
			this.B,
			this.A
		);
	}
	
	Increment(direction: ReevaluationDirection): Coordinates {
		let nextIndex = this.A + (direction == ReevaluationDirection.Forwards ? 1 : -1);
		return new Coordinates(this.Axis, nextIndex, this.B);
	}
}

interface QueueItem {
	Coordinates: Coordinates;
	Direction?: ReevaluationDirection;
}

export class GridSolver {

	private rows: GridLine[];
	private columns: GridLine[];

	private queue: QueueItem[];

	constructor(griddler: Griddler) {
		this.columns = this.InitializeLines(griddler.columns, griddler.rows.length);
		this.rows = this.InitializeLines(griddler.rows, griddler.columns.length);
		this.queue = [];
		
		//To begin with, all lines need to be back-solved from the last cell
		this.columns.forEach((column, colIndex) => {
			this.queue.push({
				Coordinates: new Coordinates(Axis.Vertical,
					griddler.rows.length - 1,
					colIndex
				),
				Direction: ReevaluationDirection.Backwards
			})
			
			//Reevaluate in other axis if fill state is known already
			let fillState: CellFillState;
			if((fillState = column.Cells.slice(-1)[0].GetFillState()) != CellFillState.Empty){
				
			}
		})

		this.rows.forEach((row, rowIndex) => {
			this.queue.push({
				Coordinates: new Coordinates(Axis.Horizontal,
					rowIndex,
					griddler.columns.length - 1
				),
				Direction: ReevaluationDirection.Backwards
			})
		})
	}

	private InitializeLines(sequences: number[][], lineLength: number): GridLine[] {
		return sequences.map(lineSequence => {
			var resolver = new CellResolver(lineSequence, lineLength);
			var cells = resolver.InitializeLine();
			return {
				Resolver: resolver,
				Cells: cells
			}
		})
	}

	public Solve() {
		while (this.queue.length) {
			let nextItem = this.queue.shift();
			let newItems = this.ProcessQueueItem(nextItem);
			newItems.forEach(x => this.queue.push(x));
		}
	}

	private GetCell(coordinates: Coordinates): { Cell: CellState; Resolver: CellResolver } {

		let lines = coordinates.Axis == Axis.Horizontal ? this.rows : this.columns;
		let line = lines[coordinates.B];
		
		//Cell doesn't exist
		if (coordinates.A < 0 || coordinates.A >= line.Cells.length) return null;

		return {
			Cell: line.Cells[coordinates.A],
			Resolver: line.Resolver
		};
	}

	private ProcessQueueItem(item: QueueItem): QueueItem[] {
		//Get next cell, return early if we've reached the end of the line
		var nextCoords = item.Coordinates.Increment(item.Direction);
		var nextCell = this.GetCell(item.Coordinates);
		if (!nextCell) return [];
		
		//Reevaluate next cell
		var thisCell = this.GetCell(item.Coordinates);
		var nextCellNewState = nextCell.Resolver.ReevaluateCell(nextCell.Cell, thisCell.Cell, item.Direction == ReevaluationDirection.Forwards);
		
		//Continue re-evaluation if state has changed
		if (!deepEqual(nextCell.Cell, nextCellNewState)) {
			let newItems: QueueItem[] = [{
				Coordinates: nextCoords,
				Direction: item.Direction
			}];
				
			//Reevaluate in other axis if fill state has changed
			let newFillState: CellFillState;
			if (nextCell.Cell.GetFillState() == CellFillState.Unknown
				&& (newFillState = nextCellNewState.GetFillState()) != CellFillState.Unknown) {
				let otherAxisCoords = item.Coordinates.Rotate();
				let otherAxisCell = this.GetCell(otherAxisCoords);
				
				//Remove invalid groups from cell in other axis and re-evaluate in both directions
				otherAxisCell.Cell.SetFillState(newFillState == CellFillState.Filled);

				[ReevaluationDirection.Forwards, ReevaluationDirection.Backwards]
					.forEach(direction => {

						newItems.push({
							Coordinates: otherAxisCoords,
							Direction: direction
						})

					})
			}

			return newItems;
		}
		else return [];
	}
}