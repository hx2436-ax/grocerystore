import * as THREE from 'three';
import {freePath as path} from './walking.mjs';
import {blocked,goods,stops,depot,entrance,exit,checkout} from './planner.mjs';
import {measure,complexPath,proximity} from './distance.mjs';

export function createDistanceView({scene,getOccupants,label}){
 const $=id=>document.getElementById(id),fixed=[{id:'depot',name:'Inbound depot (1,1)',pos:depot},{id:'entrance',name:'Customer entrance (3,1)',pos:entrance},{id:'exit',name:'Customer exit (4,1)',pos:exit},{id:'checkout',name:'Checkout queue front (12,3)',pos:checkout},...goods.map((name,i)=>({id:'shelf'+i,name:name+' shelf service point',pos:stops[i+1]}))];
 const cells=[];for(let y=1;y<=15;y++)for(let x=1;x<=15;x++)if(!blocked.has(`${x},${y}`))cells.push({id:`cell:${x},${y}`,name:`Aisle (${x},${y})`,pos:[x,y]});
 const occupants=getOccupants(),occupantNames=occupants.map(o=>({id:o.id,name:o.name})),options=items=>items.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
 const fixedOptions='<optgroup label="Store landmarks">'+options(fixed)+'</optgroup><optgroup label="Any walkable grid location">'+options(cells)+'</optgroup>';
 const allOptions='<optgroup label="Live occupants">'+options(occupantNames)+'</optgroup>'+fixedOptions;
 $('distance-from').innerHTML=allOptions;$('distance-to').innerHTML=allOptions;$('distance-via').innerHTML=fixedOptions;
 $('tour-shopper').innerHTML=options(occupantNames.filter(o=>o.id!=='courier'));
 let via=[],elapsed=0,key='',active=false;const overlay=new THREE.Group();scene.add(overlay);
 const markers=['A','B'].map((t,i)=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle=i?'#237c88':'#cf8431';ctx.beginPath();ctx.arc(32,32,30,0,Math.PI*2);ctx.fill();ctx.fillStyle='white';ctx.font='bold 38px sans-serif';ctx.textAlign='center';ctx.fillText(t,32,46);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthTest:false}));sprite.scale.set(.7,.7,1);sprite.renderOrder=8;sprite.visible=false;scene.add(sprite);return sprite;});
 function resolve(id){const p=[...getOccupants(),...fixed,...cells].find(p=>p.id===id);if(!p)throw Error('Select two valid endpoints.');return p;}
 const format=n=>n.toFixed(2)+' m';
 function line(points,color,dashed=false,height=.23){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p[0],height,p[1]))),m=dashed?new THREE.LineDashedMaterial({color,dashSize:.25,gapSize:.15,depthTest:false}):new THREE.LineBasicMaterial({color,depthTest:false}),l=new THREE.Line(g,m);l.renderOrder=5;if(dashed)l.computeLineDistances();overlay.add(l);}
 function clear(){for(const c of [...overlay.children]){overlay.remove(c);c.geometry?.dispose();c.material?.dispose();}}
 function drawMap(a,b,d,route){const canvas=$('distance-map'),ctx=canvas.getContext('2d'),size=canvas.width,pad=24,step=(size-pad*2)/14,to=p=>[pad+(p[0]-1)*step,size-pad-(p[1]-1)*step];ctx.clearRect(0,0,size,size);ctx.fillStyle='#f4f6f0';ctx.fillRect(0,0,size,size);ctx.lineWidth=1;ctx.strokeStyle='#dfe6da';for(let n=1;n<=15;n++){ctx.beginPath();ctx.moveTo(...to([n,1]));ctx.lineTo(...to([n,15]));ctx.stroke();ctx.beginPath();ctx.moveTo(...to([1,n]));ctx.lineTo(...to([15,n]));ctx.stroke();}for(const k of blocked){const p=to(k.split(',').map(Number));ctx.fillStyle=k==='13,3'?'#597564':'#b8c8ae';ctx.fillRect(p[0]-step*.43,p[1]-step*.43,step*.86,step*.86);}
 const draw=(points,color,dash)=>{ctx.strokeStyle=color;ctx.lineWidth=3;ctx.setLineDash(dash);ctx.beginPath();points.forEach((p,i)=>{const q=to(p);i?ctx.lineTo(...q):ctx.moveTo(...q);});ctx.stroke();ctx.setLineDash([]);};
 if(route)draw(route.points,'#9574bf',[3,4]);draw(d.points,'#237c88',[]);draw([a,b],'#d58a36',[7,5]);
 [a,b].forEach((p,i)=>{const q=to(p);ctx.beginPath();ctx.fillStyle=i?'#237c88':'#d58a36';ctx.arc(q[0],q[1],7,0,Math.PI*2);ctx.fill();ctx.font='bold 14px sans-serif';ctx.fillStyle='#233f34';ctx.fillText(i?'B':'A',q[0]+9,q[1]-8);});ctx.fillStyle='#6c8372';ctx.font='11px sans-serif';ctx.fillText('(1,1)',4,size-5);ctx.fillText('(15,15)',size-51,13);}
 function update(){active=document.body.dataset.mode==='distance';overlay.visible=active&&$('distance-overlay').checked;markers.forEach(m=>m.visible=overlay.visible);if(!active)return;
 try{const a=resolve($('distance-from').value),b=resolve($('distance-to').value),mid=via.map(resolve),d=measure(a.pos,b.pos),r=mid.length?complexPath([a.pos,...mid.map(p=>p.pos),b.pos]):null,threshold=Number($('close-threshold').value),near=proximity(d,threshold);
 const snapshot=JSON.stringify([a,b,mid,threshold,$('distance-overlay').checked]);if(snapshot===key)return;key=snapshot;
 $('endpoint-status').textContent=`A: ${a.name} (${a.pos.map(n=>n.toFixed(2)).join(', ')})${a.state?' · '+a.state:''} → B: ${b.name} (${b.pos.map(n=>n.toFixed(2)).join(', ')})${b.state?' · '+b.state:''}`;
 $('metric-direct').textContent=format(d.direct);$('metric-aisle').textContent=format(d.aisle);$('metric-detour').textContent=`${format(d.extra)} extra · ${d.ratio.toFixed(2)}× detour`;
 const max=Math.max(d.aisle,r?.aisle||0,1);$('bar-direct').style.width=d.direct/max*100+'%';$('bar-aisle').style.width=d.aisle/max*100+'%';$('bar-complex').style.width=(r?.aisle||0)/max*100+'%';
 $('distance-insight').textContent=near.directClose&&!near.aisleClose?`Close by straight line, far by aisle: an agent at A is within ${threshold} m of B geometrically, but must walk ${format(d.aisle)} around obstacles and along aisles.`:near.aisleClose?`Close by both metrics at the ${threshold} m threshold.`:`Far by both metrics at the ${threshold} m threshold.`;
 $('distance-insight').dataset.split=String(near.directClose!==near.aisleClose);
 $('bonus-readout').hidden=!r;$('complex-total').textContent=r?format(r.aisle):'—';$('complex-direct').textContent=r?`Straight segments: ${format(r.directSegments)} · Endpoint direct: ${format(r.direct)}`:'';
 const chain=[a,...mid,b];$('distance-legs').innerHTML=r?r.legs.map((l,i)=>`<tr><td>${i+1}. ${chain[i].name} → ${chain[i+1].name}</td><td>${l.direct.toFixed(2)}</td><td>${l.aisle.toFixed(2)}</td></tr>`).join(''):'';
 $('via-list').textContent=mid.length?mid.map((p,i)=>`${i+1}. ${p.name}`).join(' → '):'No waypoints: comparing the same two endpoints.';
 drawMap(a.pos,b.pos,d,r);clear();if(r)line(r.points,0x9574bf,true,.18);line(d.points,0x237c88);line([a.pos,b.pos],0xd58a36,true,.28);markers[0].position.set(a.pos[0],1.1,a.pos[1]);markers[1].position.set(b.pos[0],1.1,b.pos[1]);$('distance-error').textContent='';
 }catch(e){$('distance-error').textContent=e.message;clear();markers.forEach(m=>m.visible=false);}}
 function refresh(){key='';update();}
 for(const id of ['distance-from','distance-to','close-threshold','distance-overlay'])$(id).addEventListener('change',refresh);
 $('add-waypoint').onclick=()=>{if(via.length>=8){$('distance-error').textContent='Up to eight waypoints per route.';return;}via.push($('distance-via').value);refresh();};$('remove-waypoint').onclick=()=>{via.pop();refresh();};$('clear-waypoints').onclick=()=>{via=[];refresh();};
 $('distance-example').onclick=()=>{$('distance-from').value='cell:6,6';$('distance-to').value='cell:8,6';$('close-threshold').value=3;via=[];refresh();};
 $('shopper-tour').onclick=()=>{const shopper=resolve($('tour-shopper').value);$('distance-from').value='entrance';$('distance-to').value='exit';via=[...shopper.order.map(i=>'shelf'+i),'checkout'];refresh();};
 $('tab-distance').onclick=()=>{document.body.dataset.mode='distance';for(const mode of ['customers','delivery','distance','proximity'])$('tab-'+mode).setAttribute('aria-pressed',String(mode==='distance'));refresh();};
 $('distance-from').value='cell:6,6';$('distance-to').value='cell:8,6';
 update();return {tick(dt){elapsed+=dt;if(elapsed>=.12||active!==(document.body.dataset.mode==='distance')){update();elapsed=0;}}};
}
