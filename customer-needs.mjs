import {goods} from './layout.mjs';

export function customerNeeds(customers){
 return customers.filter(s=>s.state!=='arriving'&&s.state!=='done').map(s=>{
  const needs=s.list.map(item=>{const collected=s.basket.filter(x=>x.type===item.type).reduce((n,x)=>n+x.qty,0),missing=s.missing.filter(x=>x.type===item.type).reduce((n,x)=>n+x.qty,0);const status=collected>=item.qty?'fulfilled':missing>0?'unavailable':s.state==='picking'&&s.order[s.stop]===item.type?'picking':collected>0?'partial':'pending';return {type:item.type,item:goods[item.type],required:item.qty,collected,missing,status};});
  return {id:s.id,name:s.name,state:s.state,needs,required:needs.reduce((n,x)=>n+x.required,0),collected:needs.reduce((n,x)=>n+x.collected,0),fulfilled:needs.every(x=>x.status==='fulfilled')};
 });
}
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={fulfilled:'✓ Fulfilled',pending:'Pending',partial:'Partial',picking:'Picking',unavailable:'Short stock'};
export function createNeedsView(palette){let previous='';return {update(customers,running){const roster=customerNeeds(customers),key=JSON.stringify([roster,running]);if(key===previous)return;previous=key;const $=id=>document.getElementById(id);$('needs-count').textContent=`${roster.length} in store`;$('needs-summary').textContent=`${roster.reduce((n,s)=>n+s.collected,0)} / ${roster.reduce((n,s)=>n+s.required,0)} items collected${roster.length&&!running?' · Paused':''}`;
 const head='<thead><tr><th scope="col">Customer</th><th scope="col">Item needed</th><th scope="col">Collected / Needed</th></tr></thead>';
 $('needs-table').innerHTML=head+(roster.length?roster.map(s=>`<tbody data-customer="${s.id}" class="${s.fulfilled?'customer-fulfilled':''}">${s.needs.map((need,i)=>`<tr>${i===0?`<th scope="rowgroup" rowspan="${s.needs.length}" class="needs-person"><span class="needs-name" style="--person-color:#${palette[s.id].toString(16)}">${escape(s.name)}</span><small>${escape(s.state)}</small><span class="needs-person-total">${s.collected}/${s.required} items</span></th>`:''}<td>${escape(need.item)}</td><td class="need-result ${need.status}" data-status="${need.status}"><strong>${need.collected} / ${need.required}</strong><small>${labels[need.status]}</small></td></tr>`).join('')}</tbody>`).join(''):'<tbody><tr><td colspan="3" class="needs-empty">No customers in store.<br><small>Customers appear here after entering and disappear after exiting.</small></td></tr></tbody>');
 }};}
