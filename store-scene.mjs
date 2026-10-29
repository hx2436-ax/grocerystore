import * as THREE from 'three';
import {shelves,entrance,exit,checkout,counter,cashier} from './layout.mjs';
export function makePerson(box,color,{courier=false,basket=true}={}){const g=new THREE.Group();box(0,.65,0,.36,.62,.3,color,g);const head=new THREE.Mesh(new THREE.SphereGeometry(.16,16,12),new THREE.MeshStandardMaterial({color:0xdfb792}));head.position.y=1.12;g.add(head);box(-.1,.19,0,.12,.38,.15,0x3f4b49,g);box(.1,.19,0,.12,.38,.15,0x3f4b49,g);if(courier)box(0,.65,-.24,.35,.45,.22,0xb7905c,g);else if(basket)box(.24,.46,0,.22,.24,.26,0xc7ad7c,g);return g;}
export function makeRobot(box){const g=new THREE.Group();box(0,.22,0,.62,.2,.6,0x465b62,g);box(0,.4,0,.56,.22,.54,0xe0e8e4,g);box(0,.51,.285,.42,.23,.035,0x182c35,g);for(const x of [-.11,.11]){const led=box(x,.53,.309,.045,.055,.012,0x5adaed,g);led.material.emissive.set(0x5adaed);led.material.emissiveIntensity=1.4;}for(const x of [-.31,.31])for(const z of [-.2,.2]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.11,18),new THREE.MeshStandardMaterial({color:0x26383d}));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.14,z);g.add(wheel);}box(0,.7,.12,.08,.35,.08,0x42575b,g);const lidar=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.08,20),new THREE.MeshStandardMaterial({color:0x273d46}));lidar.position.set(0,.9,.12);g.add(lidar);const beacon=box(0,.79,.12,.14,.055,.14,0x70d0d7,g);beacon.material.emissive.set(0x40d5e9);beacon.material.emissiveIntensity=1;const cargo=new THREE.Group();cargo.position.set(0,.6,-.1);g.add(cargo);for(let i=0;i<8;i++)box((i%2?1:-1)*.125,Math.floor(i/4)*.18,(Math.floor(i%4/2)?1:-1)*.1,.22,.16,.18,0xc7a776,cargo);g.userData.cargo=cargo;g.userData.beacon=beacon;return g;}
export function buildStore({scene,box,label,colors}){
 box(8,-.24,8,16.8,.45,16.8,0xc1c8bd);box(8,-.015,8,16,.07,16,0xeae5d8);
 // Warm ceramic tiles, floor joint lines and a small external sidewalk.
 for(let n=0;n<=16;n++){box(n,.025,8,.014,.008,16,0xd6d1c6);box(8,.025,n,16,.008,.014,0xd6d1c6);}box(8,-.15,-.7,17,.14,1.5,0xc8ceca);
 // Back/right walls are full height; front/left walls are cut down for the dollhouse view.
 box(8,1.55,16,16.25,3.1,.2,0xf4f1e9);box(16,1.55,8,.2,3.1,16.25,0xeee9df);
 box(0,.28,8,.18,.56,16.2,0xd9ddd4);box(10.5,.28,0,11,.56,.18,0xd9ddd4);box(1,.28,0,2,.56,.18,0xd9ddd4);
 box(8,2.75,15.86,16,.17,.05,0x276a51);box(15.86,2.75,8,.05,.17,16,0x276a51);
 // Transparent front windows and double entrance, without an overhead roof.
 for(const [x,w]of [[1,1.8],[10.5,10.8]]){const glass=box(x,1.2,.02,w,1.8,.035,0xafd3d2);glass.material.transparent=true;glass.material.opacity=.13;glass.castShadow=false;}
 for(const x of [2,3.5,5])box(x,1.18,.05,.055,2.35,.06,0x485b52);
 box(3.5,2.39,.05,3.1,.18,.16,0x326d52);label('CORNER / OPEN DAILY',3.5,2.65,.05,'#34654c',1.2);
 box(3.5,.045,.9,2.5,.025,.8,0x657e6e);label('ENTRY  /  EXIT',3.5,.4,.2,'#527e65',.65);
 // A coffee / hot food counter along the left perimeter.
 box(1,.48,7.5,.87,.96,5.8,0xb09572);box(1,1.03,7.5,.95,.12,5.9,0xeee9dc);
 for(const z of [5.7,7.2]){box(1,1.43,z,.65,.72,.7,0x454c49);box(1.02,1.51,z-.36,.36,.27,.025,0x9bc4c0);box(1,1.12,z-.42,.24,.15,.2,0xf2ead7);}box(1,1.48,9,.8,.8,1,0x878f85);label('COFFEE + FOOD TO GO',1,2.16,7.5,'#7d6445',1.1);
 const shelfStock=[];
 shelves.forEach((s,i)=>{const w=s.w-.15,d=s.d-.15;
  if(s.kind==='cooler'){box(s.x,1.1,s.y+.36,w,2.2,.12,0x4c655d);box(s.x-w/2+.05,1.1,s.y,.1,2.2,.85,0x4c655d);box(s.x+w/2-.05,1.1,s.y,.1,2.2,.85,0x4c655d);box(s.x,.1,s.y,w,.16,.85,0x4c655d);box(s.x,2.12,s.y,w,.16,.85,0x4c655d);box(s.x,1.12,s.y+.25,w-.16,1.85,.05,0xdbe8df);for(let door=-1;door<=1;door++){const x=s.x+door*.9;const glass=box(x,1.17,s.y-.5,.84,1.8,.025,0x91b8c0);glass.material.transparent=true;glass.material.opacity=.3;glass.castShadow=false;box(x+.31,1.12,s.y-.54,.035,.48,.035,0xf1efe6);for(const h of [.4,.85,1.3,1.75])box(x,h,s.y-.1,.82,.045,.6,0xc1d2cc);}box(s.x,2.25,s.y,w,.2,.9,colors[i]);}
  else{const wood=s.kind==='bakery'||s.kind==='produce';box(s.x,.17,s.y,w,.28,d,wood?0xb3946c:0x767e73);box(s.x,1,s.y,.08,1.55,d,wood?0xc0a47d:0xe1e2d7);for(const h of [.37,.78,1.19])box(s.x,h,s.y,w,.07,d,wood?0xd7bb90:0xe9e7dd);for(const z of [-d/2,d/2])box(s.x,.97,s.y+z,w,1.5,.055,0xd1d4c6);box(s.x,1.64,s.y,w,.14,d,colors[i]);}
  label(`${i+1}. ${s.name.toUpperCase()}`,s.x,s.kind==='cooler'?2.6:1.98,s.y,'#42634e',.95);const group=new THREE.Group();scene.add(group);shelfStock.push(group);
 });
 // Register faces the entrance. Cashier stands inside a protected staff enclosure.
 box(13,.55,3,.9,1.1,3.7,0x39654f);box(13,1.14,3,1.05,.12,3.9,0xe2d2b5);box(13,1.4,3,.38,.38,.4,0x2d3b35);box(12.75,1.4,3,.04,.26,.3,0x98c4ba);box(14.65,.9,4.35,2.5,1.8,.12,0xd5dacb);box(14.7,1.1,1,1.7,2.1,.7,0xc7c9ba);label('CHECKOUT',12.4,2.15,3,'#36634c',1);
 const staff=makePerson(box,0x356d53,{basket:false});staff.position.set(...[cashier[0],0,cashier[1]]);staff.rotation.y=-Math.PI/2;scene.add(staff);
 for(let i=0;i<6;i++)box(12,.045,3+i,.52,.02,.12,0xc5b47a);
 box(1,.05,1,1.4,.08,1.4,0xb3bc9e);label('DELIVERIES (1,1)',1,1.8,1,'#61754d',.85);
 const courier=makeRobot(box);courier.position.set(1,0,1);scene.add(courier);
 return {shelfStock,courier,staff};
}
