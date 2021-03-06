let clone = require('clone')

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
	
	public Add(group: number, item: number) : CellState{
		if(!this.state[group]){
			this.state[group] = {};
		}
		
		this.state[group][item] = true;
		return this;
	}
	
	public RemoveGroup(group:number) {
		delete this.state[group];
		return this;
	}
	
	public RemoveItem(group:number, item:number){
		delete this.state[group][item];
		if(!Object.keys(this.state[group]).length) delete this.state[group];
	}
	
	public Has(group: number, item: number): boolean {
		return this.state[group] !== undefined && this.state[group][item];
	}
	
	public HasGroup(group: number): boolean {
		return this.state[group] !== undefined;
	}
	
	public GetGroups():number[]{
		return Object.keys(this.state).map(s => parseInt(s));
	}
	
	public GetItems(): {Group: number; Item: number;}[] {
		var items : {Group: number; Item: number;}[] = [];
		
		this.GetGroups().forEach(g => {
			Object.keys(this.state[g])
				.map(s => parseInt(s))
				.forEach(i => {
					items.push({Group: g, Item: i})
				})
		})
		
		return items;
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
	
	public SetFillState(filled: boolean) {
		let remainder = filled ? 1 : 0;
		let groupsToRemove = this.GetGroups()
			.filter(g => g % 2 != remainder);
			
		groupsToRemove.forEach(g => this.RemoveGroup(g));
	}
	
	public Clone(): CellState {
		var cloned = new CellState();
		cloned.state = clone(this.state);
		return cloned;
	}
}

export interface Griddler {
	rows: number[][];
	columns: number[][];
	hints?: {
		x: number;
		y: number;
	}[];
}