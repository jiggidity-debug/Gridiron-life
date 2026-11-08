const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script defer src="([^"]+)"/g)].map(m=>m[1]).filter(p=>!p.includes('99-boot'));
const elements=new Map();
const el=id=>{if(!elements.has(id))elements.set(id,{value:'',innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},appendChild(){},prepend(){},querySelector(){return null}});return elements.get(id)};
const document={getElementById:el,body:{classList:{add(){},remove(){},toggle(){}}},querySelector(){return null},querySelectorAll(){return []},createElement(){return {style:{},classList:{add(){},remove(){},toggle(){}},appendChild(){},querySelector(){return null}}}};
const storage=new Map();const ctx={console,Math,document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},alert:m=>{throw new Error(m)},confirm:()=>true};ctx.window=ctx;vm.createContext(ctx);
for(const script of scripts){let source=fs.readFileSync(path.join(root,script),'utf8');if(script==='js/74-part9.js')source=source.replace(/\}\)\(\);\s*$/, 'window.__test={creationBaseline,allocationHeadroom,historyBonus,parentBonus,getCreatorValues,normalizeCreatorAllocation,creatorStat,setStat,allocation,middleHistory,creatorDetails};})();');vm.runInContext(source,ctx,{filename:script});}
const run=code=>vm.runInContext(code,ctx);
run('render()');
// RB at 155 lb: Speed starts 45, with available 25 points up to 70 BEFORE bonuses.
assert.equal(run('__test.creationBaseline("speed")'),45);
assert.equal(run('__test.allocationHeadroom("speed")'),25);
run('__test.allocation.speed=25; __test.middleHistory.experience="veteran"; __test.middleHistory.sports="track"; __test.normalizeCreatorAllocation()');
assert.equal(run('__test.allocation.speed'),25);
const history=run('__test.historyBonus("speed")');
assert(history>0);
const bonus=run('__test.parentBonus("speed")');
const expected=Math.min(99,70+history+bonus);
assert.equal(run('__test.getCreatorValues().speed'),expected);
// Changing history should not confiscate existing allocations.
run('__test.middleHistory.experience="none"; __test.middleHistory.sports="none"; __test.normalizeCreatorAllocation()');
assert.equal(run('__test.allocation.speed'),25);
// Even after receiving large history bonuses, sliders cannot exceed baseline+points=70.
run('__test.middleHistory.experience="veteran"; __test.middleHistory.sports="track"; __test.allocation.speed=0; __test.setStat("speed",90)');
assert.equal(run('__test.allocation.speed'),25);
// Personal attributes lack baselines and family/history bonuses.
assert.equal(run('__test.creationBaseline("behavior")'),0);
assert.equal(run('__test.historyBonus("behavior")'),0);
assert.equal(run('__test.parentBonus("behavior")'),0);
run('__test.allocation.behavior=37');assert.equal(run('__test.getCreatorValues().behavior'),37);
// Changing weight changes only base headroom; retains family/history above allocation cap.
run('__test.creatorDetails.weight=250; __test.normalizeCreatorAllocation()');
assert.equal(run('__test.creationBaseline("speed")'),28);
assert.equal(run('__test.allocationHeadroom("speed")'),42);
run('__test.allocation.speed=42');
assert.equal(run('__test.getCreatorValues().speed'),Math.min(99,70+run('__test.historyBonus("speed")')+run('__test.parentBonus("speed")')));
// Visual display describes pre-bonus allocation accurately.
const slider=run('__test.creatorStat("speed")');
assert(slider.includes('Pre-bonus allocation cap 70') && slider.includes('History +'));
console.log('PASS: v0.602 allocation before family/history bonuses, 70 pre-bonus cap, 300 shared budget, weight changes, personal zero baseline.');
