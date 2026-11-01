// node tests/health-development-test.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function run(loadSave = null){
  const elements = new Map(), store = new Map();
  if(loadSave) store.set('gridiron-life-v4',JSON.stringify(loadSave));
  const randomMath=Object.create(Math);
  randomMath.random=()=>.99999;
  const ctx=vm.createContext({Math:randomMath,console,document:{getElementById(id){
    if(!elements.has(id))elements.set(id,{value:({name:'Jordan Carter',position:'RB',bg:'working',school:'0',height:'69',weight:'155',a_iq:'50',a_behavior:'50'})[id]||'38',style:{},textContent:'',innerHTML:''});
    return elements.get(id);
  }},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},alert:s=>{throw Error(s)},confirm:()=>true});
  for(const name of fs.readdirSync(path.join(root,'js')).filter(n=>n.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),ctx,{filename:name});
  const evaluate=s=>vm.runInContext(s,ctx);
  if(!loadSave)evaluate('start()');
  return {evaluate,store,randomMath,snap:()=>JSON.parse(JSON.stringify(evaluate('game')))};
}
const low=run(), high=run();
const config=`game.phase=0;game.week=2;game.fatigue=22;game.stress=10;game.morale=70;game.teamIntensity=1;game.extraIntensity=1;game.plan.training=10;game.plan.recovery=10;game.plan.study=7;game.plan.social=3;game.health.wear=0;`;
low.evaluate(config);high.evaluate(config);
low.evaluate("registerGameWorkload({carries:5,receptions:1},'Starter')");
high.evaluate("registerGameWorkload({carries:32,receptions:4},'Starter')");
assert(high.evaluate('impact().gameLoad')>low.evaluate('impact().gameLoad')*3,'touches must affect game exertion');
low.evaluate('healthWeek()');high.evaluate('healthWeek()');
const l=low.snap(),h=high.snap();
assert(h.fatigue>l.fatigue,'higher touches result in higher next-week fatigue');
assert(h.health.wear>l.health.wear,'higher touches result in more persistent wear');
assert(h.health.weekReports[0].peak>l.health.weekReports[0].peak,'visible pre-rest peak reflects game load');
assert.equal(h.health.pendingGameLoad,null,'contact is not counted again in a later week');
assert.equal(h.health.weekReports[0].game>0,true);
assert.match(high.evaluate('healthPanel()'),/pre-recovery peak/);
assert.match(high.evaluate('healthPanel()'),/Career wear/);
const currentWear=h.health.wear;
high.evaluate('game.phase=3;game.plan.training=0;game.plan.recovery=25;game.teamIntensity=0;game.extraIntensity=0;healthWeek()');
assert(high.snap().health.wear<currentWear,'summer rest gradually reduces wear');
assert(high.snap().fatigue<h.fatigue,'summer rest reduces short-term fatigue');
// With plenty of recovery the athlete can be fully rested, yet still gain contact wear.
const fullyRested=run();
fullyRested.evaluate(config+'game.fatigue=0;game.plan.training=0;game.teamIntensity=0;game.extraIntensity=0;game.plan.recovery=25;registerGameWorkload({carries:8,receptions:2},"Starter");healthWeek()');
assert.equal(fullyRested.snap().fatigue,0,'full rest is possible after heavy workload');
assert(fullyRested.snap().health.wear>0,'contact wear remains despite full weekly rest');
// An injury restricts gameplay and training; its history survives a save roundtrip.
const hurt=run();hurt.evaluate(config);
hurt.randomMath.random=()=>0;
hurt.evaluate('registerGameWorkload({carries:35,receptions:5},"Starter");healthWeek()');
assert(hurt.snap().injury,'injury chance is active');
assert(hurt.snap().health.injuryHistory.length===1,'injury is saved to the medical record');
hurt.randomMath.random=()=>.99999;
hurt.evaluate('game.gamePending=true;simulateGame()');
const injuredGame=hurt.snap().games[0];
assert.equal(injuredGame.role,'Out (Injury)');
assert.equal(injuredGame.stats.carries,0);
assert.equal(injuredGame.stats.receptions,0);
assert(hurt.snap().health.injuryHistory.length===1);
assert.equal(hurt.snap().health.pendingGameLoad,null);
assert.equal(JSON.parse(hurt.store.get('gridiron-life-v5')).health.injuryHistory.length,1);
// Development math is deliberately unchanged for healthy athletes; no new 80 OVR cap.
const developed=run();
developed.evaluate('game.attrs.speed=99;game.progress.speed=0;game.injury=null;game.plan.training=20;game.focus.speed=20;game.teamIntensity=4;game.extraIntensity=4;development()');
assert.equal(developed.snap().attrs.speed,99,'attribute scale stays 0-99, regardless of school year');
// Legacy-save compatibility is tested with a fabricated v0.4 object. When the
// developer's local export exists, also test that real export without bundling it.
const savedPath=path.resolve(root,'../gridiron-life-save.json');
const example=run().snap();
example.version=4;example.year=2;example.grade=10;
const savesToTest=[example];
if(fs.existsSync(savedPath)) savesToTest.push(JSON.parse(fs.readFileSync(savedPath,'utf8')));
for(const original of savesToTest){
  const copy=JSON.stringify(original);
  const migrated=run(original);
  assert.equal(migrated.snap().version,5);
  assert.equal(migrated.snap().name,'Jordan Carter');
  assert(migrated.snap().health);
  assert.equal(JSON.stringify(original),copy,'source save remains untouched');
  assert.equal(migrated.snap().year,original.year);
}
console.log('PASS: contact-scaled fatigue, pre-recovery peak, lasting wear, summer recovery, medical availability, persistence, unchanged progression, v0.4 import.');
