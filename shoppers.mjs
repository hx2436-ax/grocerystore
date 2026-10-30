import {stops,entrance,exit,checkout,queueSlot} from './planner.mjs';
import {pathLength} from './navigation.mjs';
import {freePath as path} from './walking.mjs';
import {Traffic} from './traffic.mjs';
import {measure} from './distance.mjs';
import {proximityRules as rules} from './proximity-rules.mjs';

export const profiles=[
 {name:'Alex',list:[{type:0,qty:2},{type:2,qty:1}]},
 {name:'Maya',list:[{type:1,qty:1},{type:3,qty:2},{type:7,qty:1}]},
 {name:'Noah',list:[{type:4,qty:2},{type:8,qty:1}]},
 {name:'Emma',list:[{type:5,qty:2},{type:6,qty:1}]},
 {name:'Leo',list:[{type:2,qty:2},{type:3,qty:1},{type:8,qty:2}]},
 {name:'Zoe',list:[{type:0,qty:1},{type:1,qty:2},{type:6,qty:1},{type:7,qty:2}]}
];
// Small shopping lists allow exhaustive visit orders, including the final checkout leg.
export function shoppingOrder(list){let best=Infinity,order=[];function visit(left,at,route,cost){if(!left.length){cost+=pathLength(path(at,checkout));if(cost<best){best=cost;order=route;}return;}for(const type of left)visit(left.filter(x=>x!==type),stops[type+1],[...route,type],cost+pathLength(path(at,stops[type+1])));}visit(list.map(x=>x.type),entrance,[],0);return order;}
export function createCustomers(stock=Array(9).fill(6),traffic=new Traffic(),interval=12){
 return {traffic,time:0,interval,stock:[...stock],queue:[],paidOrder:[],customers:profiles.map((p,i)=>({...p,list:p.list.map(x=>({...x})),id:i,actor:'shopper'+i,order:shoppingOrder(p.list),stop:0,node:[...entrance],pos:[...entrance],state:'arriving',arrival:profiles.slice(0,i).reduce((n,person)=>n+interval*(person.arrivalFactor??1),0),basket:[],missing:[],timer:0,target:''}))};
}
export function syncCustomers(world){for(const s of world.customers){const a=world.traffic.get(s.actor);if(a){s.pos=[...a.pos];s.node=[...a.node];}}}
export function tickCustomers(world,dt,speed=.9,{advanceTraffic=true}={}){
 world.time+=dt;syncCustomers(world);
 const send=(s,to)=>{world.traffic.setGoal(s.actor,to,speed*(s.speedFactor??1));s.target=to.join();};
 for(const s of world.customers){
  let a=world.traffic.get(s.actor);if(a){a.speed=speed*(s.speedFactor??1);a.paused=false;}
  if(s.state==='arriving'){if(world.time<s.arrival||!world.traffic.canSpawn(entrance))continue;a=world.traffic.add(s.actor,entrance);if(!a)continue;s.state='shopping';send(s,stops[s.order[0]+1]);}
  if(s.state==='shopping'){const type=s.order[s.stop],range=measure(s.pos,stops[type+1]).aisle;if(range<=rules.pickupDistance+1e-8){s.state='picking';s.timer=world.stock[type]>0?1.5:0;a.paused=true;a.pickup={type,distance:range,available:world.stock[type]>0};if(a.pickup.available)world.traffic.logEvent('pickup',[s.actor],`${s.name} entered the ${rules.pickupDistance} m pickup zone`,{type,distance:range});}continue;}
  if(s.state==='picking'){a.paused=true;s.timer-=dt;if(s.timer>0)continue;const type=s.order[s.stop],want=s.list.find(x=>x.type===type).qty,got=Math.min(want,world.stock[type]);world.stock[type]-=got;if(got){s.basket.push({type,qty:got});a.lastPickup={type,until:world.traffic.time+1.2};world.traffic.logEvent('pickup',[s.actor],`${s.name} picked ${got} item${got===1?'':'s'}`,{type,distance:a.pickup.distance});}if(got<want)s.missing.push({type,qty:want-got});a.pickup=null;a.paused=false;s.stop++;if(s.stop<s.order.length){s.state='shopping';send(s,stops[s.order[s.stop]+1]);}else{s.state='queueing';world.queue.push(s.id);s.target='';}continue;}
  if(s.state==='queueing'){const index=world.queue.indexOf(s.id),target=queueSlot(index);if(s.target!==target.join())send(s,target);if(world.traffic.arrived(s.actor)&&index===0){s.state='paying';s.timer=3;}continue;}
  if(s.state==='paying'){s.timer-=dt;if(s.timer<=0){world.paidOrder.push(s.id);world.queue.shift();s.state='leaving';send(s,exit);}continue;}
  if(s.state==='leaving'&&world.traffic.arrived(s.actor)){s.pos=[...exit];s.node=[...exit];s.state='done';world.traffic.remove(s.actor);}
 }
 if(advanceTraffic)world.traffic.step(dt);syncCustomers(world);
}
