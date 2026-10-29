import assert from 'node:assert/strict';
import {Traffic,clearance,segmentClearance} from './traffic.mjs';
import {distance,path,pathLength} from './navigation.mjs';
import {depot,stops,exit,walkable} from './layout.mjs';
import {createCustomers,tickCustomers} from './shoppers.mjs';
import {plan,goods} from './planner.mjs';
function check(traffic,before=new Map()){const all=[...traffic.agents.values()];for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=all[i],b=all[j];assert(distance(a.pos,b.pos)>=clearance-1e-7,`Collision: ${a.id} / ${b.id}`);if(before.has(a.id)&&before.has(b.id))assert(segmentClearance(before.get(a.id),a.pos,before.get(b.id),b.pos)>=clearance-1e-7,'Swept movement collision');}}
function runScenario(a,b,goalA,goalB){const t=new Traffic();t.add('a',a);t.add('b',b);t.setGoal('a',goalA,1.1);t.setGoal('b',goalB,.9);for(let n=0;n<5000&&(!t.arrived('a')||!t.arrived('b'));n++){const before=new Map([...t.agents].map(([id,a])=>[id,[...a.pos]]));t.step(.025);check(t,before);}assert(t.arrived('a')&&t.arrived('b'),'Actors must finish, not deadlock');}
runScenario([5,2],[6,2],[6,2],[5,2]); // Adjacent head-on swap requires yielding.
runScenario([5,2],[6,2],[6,3],[5,3]); // Crossing diagonal reservations.
const paused=new Traffic();paused.add('stopped',[6,3]);paused.add('walker',[4,3]);paused.setGoal('walker',[9,3]);for(let n=0;n<1200&&!paused.arrived('walker');n++){paused.step(.025);check(paused);assert.deepEqual(paused.get('stopped').pos,[6,3]);}assert(paused.arrived('walker'));assert.equal(paused.add('duplicate',[6,3]),null);
const traffic=new Traffic();traffic.add('courier',depot);const world=createCustomers(Array(9).fill(6),traffic,12),rows=goods.map((_,i)=>({qty:i%3===0?2:1,weight:[1.5,1,.4,.7,.3,.8,1.2,.5,.6][i]})),delivery=plan(rows,24);
let trip=0,leg=0,delivered=0,diagonals=0,oblique=0,yields=0;function target(){const t=delivery.trips[trip];traffic.setGoal('courier',leg<t.order.length?stops[t.order[leg]+1]:depot,1.1);}target();
for(let n=0;n<14000&&(trip<delivery.trips.length||!world.customers.every(s=>s.state==='done'));n++){
 const before=new Map([...traffic.agents].map(([id,a])=>[id,[...a.pos]]));tickCustomers(world,.025,.9);check(traffic,before);
 for(const a of traffic.agents.values()){if(a.id==='courier'&&a.edge)assert(a.edge.from[0]===a.edge.to[0]||a.edge.from[1]===a.edge.to[1],'Robot must remain axial');if(a.id.startsWith('shopper')&&a.edge){const dx=Math.abs(a.edge.to[0]-a.edge.from[0]),dy=Math.abs(a.edge.to[1]-a.edge.from[1]);if(dx>1e-5&&dy>1e-5&&Math.abs(dx-dy)>1e-5)oblique++;}if(a.edge&&a.edge.from[0]!==a.edge.to[0]&&a.edge.from[1]!==a.edge.to[1])diagonals++;if(a.wait>.1)yields++;}
 if(trip<delivery.trips.length&&traffic.arrived('courier')){const t=delivery.trips[trip];if(leg<t.order.length){const type=t.order[leg];for(const item of t.items.filter(i=>i.type===type)){world.stock[type]++;delivered++;}leg++;target();}else{trip++;leg=0;if(trip<delivery.trips.length)target();}}
}
assert.equal(trip,delivery.trips.length);assert.equal(delivered,12);assert(world.customers.every(s=>s.state==='done'));assert(diagonals>0);assert(oblique>0);assert(yields>0);assert(world.stock.every(n=>n>=0));assert(traffic.get('courier').distance+1e-7>=delivery.total);assert.deepEqual(traffic.get('courier').pos,depot);assert(world.customers.every(s=>s.pos.join()===exit.join()));
for(const [a,b] of [[[6,6],[8,6]],[[2,2],[12,12]]]){const route=path(a,b);assert(route.every(walkable));assert(pathLength(route)>=distance(a,b)-1e-7);}
console.log('PASS: head-on swaps, crossing diagonals, paused-person avoidance, entry occupancy, cashier clearance, swept collision checks, six slower shoppers + courier completing all work without overlap.',{duration:world.time.toFixed(1),planned:delivery.total.toFixed(2),actual:traffic.get('courier').distance.toFixed(2),anyAngleFrames:oblique,diagonalFrames:diagonals,yieldFrames:yields});
