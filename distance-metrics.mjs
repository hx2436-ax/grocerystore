import {walkable} from './layout.mjs';
import {path,pathLength,neighbors,distance} from './navigation.mjs';
import {pointSegment} from './traffic.mjs';
export const euclidean=distance;const EPS=1e-7,cache=new Map();
function anchors(raw){
 if(!Array.isArray(raw)||raw.length!==2||!raw.every(Number.isFinite))throw Error('Choose a valid aisle position.');const p=raw.map(v=>Math.abs(v-Math.round(v))<EPS?Math.round(v):v);
 if(p.every(Number.isInteger)){if(!walkable(p))throw Error('A measurement endpoint must be in an aisle.');return {point:p,ends:[{node:p,offset:0}],edges:new Set()};}
 const candidates=[];for(const x of new Set([Math.floor(p[0]),Math.ceil(p[0])]))for(const y of new Set([Math.floor(p[1]),Math.ceil(p[1])]))if(walkable([x,y]))candidates.push([x,y]);
 const ends=new Map(),edges=new Set();for(let i=0;i<candidates.length;i++)for(let j=i+1;j<candidates.length;j++){const a=candidates[i],b=candidates[j];if(!neighbors(a).some(n=>n.join()===b.join())||pointSegment(p,a,b)>EPS)continue;edges.add([a.join(),b.join()].sort().join('|'));for(const node of [a,b])ends.set(node.join(),{node,offset:distance(node,p)});}
 if(!ends.size)throw Error('Moving endpoints must be on a legal aisle edge.');return {point:p,ends:[...ends.values()],edges};
}
function cachedPath(a,b){const key=a.join()+'|'+b.join();if(!cache.has(key)){if(cache.size>=2048)cache.delete(cache.keys().next().value);cache.set(key,path(a,b));}return cache.get(key);}
export function measure(a,b){const aa=anchors(a),bb=anchors(b);a=aa.point;b=bb.point;let aisle=Infinity,points=[];if(distance(a,b)<EPS||[...aa.edges].some(e=>bb.edges.has(e))){aisle=distance(a,b);points=[a,b];}
 for(const x of aa.ends)for(const y of bb.ends){const route=cachedPath(x.node,y.node),d=x.offset+pathLength(route)+y.offset;if(d<aisle-EPS){aisle=d;points=[a,...route,b];}}
 points=points.filter((p,i)=>!i||distance(p,points[i-1])>EPS);const direct=distance(a,b);return {direct,aisle,points,extra:Math.max(0,aisle-direct),ratio:direct>EPS?aisle/direct:1};}
export function complexPath(positions){if(positions.length<2)throw Error('A route needs a start and an end.');const legs=positions.slice(1).map((p,i)=>measure(positions[i],p));return {legs,aisle:legs.reduce((n,l)=>n+l.aisle,0),directSegments:legs.reduce((n,l)=>n+l.direct,0),direct:distance(positions[0],positions.at(-1)),points:legs.flatMap((l,i)=>i?l.points.slice(1):l.points)};}
export function proximity(d,threshold){if(!Number.isFinite(threshold)||threshold<0)throw Error('The close threshold must be zero or greater.');return {directClose:d.direct<=threshold+EPS,aisleClose:d.aisle<=threshold+EPS};}
