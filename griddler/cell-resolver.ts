import {CellState} from './models'

export class CellResolver {
	
	private groupLengths: number[];
	
	constructor(sequence:number[], private lineLength: number){
		if(!sequence.length) throw new Error('Sequence must contain at least one block')
		if(lineLength < 1) throw new Error('Line length must be positive')
		
		let minimumGroupLength = sequence.reduce((total,value) => total+value)
			+ sequence.length - 1;
		
		if(minimumGroupLength > lineLength) throw new Error(`Insufficient line length. Required: ${minimumGroupLength}. Actual: ${lineLength}`);
		
		let slack = lineLength - minimumGroupLength;
		
		this.groupLengths = 
			[
				{Group: 0, Length: slack},
				{Group: sequence.length * 2, Length: slack}
			]
			.concat(sequence.map((x,i) => ({
				Group: (i * 2) + 1,
				Length: x
			})))
			.concat(sequence.slice(-1).map((x, i) => ({
				Group: i + 1,
				Length: slack + 1
			})))
			.sort((a,b) => a.Group - b.Group)
			.map(g => g.Length);
	}
	
	public InitializeLine(): CellState[] {
		
		var cells : CellState[] = [];
		
		//First cell
		let first = new CellState().Add(1,0); //Always has first filled block
		if(this.groupLengths[0]) first.Add(0,0); //If line has slack, add Group 0
		cells.push(first);
		
		let previous = first;
		//Middle cells
		for(let i = 1; i < this.lineLength-1; i++){
			let current = this.InitializeNext(previous);
			cells.push(current);
			previous = current;
		}
		
		//Last cell
		let last = this.InitializeNext(previous);
		last.GetGroups()
			.filter(g => g < this.groupLengths.length - 2 || this.groupLengths[g] === 0) //Only allow last filled group and, if there is slack, trailing empty group
			.forEach(g => last.RemoveGroup(g));
		
		cells.push(last);
		
		return cells;
	}
	
	private InitializeNext(previous: CellState):CellState {
		let result = new CellState();
		previous.GetItems().forEach(previousItem => {
			var groupLength = this.groupLengths[previousItem.Group];
			
			//Filled: next filled block in this group or next group if last filled block
			if(previousItem.Group % 2 == 1) {
				if(previousItem.Item < groupLength-1) result.Add(previousItem.Group, previousItem.Item+1);
				else result.Add(previousItem.Group+1, 0);
			}
			//Empty: first of next filled block (if any) and next empty item (if any)
			else {
				if(previousItem.Group < this.groupLengths.length-1){
				result.Add(previousItem.Group+1, 0);
				}
				if(previousItem.Item < groupLength - 1){
					result.Add(previousItem.Group, previousItem.Item+1);
				}
			}
		})
		
		return result;
	}
	
	
}