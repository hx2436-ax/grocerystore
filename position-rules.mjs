export const floorHeight=4;
export function relations(a,b){
 const dx=a[0]-b[0],dy=a[1]-b[1],dz=a[2]-b[2],horizontal=Math.hypot(dx,dz),out=[];
 if(dy>1.8)out.push('Above');if(dy< -1.8)out.push('Below');
 if(Math.abs(dy)<1.8){if(horizontal<1.2)out.push('Next to');if(horizontal>6)out.push('Far from');if(dx<-.6)out.push('Left of');if(dx>.6)out.push('Right of');if(dz<-.6)out.push('In front of');if(dz>.6)out.push('Behind');}
 return out;
}
export function advance(position,target,amount){const d=Math.hypot(...target.map((n,i)=>n-position[i]));return d<=amount?[...target]:position.map((n,i)=>n+(target[i]-n)*amount/d);}
