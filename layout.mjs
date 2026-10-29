export const size=15;
export const depot=[1,1],entrance=[3,1],exit=[4,1],checkout=[12,3],counter=[13,3],cashier=[14,3];
export const goods=['Water','Milk','Bread','Fruit','Snacks','Canned food','Personal care','Paper goods','Cold drinks'];
const fixtures=[
 {x:4,y:14,w:3,d:1,kind:'cooler',service:[4,13]},
 {x:8,y:14,w:3,d:1,kind:'cooler',service:[8,13]},
 {x:3,y:5,w:1,d:2,kind:'bakery',service:[4,5]},
 {x:3,y:8,w:1,d:2,kind:'produce',service:[4,8]},
 {x:7,y:6,w:1,d:3,kind:'gondola',service:[6,6]},
 {x:7,y:10,w:1,d:3,kind:'gondola',service:[6,10]},
 {x:11,y:6,w:1,d:3,kind:'gondola',service:[10,6]},
 {x:11,y:10,w:1,d:3,kind:'gondola',service:[10,10]},
 {x:12,y:14,w:3,d:1,kind:'cooler',service:[12,13]}
];
export const shelves=fixtures.map((s,i)=>({...s,name:goods[i]}));
export const blocked=new Set();
for(const s of shelves)for(let x=1;x<=size;x++)for(let y=1;y<=size;y++)if(Math.abs(x-s.x)<s.w/2+.01&&Math.abs(y-s.y)<s.d/2+.01)blocked.add(`${x},${y}`);
// Coffee counter and a staff-only checkout enclosure.
for(let y=5;y<=10;y++)blocked.add(`1,${y}`);
for(let x=13;x<=15;x++)for(let y=1;y<=4;y++)blocked.add(`${x},${y}`);
export const stops=[depot,...shelves.map(s=>s.service)];
export const queueSlot=i=>[12,3+i];
export const walkable=p=>p.length===2&&p.every(n=>Number.isInteger(n)&&n>=1&&n<=size)&&!blocked.has(p.join());
export const cells=[];for(let y=1;y<=size;y++)for(let x=1;x<=size;x++)if(walkable([x,y]))cells.push([x,y]);
