import assert from 'node:assert/strict';
import {createCustomers,tickCustomers,profiles,shoppingOrder} from './shoppers.mjs';
import {blocked,path,entrance,exit,checkout,stops} from './planner.mjs';
assert.equal(new Set(profiles.map(p=>JSON.stringify(p.list))).size,6);
for(const p of profiles){const order=shoppingOrder(p.list);assert.deepEqual([...order].sort(),p.list.map(x=>x.type).sort());const positions=[entrance,...order.map(t=>stops[t+1]),checkout,exit];for(let i=1;i<positions.length;i++)for(const point of path(positions[i-1],positions[i]))assert(!blocked.has(point.join()));}
for(const stock of [Array(9).fill(6),Array(9).fill(0)]){const world=createCustomers(stock),arrivals=[];for(let n=0;n<20000&&!world.customers.every(s=>s.state==='done');n++){const before=world.queue.slice();tickCustomers(world,.025,6);for(const id of world.queue)if(!before.includes(id)&&!arrivals.includes(id))arrivals.push(id);assert(world.stock.every(n=>n>=0));assert(world.customers.filter(s=>s.state==='paying').length<=1);}
assert(world.customers.every(s=>s.state==='done'));assert.equal(world.paidOrder.length,6);assert.deepEqual(world.paidOrder,arrivals);for(const s of world.customers){assert.deepEqual(s.pos,exit);for(const want of s.list){assert.equal(s.basket.filter(x=>x.type===want.type).reduce((n,x)=>n+x.qty,0)+s.missing.filter(x=>x.type===want.type).reduce((n,x)=>n+x.qty,0),want.qty);}}
for(let type=0;type<9;type++){const sold=world.customers.reduce((n,s)=>n+s.basket.filter(x=>x.type===type).reduce((n,x)=>n+x.qty,0),0);assert.equal(world.stock[type]+sold,stock[type]);}}
console.log('PASS: six distinct lists, obstacle-free routes, exact requested quantities, FIFO checkout, one cashier, inventory conservation, no negative stock, sold-out behavior, and all shoppers exit.');
