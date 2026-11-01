/* Part 7: eligibility, real time/cash use, six-week circuit, camps, 7v7 save persistence. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function boot(saved){
 const store=new Map(saved||[]),elements=new Map();
 const ctx=vm.createContext({console,Math,document:{getElementById(id){if(!elements.has(id))elements.set(id,{value:({name:'Test QB',position:'QB',bg:'working',school:'0',heightFeet:'5',heightInches:'11',weight:'180',a_iq:'50',a_behavior:'50'})[id]||'38',innerHTML:'',textContent:'',style:{}});return elements.get(id);}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},alert:s=>{throw Error(s)},confirm:()=>true});
 for(const f of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f});
 return {eval:s=>vm.runInContext(s,ctx),state:()=>JSON.parse(JSON.stringify(vm.runInContext('game',ctx))),store,elements};
}
const t=boot();t.eval('draft.position="QB";start()');
assert.match(t.eval('summerScreen()'),/Seven-on-seven/);
assert.match(t.eval('summerScreen()'),/Skills camps, showcases/);
assert.equal(t.eval('joinSevens()'),false,'not possible during fall');
t.eval('game.phase=3;game.week=1;game.money=500;game.plan={training:0,study:0,work:0,social:0,recovery:0};game.focus={passing:0,reads:0,mobility:0,pocket:0,fitness:0};game.injury=null;');
assert.equal(t.eval('joinSevens()'),true);
assert.equal(t.eval('sevensWeeklyHours()'),4);
assert.equal(t.eval('allHours()'),4);
assert.equal(t.eval('joinSevens()'),false,'cannot join same circuit twice');
const before=t.state().summer.exposure;
const skill0=t.state().attrs.accuracy;
t.eval('simulateSevenOnSevenWeek()');
assert.equal(t.state().summer.circuits[0].games.length,1);
assert.equal(t.state().summer.circuits[0].games[0].round,1);
assert('att' in t.state().summer.circuits[0].games[0].stats);
t.eval('simulateSevenOnSevenWeek()');assert.equal(t.state().summer.circuits[0].games.length,1,'no duplicate within same week');
assert(t.state().summer.exposure>=before);
assert.equal(t.state().attrs.accuracy,skill0,'7v7 awards progress, not immediate OVR changes');
assert(t.state().summer.fieldWorkloadThisWeek>0);
t.eval('healthWeek()');assert(t.state().health.weekReports[0].field>0,'7v7 exertion influences fatigue');
t.eval('summerState().fieldWorkloadThisWeek=0;');
// Circuit operates weekly, even after saving/reloading.
const reloaded=boot([['gridiron-life-v5',JSON.stringify(t.state())]]);
assert.equal(reloaded.state().summer.circuits[0].games.length,1);
for(let week=2;week<=6;week++){
 reloaded.eval('game.week='+week+';simulateSevenOnSevenWeek()');
}
let c=reloaded.state().summer.circuits[0];
assert(c.finished,'circuit ends within six weeks (or earlier elimination)');
assert(c.games.length>=4&&c.games.length<=6);
assert.equal(reloaded.eval('sevensWeeklyHours()'),0,'after completion, 4h released');
assert.match(reloaded.eval('historyScreen()'),/Summer football history/);
assert.match(reloaded.eval('summerScreen()'),/Regional|seven-on-seven/i);
// Camps cost actual hours and money, cannot double attend.
reloaded.eval('game.week=7;game.money=500;game.plan={training:0,study:0,work:0,social:0,recovery:0};game.activityHoursThisWeek=0;game.injury=null;');
assert.equal(reloaded.eval('attendCamp("school-day")'),true);
assert.equal(reloaded.state().money,500,'school-sponsored instruction free');
assert.equal(reloaded.state().activityHoursThisWeek,5);
assert.equal(reloaded.eval('attendCamp("school-day")'),false,'repeat blocked');
reloaded.eval('chooseCampFocus("passing")');
assert.equal(reloaded.eval('attendCamp("combine")'),true);
assert.equal(reloaded.state().money,445,'combine fee applied');
assert(reloaded.state().summer.camps[0].measurements.forty>4);
assert(reloaded.state().summer.camps[0].measurements.shuttle>3);
assert.match(reloaded.eval('summerScreen()'),/40 yd/);
assert.equal(reloaded.eval('attendCamp("regional")'),false,'sophomore is needed');
reloaded.eval('game.grade=10;game.week=8;game.summer.exposure=20;game.activityHoursThisWeek=0;');
assert.equal(reloaded.eval('attendCamp("elite")'),true,'earned invitational may be attended with time and funds');
assert(reloaded.state().summer.camps.some(x=>x.id==='school-day'));
// 4-hour schedule reservation blocks oversubscription.
const u=boot();u.eval('draft.position="QB";start();game.phase=2;game.week=1;game.plan={training:30,study:0,work:0,social:0,recovery:0};');
assert.equal(u.eval('joinSevens()'),false);
u.eval('game.plan.training=24;joinSevens()');assert.equal(u.eval('sevensWeeklyHours()'),4);
assert.equal(u.eval('allHours()'),28);
const wr=boot();wr.eval('document.getElementById("position").value="WR";draft.position="WR";start();game.phase=3;game.week=1;game.plan={training:0,study:0,work:0,social:0,recovery:0};joinSevens();simulateSevenOnSevenWeek()');
let w=wr.state().summer.circuits[0].games[0].stats;
assert('targets' in w && 'catches' in w && !('att' in w),'receivers have proper 7v7 game stats');
console.log('PASS: Part 7 QB/WR participation, 4h commitment, 6-week competition, saves, free/paid camps, combine, health, no repeats.');
