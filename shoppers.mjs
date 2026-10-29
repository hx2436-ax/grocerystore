import {path,stops,entrance,checkout} from './planner.mjs';

export const profiles=[
 {name:'Alex',list:[{type:0,qty:2},{type:2,qty:1}]},
 {name:'Maya',list:[{type:1,qty:1},{type:3,qty:2},{type:7,qty:1}]},
 {name:'Noah',list:[{type:4,qty:2},{type:8,qty:1}]},
 {name:'Emma',list:[{type:5,qty:2},{type:6,qty:1}]},
 {name:'Leo',list:[{type:2,qty:2},{type:3,qty:1},{type:8,qty:2}]},
 {name:'Zoe',list:[{type:0,qty:1},{type:1,qty:2},{type:6,qty:1},{type:7,qty:2}]}
];
// Small shopping lists allow exhaustive visit orders, including the final checkout leg.
export function shoppingOrder(list){let best=Infinity,order=[];function visit(left,at,route,cost){if(!left.length){cost+=path(at,checkout).length-1;if(cost<best){best=cost;order=route;}return;}for(const type of left)visit(left.filter(x=>x!==type),stops[type+1],[...route,type],cost+path(at,stops[type+1]).length-1);}visit(list.map(x=>x.type),entrance,[],0);return order;}
function send(s,to){s.route=path(s.node,to);s.step=0;s.fraction=0;s.target=to.join();}
function move(s,dt,speed){s.fraction+=dt*speed;while(s.step<s.route.length-1&&s.fraction>=1){s.fraction--;s.step++;s.node=s.route[s.step];}if(s.step===s.route.length-1){s.pos=[...s.node];s.fraction=0;return true;}const a=s.route[s.step],b=s.route[s.step+1];s.pos=[a[0]+(b[0]-a[0])*s.fraction,a[1]+(b[1]-a[1])*s.fraction];return false;}
export function createCustomers(stock=Array(9).fill(6)){
 return {time:0,stock:[...stock],queue:[],paidOrder:[],customers:profiles.map((p,i)=>({...p,list:p.list.map(x=>({...x})),id:i,order:shoppingOrder(p.list),stop:0,node:[...entrance],pos:[...entrance],state:'arriving',arrival:i*2.5,route:[entrance],step:0,fraction:0,basket:[],missing:[],timer:0,target:''}))};
}
export function tickCustomers(world,dt,speed=2){
 world.time+=dt;
 for(const s of world.customers){
  if(s.state==='arriving'){if(world.time<s.arrival)continue;s.state='shopping';send(s,stops[s.order[0]+1]);}
  if(s.state==='shopping'){if(move(s,dt,speed)){s.state='browsing';s.timer=.8;}continue;}
  if(s.state==='browsing'){s.timer-=dt;if(s.timer>0)continue;const type=s.order[s.stop],want=s.list.find(x=>x.type===type).qty,got=Math.min(want,world.stock[type]);world.stock[type]-=got;if(got)s.basket.push({type,qty:got});if(got<want)s.missing.push({type,qty:want-got});s.stop++;if(s.stop<s.order.length){s.state='shopping';send(s,stops[s.order[s.stop]+1]);}else{s.state='queueing';world.queue.push(s.id);s.target='';}continue;}
  if(s.state==='queueing'){
   const index=world.queue.indexOf(s.id),target=[checkout[0],checkout[1]-index];
   // Finish the current grid edge before updating a moving queue destination.
   if(s.target!==target.join()&&(s.fraction===0||s.step===s.route.length-1))send(s,target);
   if(move(s,dt,speed)&&s.node.join()===target.join()&&index===0){s.state='paying';s.timer=2;}
   continue;
  }
  if(s.state==='paying'){s.timer-=dt;if(s.timer<=0){world.paidOrder.push(s.id);world.queue.shift();s.state='leaving';send(s,entrance);}continue;}
  if(s.state==='leaving'&&move(s,dt,speed))s.state='done';
 }
}
