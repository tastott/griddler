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
	constructor(public Axis: Axis, public A: number, public B: number) {

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

	Normalize(): { X: number; Y: number } {
		if (this.Axis == Axis.Horizontal) {
			return {
				X: this.A,
				Y: this.B
			}
		}
		else {
			return {
				X: this.B,
				Y: this.A
			}
		}
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

		this.queue = this.GetInitialQueueItems(this.columns, griddler.rows.length, Axis.Vertical)
			.concat(this.GetInitialQueueItems(this.rows, griddler.columns.length, Axis.Horizontal));
			
		//Use any hints
		if(griddler.hints){
			griddler.hints.forEach(hint => {
				let coords = new Coordinates(Axis.Horizontal, hint.x, hint.y);
				let otherCoords = coords.Rotate();
				this.queue = this.queue.concat(this.SetFillState(coords, CellFillState.Filled));
				this.queue = this.queue.concat(this.SetFillState(otherCoords, CellFillState.Filled));
			})
		}
	}

	private InitializeLines(sequences: number[][], lineLength: number): GridLine[] {
		return sequences.map(lineSequence => {
			var resolver = new CellResolver(lineSequence, lineLength);
			var cells = resolver.InitializeLine();
			return {
				Resolver: resolver,
				Cells: cells
			}
		});
	}

	private GetInitialQueueItems(lines: GridLine[], lineLength: number, axis: Axis): QueueItem[] {
		var queueItems: QueueItem[] = [];
		//Reevaluate in other axis if fill state is known already
		
		lines.forEach((l, lineIndex) => {
			//To begin with, all lines have to be back-solved from last cell
			queueItems.push({
				Coordinates: new Coordinates(axis, lineLength - 1, lineIndex),
				Direction: ReevaluationDirection.Backwards
			})
			
			//Reevaluate in other axis if fill state is known already
			l.Cells.forEach((cell, index) => {
				let fillState: CellFillState;
				if ((fillState = cell.GetFillState()) !== CellFillState.Unknown) {
					var otherAxisCoords = new Coordinates(axis, index, lineIndex).Rotate();
					queueItems = queueItems.concat(this.SetFillState(otherAxisCoords, fillState));
				}

			})
		})

		return queueItems;
	}

	public Solve(): CellFillState[][] {
		let count = 0;
		let limit = 10000;
		while (this.queue.length && count < limit) {
			++count;
			let nextItem = this.queue.shift();
			let newItems = this.ProcessQueueItem(nextItem);
			newItems.forEach(x => this.queue.push(x));
		}

		if (count >= limit) throw new Error('Bad shit happened')
		
		return this.columns.map(column => {
			return column.Cells.map(cell => {
				return cell.GetFillState();
			})
		})

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
		var nextCell = this.GetCell(nextCoords);
		if (!nextCell) return [];
		
		//Reevaluate next cell
		var nextCellOldState = nextCell.Cell.Clone();
		var thisCell = this.GetCell(item.Coordinates);
		nextCell.Resolver.ReevaluateCell(nextCell.Cell, thisCell.Cell, item.Direction == ReevaluationDirection.Forwards);

		if (item.Coordinates.Axis == Axis.Vertical && item.Coordinates.B == 4) {

		//	console.log(item.Coordinates.Normalize())
			//console.log(JSON.stringify(thisCell.Cell, null, 4))

		}
		//Continue re-evaluation if state has changed
		if (!deepEqual(nextCellOldState, nextCell.Cell)) {

			let newItems: QueueItem[] = [{
				Coordinates: nextCoords,
				Direction: item.Direction
			}];
				
			//Reevaluate in other axis if fill state has changed
			let newFillState: CellFillState;
			if (nextCellOldState.GetFillState() == CellFillState.Unknown
				&& (newFillState = nextCell.Cell.GetFillState()) != CellFillState.Unknown) {
				let otherAxisCoords = nextCoords.Rotate();
				
				//Remove invalid groups from cell in other axis and re-evaluate in both directions
				newItems = newItems.concat(this.SetFillState(otherAxisCoords, newFillState));
			}

			return newItems;
		}
		else return [];
	}

	private SetFillState(coords: Coordinates, newFillState: CellFillState): QueueItem[] {
		let xy = coords.Normalize();
	//	console.log(`(${xy.X},${xy.Y}) = ${CellFillState[newFillState]}`);

		let cell = this.GetCell(coords);
		cell.Cell.SetFillState(newFillState == CellFillState.Filled);

		return [ReevaluationDirection.Forwards, ReevaluationDirection.Backwards]
			.map(direction => ({
				Coordinates: coords,
				Direction: direction
			}));
	}
}