/* Character-creation position guidance reflects the actual overall formula. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const els=new Map(),store=new Map();
function el(id){
 if(!els.has(id)){
  const presets={name:'Jordan Carter',position:'QB',bg:'working',school:'0',heightFeet:'5',heightInches:'9',weight:'175',a_iq:'50',a_behavior:'50'};
  els.set(id,{id,value:presets[id]||'38',innerHTML:'',textContent:'',style:{}});
 }
 return els.get(id);
}
const ctx=vm.createContext({console,Math,document:{getElementById:el,querySelector:()=>null},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},alert:s=>{throw Error(s)},confirm:()=>true});
for(const n of fs.readdirSync(path.join(root,'js')).filter(n=>n.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',n),'utf8'),ctx,{filename:n});
const ev=s=>vm.runInContext(s,ctx);
for(const pos of JSON.parse(JSON.stringify(ev('Object.keys(GROUPS)')))){
 const primary=JSON.parse(JSON.stringify(ev(`creationPositionKeys('${pos}')`)));
 assert.equal(primary.length,10,`${pos}: OVR uses ten slots`);
 assert.equal(new Set(primary).size,10,`${pos}: unique rating skills`);
 ev(`draft.position='${pos}'`);
 const html=ev('setupScreen()');
 assert.match(html,new RegExp('PRIMARY · '+pos+' POSITION ATTRIBUTES'));
 for(const key of primary)assert.match(html,new RegExp('id="a_'+key+'"'));
 assert.match(html,/id="projected-ovr"/);
 assert.match(html,/Other athletic attributes/);
 assert.match(html,/PERSONAL ATTRIBUTES/);
 assert.equal(ev(`creationProjectedOvr(Object.fromEntries(ATTRS.map(x=>[x,38])), '${pos}')`),38);
 const strengths=ev(`Object.fromEntries(ATTRS.map(x=>[x,38]))`);
 // Raise every position-relevant stat by 10: exactly +10 overall.
 assert.equal(ev(`creationProjectedOvr({...Object.fromEntries(ATTRS.map(x=>[x,38])),...Object.fromEntries(creationPositionKeys('${pos}').map(x=>[x,48]))},'${pos}')`),48);
}
// The projected overall responds to allocation changes.
ev("draft.position='QB'");
const sliders=JSON.parse(JSON.stringify(ev('ATTRS')));
for(const k of sliders)el('a_'+k).value='38';
el('a_iq').value='50';el('a_behavior').value='50';
el('a_accuracy').value='70';
ev('showBudget(document.getElementById("a_accuracy"))');
assert.equal(el('projected-ovr').textContent,'41 OVR');
console.log('PASS: all 22 positions display exact OVR skills and live overall projection.');
