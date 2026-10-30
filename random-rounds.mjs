export function makeScenario(seed){let n=seed>>>0;const random=()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;},integer=(min,max)=>min+Math.floor(random()*(max-min+1)),shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=integer(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
 const names=shuffle(['Alex','Maya','Noah','Emma','Leo','Zoe','Liam','Ava','Mia','Ethan','Ivy','Owen','Nora','Kai','Ella','Lucas']);
 return {seed:seed>>>0,capacity:integer(24,40),interval:integer(10,18),speed:integer(55,78)/100,openingStock:Array.from({length:9},()=>integer(0,8)),cargo:Array.from({length:9},()=>({qty:integer(1,4),weight:integer(2,22)/10})),colors:shuffle([0xc56b52,0x717cc4,0xceaa40,0x9670ac,0x3f96a3,0xd280a1]),customers:names.slice(0,6).map(name=>({name,list:shuffle([0,1,2,3,4,5,6,7,8]).slice(0,integer(2,4)).map(type=>({type,qty:integer(1,3)})),speedFactor:integer(85,115)/100,arrivalFactor:integer(85,115)/100}))};
}
const freshSeed=()=>globalThis.crypto?.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0]:(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;
export class RandomRounds{
 constructor(){this.number=0;this.scenario=null;this.started={customers:false,robot:false};this.remaining=null;}
 begin(seed=freshSeed()){if(this.scenario?.seed===seed)seed=(seed+1)>>>0;this.number++;this.scenario=makeScenario(seed);this.started={customers:false,robot:false};this.remaining=null;return this.scenario;}
 mark(kind){if(!this.started[kind]){this.started[kind]=true;this.remaining=null;}}
 tick(dt,{customersDone,robotDone}){if(!this.started.customers&&!this.started.robot)return null;const done=(!this.started.customers||customersDone)&&(!this.started.robot||robotDone);if(!done){this.remaining=null;return null;}if(this.remaining===null)this.remaining=3;else this.remaining=Math.max(0,this.remaining-dt);return {remaining:this.remaining,restart:this.remaining===0,start:{...this.started}};}
}
