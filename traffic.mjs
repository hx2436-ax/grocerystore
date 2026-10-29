import {cashier,walkable} from './layout.mjs';
import {path,distance,neighbors} from './navigation.mjs';
export const clearance=.9;
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
export function pointSegment(p,a,b){const ab=sub(b,a),den=dot(ab,ab),t=den?Math.max(0,Math.min(1,dot(sub(p,a),ab)/den)):0;return distance(p,[a[0]+ab[0]*t,a[1]+ab[1]*t]);}
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
export function segmentClearance(a,b,c,d){const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);if(x*y<0&&z*w<0)return 0;return Math.min(pointSegment(a,c,d),pointSegment(b,c,d),pointSegment(c,a,b),pointSegment(d,a,b));}
export class Traffic{
 constructor(){this.agents=new Map();this.reset();}
 reset(){this.agents.clear();this.add('cashier',cashier,{fixed:true});}
 canSpawn(pos){return [...this.agents.values()].every(a=>a.edge?pointSegment(pos,a.edge.from,a.edge.to)>=clearance-1e-8:distance(pos,a.pos)>=clearance-1e-8);}
 add(id,pos,{fixed=false}={}){if(this.agents.has(id))throw Error('Agent already exists.');if(!fixed&&(!walkable(pos)||!this.canSpawn(pos)))return null;const a={id,pos:[...pos],node:[...pos],goal:[...pos],edge:null,speed:.9,paused:true,fixed,distance:0,wait:0,heading:0};this.agents.set(id,a);return a;}
 remove(id){this.agents.delete(id);}
 get(id){return this.agents.get(id);}
 setGoal(id,goal,speed=.9){const a=this.get(id);if(!a||a.fixed)return;if(!walkable(goal))throw Error('Invalid movement goal.');a.goal=[...goal];a.speed=speed;a.paused=false;}
 pause(id,value=true){const a=this.get(id);if(a)a.paused=value;}
 arrived(id){const a=this.get(id);return Boolean(a&&!a.edge&&distance(a.pos,a.goal)<1e-8);}
 canTraverse(id,from,to){for(const b of this.agents.values()){if(b.id===id)continue;const gap=b.edge?segmentClearance(from,to,b.edge.from,b.edge.to):pointSegment(b.pos,from,to);if(gap<clearance-1e-8)return false;}return true;}
 step(dt){
  // Reserve entire swept corridors, not just destination cells. This excludes
  // head-on swaps, diagonal crossings and movement through a paused person.
  let remaining=dt;while(remaining>1e-9){const h=Math.min(remaining,.04);remaining-=h;
   for(const a of this.agents.values()){if(a.fixed||a.paused||!a.edge)continue;const e=a.edge,travel=Math.min(a.speed*h,e.length-e.progress);e.progress+=travel;a.distance+=travel;const t=e.progress/e.length;a.pos=[e.from[0]+(e.to[0]-e.from[0])*t,e.from[1]+(e.to[1]-e.from[1])*t];if(t>=1-1e-9){a.node=[...e.to];a.pos=[...e.to];a.edge=null;}}
   const ready=[...this.agents.values()].filter(a=>!a.fixed&&!a.paused&&!a.edge&&!this.arrived(a.id)).sort((a,b)=>b.wait-a.wait||a.id.localeCompare(b.id));
   for(const a of ready){let to;try{to=path(a.node,a.goal,(from,to)=>this.canTraverse(a.id,from,to))[1];}catch{const next=path(a.node,a.goal)[1];if(next&&this.canTraverse(a.id,a.node,next))to=next;else if(a.wait>1.5)to=neighbors(a.node).filter(p=>this.canTraverse(a.id,a.node,p)&&![...this.agents.values()].some(b=>b.id!==a.id&&distance(p,b.goal)<.1)).sort((x,y)=>distance(x,a.goal)-distance(y,a.goal))[0];}
    if(!to){a.wait+=h;continue;}a.edge={from:[...a.node],to:[...to],progress:0,length:distance(a.node,to)};a.heading=Math.atan2(to[0]-a.node[0],to[1]-a.node[1]);a.wait=0;
   }
  }
 }
}
