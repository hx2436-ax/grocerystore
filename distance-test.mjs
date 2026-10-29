import assert from 'node:assert/strict';
import {blocked,entrance,checkout,stops} from './planner.mjs';
import {measure,complexPath,proximity,euclidean} from './distance.mjs';
import {createCustomers,tickCustomers} from './shoppers.mjs';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const cells=[];for(let y=1;y<=15;y++)for(let x=1;x<=15;x++)if(!blocked.has(`${x},${y}`))cells.push([x,y]);
// Independent numeric-index BFS checks every pair of walkable locations.
const id=p=>p[1]*16+p[0],valid=new Set(cells.map(id));let pairs=0;
for(const a of cells){const distances=new Map([[id(a),0]]),q=[id(a)];for(let i=0;i<q.length;i++)for(const n of [q[i]-1,q[i]+1,q[i]-16,q[i]+16])if(valid.has(n)&&!distances.has(n)){distances.set(n,distances.get(q[i])+1);q.push(n);}for(const b of cells){const d=measure(a,b);close(d.direct,euclidean(a,b));close(d.aisle,distances.get(id(b)));assert(d.aisle+1e-7>=d.direct);pairs++;}}
const detour=measure([3,4],[5,4]);close(detour.direct,2);close(detour.aisle,4);assert.deepEqual(proximity(detour,3),{directClose:true,aisleClose:false});assert.deepEqual(proximity(detour,4),{directClose:true,aisleClose:true});assert.deepEqual(proximity(detour,1),{directClose:false,aisleClose:false});
for(const [a,b,expected]of [[[3.25,3],[3.75,3],.5],[[3.25,3],[4,3],.75],[[3.25,3],[5,4],2.75],[[3,3.5],[5,4.5],4],[[3.25,3],[3.25,3],0]]){close(measure(a,b).aisle,expected);close(measure(b,a).aisle,expected);}
const world=createCustomers();for(let n=0;n<1200;n++){tickCustomers(world,.025,5);for(const s of world.customers){const d=measure(s.pos,checkout);assert(d.aisle+1e-7>=d.direct);close(d.aisle,measure(checkout,s.pos).aisle);close(d.points.slice(1).reduce((total,p,i)=>total+euclidean(d.points[i],p),0),d.aisle);}}
const tour=world.customers[1],positions=[entrance,...tour.order.map(i=>stops[i+1]),checkout,entrance],complex=complexPath(positions);close(complex.direct,0);assert(complex.aisle>0);close(complex.aisle,complex.legs.reduce((n,l)=>n+l.aisle,0));close(complex.directSegments,complex.legs.reduce((n,l)=>n+l.direct,0));
close(complexPath([[3,4],[3,4],[5,4]]).aisle,4);assert.throws(()=>measure([4,4],[3,4]));assert.throws(()=>measure([3.5,4],[5,4]));assert.throws(()=>measure([0,1],[1,1]));assert.throws(()=>measure([2.5,2.5],[1,1]));assert.throws(()=>complexPath([entrance]));assert.throws(()=>proximity(detour,-1));
console.log(`PASS: ${pairs} location pairs against independent BFS, moving occupants, same-edge fractional distances, symmetry, path-length consistency, close/far classifications, waypoint sums, full shopping tours and invalid endpoints.`);
