import {cells,walkable} from './layout.mjs';
export const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const adjacency=new Map(cells.map(p=>[p.join(),[]]));
for(const a of cells)for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){if(!dx&&!dy)continue;const b=[a[0]+dx,a[1]+dy];if(!walkable(b))continue;if(dx&&dy&&(!walkable([a[0]+dx,a[1]])||!walkable([a[0],a[1]+dy])))continue;adjacency.get(a.join()).push(b);}
export const neighbors=p=>adjacency.get(p.join())||[];
export const pathLength=points=>points.slice(1).reduce((sum,p,i)=>sum+distance(points[i],p),0);
export function path(a,b,allow=()=>true,axial=false){
 if(!walkable(a)||!walkable(b))throw Error('Choose a walkable aisle location.');
 const start=a.join(),goal=b.join(),open=[start],cost=new Map([[start,0]]),previous=new Map(),done=new Set(),positions=new Map([[start,a]]);
 while(open.length){let best=0;for(let i=1;i<open.length;i++)if(cost.get(open[i])+distance(positions.get(open[i]),b)<cost.get(open[best])+distance(positions.get(open[best]),b))best=i;const key=open.splice(best,1)[0],at=positions.get(key);if(key===goal){const route=[b];let p=key;while(previous.has(p)){p=previous.get(p);route.unshift(positions.get(p));}return route;}done.add(key);
 for(const next of neighbors(at)){const k=next.join();if(axial&&next[0]!==at[0]&&next[1]!==at[1]||done.has(k)||!allow(at,next))continue;const candidate=cost.get(key)+distance(at,next);if(candidate<(cost.get(k)??Infinity)-1e-9){cost.set(k,candidate);positions.set(k,next);previous.set(k,key);if(!open.includes(k))open.push(k);}}
 }throw Error('No clear aisle route is available.');
}
export const axisPath=(a,b,allow)=>path(a,b,allow,true);
