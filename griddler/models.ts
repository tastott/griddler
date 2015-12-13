
export enum CellFillState {
	Unknown,
	Filled,
	Empty
}

export class CellState {
	private state: {
		[group: number]: {
			[item: number]: boolean;
		}
	}
	
	constructor(){
		this.state = {};
	}
	
	public Add(group: number, item: number){
		if(!this.state[group]){
			this.state[group] = {};
		}
		
		this.state[group][item] = true;
	}
	
	public GetGroups():number[]{
		return Object.keys(this.state).map(s => parseInt(s));
	}
	
	public GetFillState(): CellFillState {
		var groups = this.GetGroups();
		
		if(!groups.length) throw new Error('Cannot access fill state before group has been initialized');
		
		var filled = 0, empty = 0;
		
		groups.forEach(g => {
			if(g % 2 == 0) ++empty;
			else ++filled;
		});
		
		if(filled == 0) return CellFillState.Empty;
		else if(empty == 0) return CellFillState.Filled;
		else return CellFillState.Unknown;
	}
}