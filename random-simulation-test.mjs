import assert from 'node:assert/strict';
import {makeScenario} from './random-rounds.mjs';
import {profiles,createCustomers,tickCustomers} from './shoppers.mjs';
import {Traffic,clearance} from './traffic.mjs';
import {depot,stops} from './layout.mjs';
import {distance} from './navigation.mjs';
import {plan} from './planner.mjs';
const original=profiles.map(p=>({...p,list:p.list.map(x=>({...x}))}));let longest=0;
try{for(let seed=1;seed<=12;seed++){
 const s=makeScenario(seed);profiles.splice(0,profiles.length,...s.customers);const traffic=new Traffic();traffic.add('courier',depot);const world=createCustomers(s.openingStock,traffic,s.interval),delivery=plan(s.cargo,s.capacity);let trip=0,leg=0,delivered=0;
 const target=()=>{const t=delivery.trips[trip];traffic.setGoal('courier',leg<t.order.length?stops[t.order[leg]+1]:depot,1.1);};target();
 for(let frame=0;frame<6000&&(trip<delivery.trips.length||!world.customers.every(x=>x.state==='done'));frame++){
  tickCustomers(world,.05,s.speed);const robot=traffic.get('courier');if(robot.edge)assert(robot.edge.from[0]===robot.edge.to[0]||robot.edge.from[1]===robot.edge.to[1]);
  if(frame%5===0){const actors=[...traffic.agents.values()];for(let i=0;i<actors.length;i++)for(let j=i+1;j<actors.length;j++)assert(distance(actors[i].pos,actors[j].pos)>=clearance-1e-7,'Collision in random round '+seed);}
  if(trip<delivery.trips.length&&traffic.arrived('courier')){const t=delivery.trips[trip];if(leg<t.order.length){const type=t.order[leg];for(const item of t.items.filter(i=>i.type===type)){world.stock[type]++;delivered++;}leg++;target();}else{trip++;leg=0;if(trip<delivery.trips.length)target();}}
 }
 assert.equal(trip,delivery.trips.length,'Robot stalled in random round '+seed);assert.equal(delivered,delivery.count);assert(world.customers.every(x=>x.state==='done'),'Customer stalled in random round '+seed+' '+JSON.stringify(world.customers.map(x=>({name:x.name,state:x.state,pos:x.pos,target:traffic.get(x.actor)?.goal}))));assert(world.stock.every(n=>n>=0));longest=Math.max(longest,world.time);console.log('Random seed '+seed+' completed in '+world.time.toFixed(1)+' simulated seconds.');
}}finally{profiles.splice(0,profiles.length,...original);}
console.log('PASS: 12 fully randomized store runs complete with conserved cargo, no negative stock, safe clearances and strictly axial robots. Longest simulated run: '+longest.toFixed(1)+' s.');
