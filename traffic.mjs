import {cashier,walkable} from './layout.mjs';
import {axisPath,distance,neighbors} from './navigation.mjs';
import {freePath,localWalkingSteps} from './walking.mjs';
import {proximityRules as rules,predictedConflict} from './proximity-rules.mjs';
export const clearance=.9;
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
export function pointSegment(p,a,b){const ab=sub(b,a),den=dot(ab,ab),t=den?Math.max(0,Math.min(1,dot(sub(p,a),ab)/den)):0;return distance(p,[a[0]+ab[0]*t,a[1]+ab[1]*t]);}
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
export function segmentClearance(a,b,c,d){const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);if(x*y<0&&z*w<0)return 0;return Math.min(pointSegment(a,c,d),pointSegment(b,c,d),pointSegment(c,a,b),pointSegment(d,a,b));}
export class Traffic{
 constructor(){this.agents=new Map();this.reset();}
 reset(){this.agents.clear();this.time=0;this.events=[];this.ruleCounts={space:0,pickup:0,yield:0};this.ruleStates=new Map();this.add('cashier',cashier,{fixed:true});}
 logEvent(rule,actors,message,detail={}){this.events.push({time:this.time,rule,actors,message,...detail});this.ruleCounts[rule]=(this.ruleCounts[rule]||0)+1;if(this.events.length>40)this.events.shift();}
 canSpawn(pos){return [...this.agents.values()].every(a=>a.edge?pointSegment(pos,a.edge.from,a.edge.to)>=clearance-1e-8:distance(pos,a.pos)>=clearance-1e-8);}
 add(id,pos,{fixed=false}={}){if(this.agents.has(id))throw Error('Agent already exists.');if(!fixed&&(!walkable(pos)||!this.canSpawn(pos)))return null;const a={id,pos:[...pos],node:[...pos],goal:[...pos],edge:null,speed:.9,paused:true,fixed,distance:0,wait:0,heading:0,spaceFactor:1,personal:'clear',safetyBlocked:false,yielding:false,yieldWait:0,pickup:null};this.agents.set(id,a);return a;}
 remove(id){this.agents.delete(id);}
 get(id){return this.agents.get(id);}
 setGoal(id,goal,speed=.9){const a=this.get(id);if(!a||a.fixed)return;if(!walkable(goal))throw Error('Invalid movement goal.');a.goal=[...goal];a.speed=speed;a.paused=false;}
 pause(id,value=true){const a=this.get(id);if(a)a.paused=value;}
 arrived(id){const a=this.get(id);return Boolean(a&&!a.edge&&distance(a.pos,a.goal)<1e-8);}
 route(a,allow){return a.id==='courier'?axisPath(a.node,a.goal,allow):freePath(a.node,a.goal,allow);}
 alternatives(a){return a.id==='courier'?neighbors(a.node).filter(p=>p[0]===a.node[0]||p[1]===a.node[1]):localWalkingSteps(a.node);}
 canTraverse(id,from,to){for(const b of this.agents.values()){if(b.id===id)continue;const gap=b.edge?segmentClearance(from,to,b.edge.from,b.edge.to):pointSegment(b.pos,from,to);if(gap<clearance-1e-8)return false;}return true;}
 intent(a,next){if(a.fixed||a.paused||this.arrived(a.id))return [0,0];const to=next||a.edge?.to||this.route(a)[1];if(!to)return [0,0];const length=distance(a.pos,to);return length<1e-8?[0,0]:[(to[0]-a.pos[0])/length*a.speed*a.spaceFactor,(to[1]-a.pos[1])/length*a.speed*a.spaceFactor];}
 updateProximity(h){
  const all=[...this.agents.values()];for(const a of all){a.nearest=Math.min(Infinity,...all.filter(b=>b!==a).map(b=>distance(a.pos,b.pos)));a.spaceFactor=a.nearest<rules.slowDistance?rules.slowFactor:1;a.personal=a.safetyBlocked&&!a.paused?'stop':a.nearest<rules.slowDistance?'slow':'clear';if(this.arrived(a.id)){a.safetyBlocked=false;a.personal=a.nearest<rules.slowDistance?'slow':'clear';}const key='space:'+a.id;if(this.ruleStates.get(key)!==a.personal){this.ruleStates.set(key,a.personal);if(a.personal!=='clear')this.logEvent('space',[a.id],a.personal==='slow'?'Personal space: slow below 1.5 m':'Safety stop: next corridor would breach 0.9 m');}}
  const a=this.get('courier');if(!a)return;a.escapeStep=null;a.prediction=null;a.yielding=false;
  if(!a.paused&&!this.arrived(a.id)){
   let next;try{next=a.edge?.to||this.route(a,(f,t)=>this.canTraverse(a.id,f,t))[1];}catch{next=this.route(a)[1];}
   const va=this.intent(a,next);for(const b of all.filter(b=>b.id.startsWith('shopper'))){const risk=predictedConflict(a.pos,va,b.pos,this.intent(b));if(risk&&(!a.prediction||risk.time<a.prediction.time))a.prediction={...risk,customer:b.id};}
   a.yielding=Boolean(a.prediction&&!a.edge);
   if(a.yielding){a.yieldWait+=h;if(a.yieldWait>2){const customer=this.get(a.prediction.customer);a.escapeStep=this.alternatives(a).filter(p=>this.canTraverse(a.id,a.node,p)&&!predictedConflict(a.pos,this.intent(a,p),customer.pos,this.intent(customer))).sort((x,y)=>distance(x,a.goal)-distance(y,a.goal))[0];if(a.escapeStep)a.yielding=false;}}
   else a.yieldWait=0;
  }else a.yieldWait=0;
  if(this.ruleStates.get('courier-yield')!==a.yielding){this.ruleStates.set('courier-yield',a.yielding);if(a.yielding){a.lastYield={...a.prediction,until:this.time+1.2};this.logEvent('yield',[a.id,a.prediction.customer],`Robot yields: predicted ${a.prediction.distance.toFixed(2)} m in ${a.prediction.time.toFixed(2)} s`,{point:a.prediction.point});}}
 }
 step(dt){
  // Reserve entire swept corridors, not just destination cells. This excludes
  // head-on swaps, diagonal crossings and movement through a paused person.
  let remaining=dt;while(remaining>1e-9){const h=Math.min(remaining,.04);remaining-=h;this.time+=h;this.updateProximity(h);
   for(const a of this.agents.values()){if(a.fixed||a.paused||!a.edge)continue;const e=a.edge,travel=Math.min(a.speed*a.spaceFactor*h,e.length-e.progress);e.progress+=travel;a.distance+=travel;const t=e.progress/e.length;a.pos=[e.from[0]+(e.to[0]-e.from[0])*t,e.from[1]+(e.to[1]-e.from[1])*t];if(t>=1-1e-9){a.node=[...e.to];a.pos=[...e.to];a.edge=null;}}
   const ready=[...this.agents.values()].filter(a=>!a.fixed&&!a.paused&&!a.edge&&!this.arrived(a.id)).sort((a,b)=>(a.id==='courier')-(b.id==='courier')||b.wait-a.wait||a.id.localeCompare(b.id));
   for(const a of ready){if(a.yielding){a.wait+=h;continue;}let to=a.escapeStep;try{to=to||this.route(a,(from,to)=>this.canTraverse(a.id,from,to))[1];}catch{const next=this.route(a)[1];if(next&&this.canTraverse(a.id,a.node,next))to=next;else if(a.wait>1.5)to=this.alternatives(a).filter(p=>this.canTraverse(a.id,a.node,p)&&![...this.agents.values()].some(b=>b.id!==a.id&&distance(p,b.goal)<.1)).sort((x,y)=>distance(x,a.goal)-distance(y,a.goal))[0];}
    if(!to){a.wait+=h;a.safetyBlocked=true;continue;}const fullLength=distance(a.node,to);if(a.id!=='courier'&&fullLength>.8)to=[a.node[0]+(to[0]-a.node[0])*.8/fullLength,a.node[1]+(to[1]-a.node[1])*.8/fullLength];a.edge={from:[...a.node],to:[...to],progress:0,length:distance(a.node,to)};a.heading=Math.atan2(to[0]-a.node[0],to[1]-a.node[1]);a.wait=0;a.safetyBlocked=false;
   }
  }
 }
}
