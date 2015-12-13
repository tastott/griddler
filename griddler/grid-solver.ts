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

interface QueueItem {
	SourceAxis: Axis;
	ThisAxisIndex: number;
	OtherAxisIndex: number;
	Direction?: ReevaluationDirection;
}

export class GridSolver {

	private rows: GridLine[];
	private columns: GridLine[];

	private queue: QueueItem[];

	constructor(griddler: Griddler) {
		this.columns = this.InitializeLines(griddler.columns, griddler.rows.length);
		this.rows = this.InitializeLines(griddler.rows, griddler.columns.length);
		
		//To begin with, all lines need to be back-solved from the last cell
		this.columns.forEach((column, colIndex) => {
			this.queue.push({
				SourceAxis: Axis.Vertical,
				ThisAxisIndex: griddler.rows.length - 1,
				OtherAxisIndex: colIndex,
				Direction: ReevaluationDirection.Backwards
			})
		})

		this.rows.forEach((row, rowIndex) => {
			this.queue.push({
				SourceAxis: Axis.Horizontal,
				OtherAxisIndex: rowIndex,
				ThisAxisIndex: griddler.columns.length - 1,
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

	private GetNextCell(axis: Axis,
		thisAxisIndex: number,
		otherAxisIndex: number,
		direction: ReevaluationDirection): { Index: number; Cell: CellState; Resolver: CellResolver } {

		let nextIndex = thisAxisIndex + (direction == ReevaluationDirection.Forwards ? 1 : -1);
		let cell = this.GetCell(axis, nextIndex, otherAxisIndex);

		if (cell) {
			return {
				Index: nextIndex,
				Cell: cell.Cell,
				Resolver: cell.Resolver
			}
		}
		else {
			return null;
		}
	}

	private GetCell(axis: Axis,
		thisAxisIndex: number,
		otherAxisIndex: number): { Cell: CellState; Resolver: CellResolver } {

		let lines = axis == Axis.Horizontal ? this.rows : this.columns;
		let line = lines[otherAxisIndex];
		
		//Cell doesn't exist
		if (thisAxisIndex < 0 || thisAxisIndex >= line.Cells.length) return null;

		return {
			Cell: line.Cells[thisAxisIndex],
			Resolver: line.Resolver
		};
	}

	private ProcessQueueItem(item: QueueItem): QueueItem[] {
		//Get next cell, return early if we've reached the end of the line
		var nextCell = this.GetNextCell(item.SourceAxis, item.ThisAxisIndex, item.OtherAxisIndex, item.Direction);
		if (!nextCell) return [];
		
		//Reevaluate next cell
		var thisCell = this.GetCell(item.SourceAxis, item.ThisAxisIndex, item.OtherAxisIndex);
		var nextCellNewState = nextCell.Resolver.ReevaluateCell(nextCell.Cell, thisCell.Cell, item.Direction == ReevaluationDirection.Forwards);
		
		//Continue re-evaluation if state has changed
		if (!deepEqual(nextCell.Cell, nextCellNewState)) {
			let newItems: QueueItem[] = [{
				SourceAxis: item.SourceAxis,
				ThisAxisIndex: nextCell.Index,
				OtherAxisIndex: item.OtherAxisIndex,
				Direction: item.Direction
			}];
				
			//Reevaluate in other axis if fill state has changed
			let newFillState: CellFillState;
			if (nextCell.Cell.GetFillState() == CellFillState.Unknown
				&& (newFillState = nextCellNewState.GetFillState()) != CellFillState.Unknown) {
				let otherAxis = item.SourceAxis == Axis.Horizontal ? Axis.Vertical : Axis.Horizontal;
				let otherAxisCell = this.GetCell(otherAxis, item.OtherAxisIndex, nextCell.Index);
				
				//Remove invalid groups from cell in other axis and re-evaluate in both directions
				otherAxisCell.Cell.SetFillState(newFillState == CellFillState.Filled);

				[ReevaluationDirection.Forwards, ReevaluationDirection.Backwards]
					.forEach(direction => {

						newItems.push({
							SourceAxis: otherAxis,
							ThisAxisIndex: item.OtherAxisIndex,
							OtherAxisIndex: nextCell.Index,
							Direction: direction
						})

					})
			}

			return newItems;
		}
		else return [];
	}
}