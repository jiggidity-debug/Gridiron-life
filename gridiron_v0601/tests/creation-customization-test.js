/* Part 7.1: creation controls, school preview and real-time shared budget. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),els=new Map(),store=new Map();
function el(id){
 if(!els.has(id)){
  const presets={name:'Jordan Carter',position:'QB',bg:'working',school:'0',heightFeet:'5',heightInches:'9',weight:'175',a_iq:'50',a_behavior:'50'};
  els.set(id,{id,value:presets[id]||'38',innerHTML:'',textContent:'',style:{}});
 }
 return els.get(id);
}
const ctx=vm.createContext({console,Math,document:{getElementById:el},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},alert:s=>{throw Error(s)},confirm:()=>true});
for(const n of fs.readdirSync(path.join(root,'js')).filter(n=>n.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',n),'utf8'),ctx,{filename:n});
const ev=s=>vm.runInContext(s,ctx),spent=()=>ev('draftCost(readCreationAttributes())');
assert.match(el('app').innerHTML,/Height feet/);
assert.match(el('app').innerHTML,/School profile/);
assert.match(ev('selectedSchoolStats()'),/Facilities/);
assert.match(ev('selectedSchoolStats()'),/Compare all schools/);
el('school').value='3';ev('showSchoolStats()');
assert.match(el('school-profile').innerHTML,new RegExp(ev('schools[3].name')));
assert.equal(ev('draft.school'),3);
// Spending cannot exceed 100, even after trying to max every slider.
const keys=JSON.parse(JSON.stringify(ev('ATTRS')));
for(const k of keys){const x=el('a_'+k);x.value='70';ev(`showBudget(document.getElementById('a_${k}'))`);assert(spent()<=100);}
assert.equal(spent(),100);
assert.equal(el('remaining-points').textContent,'0 points available');
const first=el('a_'+keys[0]);first.value='38';ev(`showBudget(document.getElementById('a_${keys[0]}'))`);
assert(spent()<100,'lowering a stat must release points');
const second=el('a_'+keys[1]);second.value='70';ev(`showBudget(document.getElementById('a_${keys[1]}'))`);
assert(spent()<=100,'freed points can be reassigned, not overspent');
// Switching positions preserves allocations; form still supplies same numeric attrs.
const before=JSON.stringify(ev('readCreationAttributes()'));
el('heightFeet').value='6';el('heightInches').value='3';ev("setDraftPos('QB')");
assert.equal(JSON.stringify(ev('readCreationAttributes()')),before);
assert.equal(ev('draft.height'),75);
assert.equal(ev('draft.school'),3);
ev('start()');
const state=JSON.parse(JSON.stringify(ev('game')));
assert.equal(state.height,75);assert.equal(state.school.id,3);
assert.equal(state.pos,'QB');assert.equal(state.version,5);
console.log('PASS: Part 7.1 school stats, height feet/inches, shared 100-point limit, reallocation, creation choices and game start.');
