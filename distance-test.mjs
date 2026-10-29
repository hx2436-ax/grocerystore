import assert from 'node:assert/strict';
import {cells,entrance,exit,checkout,stops} from './layout.mjs';
import {clearWalk} from './walking.mjs';
import {measure,complexPath,proximity,euclidean} from './distance.mjs';
import {createCustomers,tickCustomers} from './shoppers.mjs';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,a+' != '+b),n=cells.length;
// Independent Floyd–Warshall reference over all visible floor-waypoint pairs.
const d=Array.from({length:n},(_,i)=>Float64Array.from(cells.map((b,j)=>i===j?0:clearWalk(cells[i],b)?euclidean(cells[i],b):Infinity)));
for(let k=0;k<n;k++)for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(d[i][k]+d[k][j]<d[i][j])d[i][j]=d[i][k]+d[k][j];
for(let i=0;i<n;i++)for(let j=0;j<n;j++){const m=measure(cells[i],cells[j]);close(m.aisle,d[i][j]);close(m.direct,euclidean(cells[i],cells[j]));assert(m.aisle+1e-7>=m.direct);}
const detour=measure([6,6],[8,6]);close(detour.direct,2);close(detour.aisle,6);assert.deepEqual(proximity(detour,3),{directClose:true,aisleClose:false});
const a=[5.2,2.3],b=[9.1,3.7];assert(clearWalk(a,b));close(measure(a,b).aisle,euclidean(a,b));
const w=createCustomers();for(let n=0;n<600;n++){tickCustomers(w,.05,.9);for(const s of w.customers){const m=measure(s.pos,checkout);assert(m.aisle+1e-7>=m.direct);close(m.aisle,measure(checkout,s.pos).aisle);close(m.points.slice(1).reduce((sum,p,i)=>sum+euclidean(p,m.points[i]),0),m.aisle);}}
const order=w.customers[1].order,route=complexPath([entrance,...order.map(i=>stops[i+1]),checkout,exit]);close(route.direct,1);close(route.aisle,route.legs.reduce((n,l)=>n+l.aisle,0));assert.throws(()=>measure([7,6],[8,6]));assert.throws(()=>measure([0,1],[1,1]));assert.throws(()=>proximity(detour,-1));
console.log('PASS: '+n*n+' location pairs against independent visibility-graph Floyd–Warshall; arbitrary moving coordinates; route sums; obstacle clearance and proximity classifications.');
