import assert from 'node:assert/strict';
import {cells,blocked,entrance,exit,checkout,stops,walkable} from './layout.mjs';
import {measure,complexPath,proximity,euclidean} from './distance.mjs';
import {createCustomers,tickCustomers} from './shoppers.mjs';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,a+' != '+b);let pairs=0;
// Independent weighted Dijkstra: diagonals cost sqrt(2), with no corner cutting.
for(const a of cells){const d=new Map([[a.join(),0]]),open=[a],done=new Set();while(open.length){let best=0;for(let i=1;i<open.length;i++)if(d.get(open[i].join())<d.get(open[best].join()))best=i;const p=open.splice(best,1)[0],key=p.join();if(done.has(key))continue;done.add(key);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){if(!dx&&!dy)continue;const q=[p[0]+dx,p[1]+dy],k=q.join();if(!walkable(q)||done.has(k)||dx&&dy&&(!walkable([p[0]+dx,p[1]])||!walkable([p[0],p[1]+dy])))continue;const n=d.get(key)+Math.hypot(dx,dy);if(n<(d.get(k)??Infinity)){d.set(k,n);open.push(q);}}}for(const b of cells){const m=measure(a,b);close(m.aisle,d.get(b.join()));close(m.direct,euclidean(a,b));assert(m.aisle+1e-7>=m.direct);pairs++;}}
const detour=measure([6,6],[8,6]);close(detour.direct,2);close(detour.aisle,6);assert.deepEqual(proximity(detour,3),{directClose:true,aisleClose:false});
for(const [a,b,n]of [[[5.25,2],[5.75,2],.5],[[5.25,2.25],[5.75,2.75],Math.SQRT2/2],[[5,2],[6,3],Math.SQRT2]]){close(measure(a,b).aisle,n);close(measure(b,a).aisle,n);}
const w=createCustomers();for(let n=0;n<2400;n++){tickCustomers(w,.05,.9);for(const s of w.customers){const d=measure(s.pos,checkout);assert(d.aisle+1e-7>=d.direct);close(d.aisle,measure(checkout,s.pos).aisle);close(d.points.slice(1).reduce((sum,p,i)=>sum+euclidean(p,d.points[i]),0),d.aisle);}}
const order=w.customers[1].order,route=complexPath([entrance,...order.map(i=>stops[i+1]),checkout,exit]);close(route.direct,1);close(route.aisle,route.legs.reduce((n,l)=>n+l.aisle,0));const loop=complexPath([entrance,checkout,entrance]);close(loop.direct,0);assert(loop.aisle>0);
assert.throws(()=>measure([7,6],[8,6]));assert.throws(()=>measure([0,1],[1,1]));assert.throws(()=>measure([6.5,5.5],[8,6]));assert.throws(()=>proximity(detour,-1));
console.log('PASS: '+pairs+' aisle pairs against independent diagonal Dijkstra; moving cardinal/diagonal endpoints; route sums; proximity thresholds; invalid fixture crossings.');
