import {freePath} from './walking.mjs';
import {distance,pathLength} from './navigation.mjs';
export const euclidean=distance;
const cache=new Map();
export function measure(a,b){const key=a.join()+'|'+b.join();let points=cache.get(key);if(!points){points=freePath(a,b);if(cache.size>=2048)cache.delete(cache.keys().next().value);cache.set(key,points);}const direct=distance(a,b),aisle=pathLength(points);return {direct,aisle,points,extra:Math.max(0,aisle-direct),ratio:direct>1e-7?aisle/direct:1};}
export function complexPath(positions){if(positions.length<2)throw Error('A route needs a start and an end.');const legs=positions.slice(1).map((p,i)=>measure(positions[i],p));return {legs,aisle:legs.reduce((n,l)=>n+l.aisle,0),directSegments:legs.reduce((n,l)=>n+l.direct,0),direct:distance(positions[0],positions.at(-1)),points:legs.flatMap((l,i)=>i?l.points.slice(1):l.points)};}
export function proximity(d,threshold){if(!Number.isFinite(threshold)||threshold<0)throw Error('The close threshold must be zero or greater.');return {directClose:d.direct<=threshold+1e-7,aisleClose:d.aisle<=threshold+1e-7};}
