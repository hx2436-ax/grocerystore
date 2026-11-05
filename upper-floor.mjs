import * as THREE from 'three';
import {makePerson} from './store-scene.mjs';
import {shelves,goods} from './layout.mjs';
import {floorHeight,relations,advance} from './position-rules.mjs';

// Public coordinates use X / Y(plan depth) / Z(elevation), in metres.
const publicPoint=p=>[p.x,p.z,p.y].map(v=>v.toFixed(2)).join(', ');
export function createUpperFloor({scene,box,label,camera,renderer,controls,customerFlow,courier,staff,pile,traffic,shelfStock}){
 const root=new THREE.Group();scene.add(root);const registry=[],upper=[],markers=new THREE.Group();scene.add(markers);
 const add=(object,name,kind,extra={})=>{const e={object,name,kind,...extra};registry.push(e);return e;};
 const build=(x,y,z,w,h,d,c)=>box(x,y,z,w,h,d,c,root);
 // A rear mezzanine with an external access stair and an open front edge.
 build(8,3.88,12,16,.24,8,0xd9d5c8);for(const x of [1,15])for(const z of [9,15])build(x,1.9,z,.18,3.8,.18,0x89978a);
 build(8,5.3,16,16,2.6,.15,0xe9e6dc);build(0,4.5,12,.14,1,8,0xa9bab0);
 for(const z of [8,15.8]){build(8,4.95,z,16,.08,.08,0x577768);for(let x=.2;x<16;x+=1.2)build(x,4.46,z,.045,.9,.045,0x879d8f);}
 build(16,4.5,14,.12,1,4,0xa9bab0);
 // Two lanes share a broad exterior stair. Opposing visitors never share it.
 build(17, -.12,6,2.5,.24,2,0xb8c4b7);
 for(let i=0;i<24;i++)build(17,(i+1)/6-.09,6+(i+.5)/4,2,.18,.26,0xc8c9bc);
 for(const x of [15.95,18.05]){const rail=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,Math.hypot(6,4),12),new THREE.MeshStandardMaterial({color:0x577768}));rail.position.set(x,2.95,9);rail.rotation.x=Math.atan2(6,4);root.add(rail);}
 build(16.5,3.88,12,3,.24,2,0xd9d5c8); // Landing meets the mezzanine.
 const floorTag=label('LEVEL 2 / HOME + EVERYDAY',8,6.3,15.7,'#436653',1.3);root.attach(floorTag);
 const stairTag=label('STAIRS / UP + DOWN',17,3.4,8,'#55745f',.8);root.attach(stairTag);
 const items=['Stationery','Home essentials','Travel supplies'];
 const shelfEntries=[];
 items.forEach((name,i)=>{const x=4+i*4,fixture=new THREE.Group();root.add(fixture);box(x,4.8,14,2.4,1.6,.7,0xc0ad8e,fixture);for(const h of [4.35,4.85,5.35])box(x,h,13.8,2.5,.06,.9,0xe7ddc4,fixture);
 const entry=add(fixture,name+' shelf','Shelf',{anchor:new THREE.Vector3(x,4,14),level:2});shelfEntries.push(entry);
 const tag=label(name.toUpperCase(),x,5.9,14,'#436653',.85);root.attach(tag);
 for(let n=0;n<9;n++){const product=box(x-.8+n%3*.8,4.52+Math.floor(n/3)*.5,13.65,.3,.28,.3,[0x8aadd1,0xc3ae71,0x88b7a0][i],root);upper.push(add(product,name+' pack '+(n+1),'Product',{on:entry,level:2}));}
 });
 const warm=build(2,4.5,10,1.4,1,1,0xa88763);add(warm,'Warming station','Appliance',{level:2});
 const mug=build(2,5.15,10,.22,.3,.22,0xdcb17b);add(mug,'Coffee cup','Product',{level:2,on:{name:'Warming station'}});
 build(2,5.01,10,1.5,.06,1.1,0xf2e1bd);
 const warmTag=label('ON STATION → KEEP WARM',2,5.9,10,'#a16b25',.7);root.attach(warmTag);
 const inspector=document.createElement('section');inspector.id='position-inspector';inspector.innerHTML='<div class="section-title">POSITION + MOVEMENT</div><div class="floor-buttons"><button id="upper-toggle">Hide level 2</button><button id="upper-play">Start upstairs visit</button></div><p id="upper-state">One visitor uses the stairs at a time. Click a person, product or shelf.</p><div id="position-readout" aria-live="polite">Select an object to inspect its live position.</div><small>Coordinates: (X, Y, Z) metres; Y = plan depth, Z = height. Front = entrance side. Level 2 = +4 m.</small><p class="position-legend">Cyan: selected · Violet: above / below · Green: next to / pickup · Amber: movement / warming</p>';
 document.body.appendChild(inspector);
 const exportBar=document.createElement('div');exportBar.className='floor-buttons';exportBar.innerHTML='<button id="position-photo">Save screenshot</button><button id="position-video">Record 12 s</button>';inspector.appendChild(exportBar);
 function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 document.getElementById('position-photo').onclick=()=>{renderer.render(scene,camera);const canvas=document.createElement('canvas');canvas.width=renderer.domElement.width;canvas.height=renderer.domElement.height;const ctx=canvas.getContext('2d');ctx.drawImage(renderer.domElement,0,0);ctx.fillStyle='#ffffffed';ctx.fillRect(12,12,canvas.width-24,112);ctx.fillStyle='#315744';ctx.font='18px sans-serif';ctx.fillText('CORNER / POSITION + MOVEMENT',24,40);ctx.font='13px sans-serif';ctx.fillText(state.textContent.slice(0,150),24,66);ctx.fillText(readout.innerText.replaceAll('\n',' ').slice(0,150),24,92);canvas.toBlob(blob=>{if(blob)download(blob,'corner-position.png');});};
 document.getElementById('position-video').onclick=()=>{const button=document.getElementById('position-video');if(!renderer.domElement.captureStream||!globalThis.MediaRecorder){button.textContent='Recording unavailable';return;}const stream=renderer.domElement.captureStream(30),recorder=new MediaRecorder(stream),chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=()=>{download(new Blob(chunks,{type:recorder.mimeType}),'corner-movement.webm');stream.getTracks().forEach(t=>t.stop());button.disabled=false;button.textContent='Record 12 s';};recorder.start();button.disabled=true;button.textContent='Recording…';setTimeout(()=>recorder.stop(),12000);};
 const visitor=makePerson(box,0x687fbd);scene.add(visitor);visitor.visible=false;const visitorEntry=add(visitor,'Upstairs visitor','Customer',{level:1});
 let selected=null,active=false,phase='idle',step=0,timer=0,wait=0,needs=[],basket=[],route=[],lastUI=0,visible=true;
 const startPos=[15,0,6],stairRoute=[[16.8,0,6],[17,4,12],[14,4,12]],returnRoute=[[17,4,12],[16.8,0,6],[15,0,6]];
 const ring=new THREE.Mesh(new THREE.RingGeometry(.55,.63,40),new THREE.MeshBasicMaterial({color:0x43d5dd,side:THREE.DoubleSide,depthTest:false}));ring.rotation.x=-Math.PI/2;ring.renderOrder=12;markers.add(ring);ring.visible=false;
 const connector=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xb293e5,depthTest:false}));markers.add(connector);connector.visible=false;
 const motionArrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(),1,0xf2b745,.25,.15);markers.add(motionArrow);motionArrow.visible=false;
 const shelfHalo=new THREE.Box3Helper(new THREE.Box3(),0x42ce87);scene.add(shelfHalo);shelfHalo.visible=false;
 const state=document.getElementById('upper-state'),readout=document.getElementById('position-readout');
 function start(){if(active){active=false;traffic.pause('upperVisitor');document.getElementById('upper-play').textContent='Resume upstairs visit';return;}if(phase==='idle'||phase==='done'){needs=[...items.keys()].sort(()=>Math.random()-.5).slice(0,2);basket=[];step=0;phase='enter';visitor.position.set(3,0,1);visitor.visible=true;}active=true;traffic.pause('upperVisitor',false);document.getElementById('upper-play').textContent='Pause upstairs visit';}
 document.getElementById('upper-play').onclick=start;
 document.getElementById('upper-toggle').onclick=()=>{visible=!visible;root.visible=visible;visitor.visible=phase!=='idle'&&phase!=='done'&&(visible||visitor.position.y<.2);document.getElementById('upper-toggle').textContent=visible?'Hide level 2':'Show level 2';};
 for(const [object,name,kind] of [[courier,'Delivery robot','Robot'],[staff,'Cashier','Person']])add(object,name,kind);
 const fixedShelf=shelves.map((s,i)=>({name:goods[i]+' shelf',kind:'Shelf',anchor:new THREE.Vector3(s.x,0,s.y),bounds:new THREE.Box3(new THREE.Vector3(s.x-s.w/2,0,s.y-s.d/2),new THREE.Vector3(s.x+s.w/2,2.4,s.y+s.d/2)),level:1}));
 function dynamic(){return customerFlow.occupants().filter(s=>!['not yet entered / at entry','exited / at exit'].includes(s.state)).map(s=>({object:customerFlow.objectFor(s.id),name:s.name,kind:'Customer',state:s.state})).filter(e=>e.object?.visible);}
 function anchor(e){return e.anchor?.clone()||e.object.getWorldPosition(new THREE.Vector3());}
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;
 renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
 renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);
 const products=shelfStock.flatMap((g,i)=>g.children.map((object,n)=>({object,name:goods[i]+' item '+(n+1),kind:'Product',on:fixedShelf[i]})));
 const candidates=[...registry,...dynamic(),...products].filter(e=>e.object?.visible&&(e.level!==2||visible));const hits=ray.intersectObjects(scene.children,true);let chosen;
 for(const hit of hits){chosen=candidates.find(e=>{let o=hit.object;while(o){if(o===e.object)return true;o=o.parent;}return false;});if(!chosen)chosen=fixedShelf.find(s=>s.bounds.containsPoint(hit.point));if(!chosen&&hit.object.parent===pile)chosen={object:hit.object,name:'Inbound cargo item',kind:'Cargo',on:{name:'Delivery depot'}};if(chosen)break;}
 selected=chosen||null;});
 function reset(){traffic.remove('upperVisitor');active=false;phase='idle';visitor.visible=false;basket=[];upper.forEach(e=>e.object.visible=true);selected=null;ring.visible=false;connector.visible=false;readout.textContent='Select an object to inspect its live position.';document.getElementById('upper-play').textContent='Start upstairs visit';state.textContent='One visitor uses the stairs at a time. Click a person, product or shelf.';}
 function tick(dt){
 motionArrow.visible=active&&route.length>0&&phase!=='picking'&&(visible||visitor.position.y<.2);shelfHalo.visible=false;
 if(motionArrow.visible){const target=new THREE.Vector3(...route[0]),direction=target.sub(visitor.position),length=Math.min(2,direction.length());motionArrow.position.copy(visitor.position).add(new THREE.Vector3(0,.15,0));motionArrow.setDirection(direction.normalize());motionArrow.setLength(Math.max(.01,length),.22,.13);}
 if(active&&phase==='picking'&&visible){shelfHalo.box.setFromObject(shelfEntries[needs[step]].object);shelfHalo.visible=true;}
 if(active){
 if(phase==='enter'){if(!traffic.get('upperVisitor')){const a=traffic.add('upperVisitor',[3,1]);if(a)traffic.setGoal('upperVisitor',[15,6],.65);}const a=traffic.get('upperVisitor');if(a){visitor.position.set(a.pos[0],0,a.pos[1]);visitor.rotation.y=a.heading;if(traffic.arrived('upperVisitor')){traffic.pause('upperVisitor',true);phase='up';route=stairRoute.map(p=>[...p]);}}}
 else if(phase==='exit'){let a=traffic.get('upperVisitor');if(!a){a=traffic.add('upperVisitor',[15,6]);if(a)traffic.setGoal('upperVisitor',[4,1],.65);}if(a){visitor.position.set(a.pos[0],0,a.pos[1]);visitor.rotation.y=a.heading;if(traffic.arrived('upperVisitor')){traffic.remove('upperVisitor');phase='done';active=false;visitor.visible=false;document.getElementById('upper-play').textContent='New upstairs visit';}}}
 else if(phase==='picking'){wait+=dt;if(wait>=1.5){basket.push(needs[step]);const product=upper.find(e=>e.name.startsWith(items[needs[step]])&&e.object.visible);if(product)product.object.visible=false;step++;wait=0;if(step<needs.length){phase='toward';route=[[4+needs[step]*4,4,12.8]];}else{phase='down';route=returnRoute.map(p=>[...p]);}}}
 else if(route.length){if(phase==='up'&&visitor.position.x>=16.7)traffic.remove('upperVisitor');if(phase==='down'&&route.length===1&&!traffic.get('upperVisitor')){if(!traffic.canSpawn([15,6])||!traffic.canTraverse('upperVisitor',[16.8,6],[15,6]))return;traffic.add('upperVisitor',[15,6]);}const target=route[0],from=visitor.position.toArray(),next=advance(from,target,.65*dt);visitor.position.fromArray(next);visitor.rotation.y=Math.atan2(target[0]-from[0],target[2]-from[2]);if(Math.hypot(...target.map((n,i)=>n-next[i]))<1e-6){route.shift();if(!route.length){if(phase==='up'){phase='toward';route=[[4+needs[0]*4,4,12.8]];}else if(phase==='toward')phase='picking';else if(phase==='down'){phase='exit';traffic.setGoal('upperVisitor',[4,1],.65);}}}}
 visitorEntry.level=visitor.position.y>2?2:1;visitor.visible=visible||visitor.position.y<.2;
 }
 timer+=dt;lastUI+=dt;
 const warming=(.5+.5*Math.sin(timer*3))*.6;mug.material.emissive.setHex(0xffa62d);mug.material.emissiveIntensity=warming;
 const focus=selected||(active?visitorEntry:null);ring.visible=Boolean(focus);connector.visible=false;
 if(focus){const p=anchor(focus);ring.position.set(p.x,p.y+.055,p.z);ring.material.color.setHex(focus===visitorEntry&&phase==='picking'?0x42ce87:0x43d5dd);
 if(lastUI>.15){let others=[...fixedShelf,...registry.filter(e=>e!==focus&&e.object?.visible&&(e.level!==2||visible)),...dynamic()].filter(e=>e!==focus);others.sort((a,b)=>anchor(a).distanceTo(p)-anchor(b).distanceTo(p));const nearby=others.slice(0,3);let rows=nearby.map(e=>{const q=anchor(e),r=relations(p.toArray(),q.toArray());return r.length?`${r.join(' / ')} ${e.name}`:'';}).filter(Boolean);if(focus.on)rows.unshift('On '+focus.on.name);readout.replaceChildren();const title=document.createElement('b');title.textContent=focus.name+' · '+focus.kind;const pos=document.createElement('p');pos.textContent='Position ('+publicPoint(p)+') · Level '+(p.y>=3.8?2:1);const rel=document.createElement('p');rel.textContent=rows.join(' · ');readout.append(title,pos,rel);}
 const other=[...fixedShelf,...shelfEntries].filter(e=>e!==focus).sort((a,b)=>{const pa=anchor(a),pb=anchor(b);return Math.hypot(pa.x-p.x,pa.z-p.z)-Math.hypot(pb.x-p.x,pb.z-p.z);})[0];if(other){const q=anchor(other);connector.geometry.dispose();connector.geometry=new THREE.BufferGeometry().setFromPoints([p.clone().add(new THREE.Vector3(0,.3,0)),q.clone().add(new THREE.Vector3(0,.3,0))]);connector.visible=true;}}
 if(lastUI>.15){lastUI=0;if(active||phase==='done'){const movement={enter:'Into store / Toward stairs',up:'Up the stairs / Into level 2',toward:'Toward shelf',picking:'Next to shelf → Pick up',down:'Down the stairs / Out of level 2',exit:'Toward exit / Out of store',done:'Visit complete'}[phase];state.textContent=movement+' · '+needs.map(i=>items[i]+': '+(basket.includes(i)?'✓ Fulfilled':'Pending')).join(' · ');}}
 }
 return {tick,reset,busy:()=>phase!=='idle'&&phase!=='done',customers(){return phase==='idle'||phase==='done'?[]:[{id:6,name:'Upstairs visitor',state:phase,list:needs.map(i=>({type:9+i,name:items[i],qty:1})),basket:basket.map(i=>({type:9+i,qty:1})),missing:[],order:needs.map(i=>9+i),stop:step}];}};
}
