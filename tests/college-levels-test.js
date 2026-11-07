const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function init(){
 const storage=new Map(),els=new Map();const defaults={name:'Taylor Banks',position:'QB',school:'0',bg:'working',hometown:'Texas',jersey:'11',hand:'Right',heightFeet:'6',heightInches:'2',weight:'180',a_iq:'50',a_behavior:'50'};
 const context=vm.createContext({Math,console,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{getElementById:id=>{if(!els.has(id))els.set(id,{value:defaults[id]||(id.startsWith('a_')?'38':''),textContent:'',style:{},innerHTML:''});return els.get(id)},querySelector:()=>null},alert:msg=>{throw Error(msg)},confirm:()=>true});
 for(const f of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),context,{filename:f});
 return {run:x=>vm.runInContext(x,context),get:()=>JSON.parse(JSON.stringify(vm.runInContext('game',context))),html:()=>els.get('app')?.innerHTML||'',storage};
}
const t=init();t.run('start();game.grade=12;game.year=4;startNextSchoolYear()');let g=t.get();
assert.equal(g.stage,'recruiting');assert.equal(g.recruiting.colleges.length,685);
for(const [tier,count] of Object.entries({FBS:136,FCS:129,D2:160,D3:100,NAIA:100,JUCO:60})) assert.equal(g.recruiting.colleges.filter(x=>x.tier===tier).length,count);
assert.equal(new Set(g.recruiting.colleges.map(x=>x.id)).size,685);
assert.equal(new Set(g.recruiting.colleges.map(x=>x.name)).size,685);
assert(g.recruiting.offers.every(x=>!x.offer||g.recruiting.colleges[x.id].tier!=='D3'));
for(const tier of ['FBS','FCS','D2','D3','NAIA','JUCO']){t.run(`collegeViewTier='${tier}';render()`);assert.match(t.html(),new RegExp(tier==='D2'?'Division II':tier==='D3'?'Division III':tier));}
const juco=g.recruiting.colleges.find(x=>x.tier==='JUCO');t.run(`collegeSign(${juco.id},true)`);g=t.get();assert.equal(g.college.program.tier,'JUCO');
for(let season=0;season<2;season++){
 for(let j=0;j<12;j++)t.run('collegeSimGame()');g=t.get();let tries=0;while(g.college.phase==='postseason'&&tries++<3){t.run('collegeSimGame()');g=t.get()}
 assert(['offseason','jucoGraduation'].includes(g.college.phase));
 if(season===0)t.run('collegeNextYear()');
}
g=t.get();assert.equal(g.college.phase,'jucoGraduation');assert.equal(g.college.eligibilityUsed,2);assert.equal(g.college.yearHistory.length,2);assert.match(t.html(),/JUCO graduation/);
const eligible=t.run("collegeTransferOptions().find(x=>x.program.tier==='FCS'&&x.interest>=25)?.program.id");assert.notEqual(eligible,undefined);
t.run('collegeTransfer('+eligible+')');g=t.get();assert.equal(g.college.program.tier,'FCS');assert.equal(g.college.phase,'offseason');assert.equal(g.college.pathHistory.length,1);
t.run('collegeNextYear()');g=t.get();assert.equal(g.college.year,3);assert.equal(g.college.eligibilityUsed,2);
assert(g.college.schedule.every(m=>g.college.programs.find(p=>p.id===m.id).tier==='FCS'));
const bytes=Buffer.byteLength(t.storage.get('gridiron-life-v5')||'');assert(bytes<1500000,'Save should be small; current '+bytes);
console.log('PASS six tiers 685 unique programs, no DIII athletic aid, tier-aware schedules, JUCO 2-year graduation, JUCO->FCS transfer, eligibility preserved, small save '+bytes+' bytes');
