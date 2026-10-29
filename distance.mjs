import {blocked,path} from './planner.mjs';

const EPS=1e-8,cache=new Map();
const equal=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<EPS;
const normalize=p=>p.map(v=>Math.abs(v-Math.round(v))<EPS?Math.round(v):v);
export const euclidean=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function walkable(p){return p.every(v=>Number.isInteger(v)&&v>=1&&v<=15)&&!blocked.has(p.join());}
function anchors(raw){
 if(!Array.isArray(raw)||raw.length!==2||!raw.every(Number.isFinite))throw Error('Choose a valid aisle position.');
 const p=normalize(raw),axis=p.findIndex(v=>!Number.isInteger(v));
 if(axis<0){if(!walkable(p))throw Error('A measurement endpoint must be in an aisle.');return [{node:p,offset:0}];}
 if(!Number.isInteger(p[1-axis]))throw Error('Moving occupants must be on an aisle edge.');
 const ends=[Math.floor(p[axis]),Math.ceil(p[axis])].map(v=>{const node=[...p];node[axis]=v;return {node,offset:Math.abs(v-p[axis])};});
 if(!ends.every(a=>walkable(a.node)))throw Error('A measurement endpoint cannot cross an obstacle or boundary.');
 return ends;
}
function cachedPath(a,b){const key=a.join()+'|'+b.join();if(!cache.has(key)){if(cache.size>=2048)cache.delete(cache.keys().next().value);cache.set(key,path(a,b));}return cache.get(key);}
function sameEdge(a,b){for(let axis=0;axis<2;axis++)if(a[1-axis]===b[1-axis]&&Math.floor(a[axis])===Math.floor(b[axis]))return true;return false;}
export function measure(a,b){
 const aa=anchors(a),bb=anchors(b);a=normalize(a);b=normalize(b);let aisle=Infinity,points=[];
 if(equal(a,b)||sameEdge(a,b)){aisle=euclidean(a,b);points=[a,b];}
 for(const x of aa)for(const y of bb){const route=cachedPath(x.node,y.node),d=x.offset+route.length-1+y.offset;if(d<aisle-EPS){aisle=d;points=[a,...route,b];}}
 points=points.filter((p,i)=>i===0||!equal(p,points[i-1]));
 const direct=euclidean(a,b);return {direct,aisle,points,extra:Math.max(0,aisle-direct),ratio:direct>EPS?aisle/direct:1};
}
export function complexPath(positions){if(positions.length<2)throw Error('A route needs a start and an end.');const legs=positions.slice(1).map((p,i)=>measure(positions[i],p));return {legs,aisle:legs.reduce((n,l)=>n+l.aisle,0),directSegments:legs.reduce((n,l)=>n+l.direct,0),direct:euclidean(positions[0],positions.at(-1)),points:legs.flatMap((l,i)=>i?l.points.slice(1):l.points)};}
export function proximity(d,threshold){if(!Number.isFinite(threshold)||threshold<0)throw Error('The close threshold must be zero or greater.');return {directClose:d.direct<=threshold+EPS,aisleClose:d.aisle<=threshold+EPS};}
