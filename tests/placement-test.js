const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function testGame(){
 const el=new Map(),data=new Map();
 const getElementById=id=>{if(!el.has(id)){let value=id==='name'?'Test QB':id==='position'?'QB':id==='bg'?'working':id==='school'?'0':id==='a_iq'||id==='a_behavior'?'50':id==='height'?'70':id==='weight'?'165':'38';el.set(id,{value,innerHTML:'',style:{},textContent:''})}return el.get(id)};
 const ctx=vm.createContext({console,Math,document:{getElementById},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},alert:t=>{throw Error(t)},confirm:()=>true});
 for(const name of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),ctx,{filename:name});
 const evaluate=s=>vm.runInContext(s,ctx),save=()=>JSON.parse(JSON.stringify(evaluate('game')));
 evaluate('schools[0].classif=6;start()');return{evaluate,save,el,data};
}
let t=testGame();
t.evaluate("game.pos='QB';game.grade=9;game.year=1;game.placement=null;game.team.forEach(x=>{for(const k of ATTRS)x.attrs[k]=x.grade===12?66:x.grade===11?58:x.grade===10?55:47;x.ovr=rating(x.attrs,'QB')});for(const k of ATTRS)game.attrs[k]=56;game.coachTrust=50");
let d=t.evaluate('depth()');
assert.equal(d.level,'Freshman','player should stay on freshman by default when not ready to promote');
assert.equal(d.squads.Varsity.filter(x=>x.grade===12).length,5);
// Malik: sophomore who is not the best varsity QB starts JV rather than being
// parked as a varsity reserve. A varsity reserve can dress without losing JV start.
t.evaluate("game.team.find(x=>x.grade===10).name='Malik Young';for(const k of ATTRS)game.team.find(x=>x.grade===10).attrs[k]=62;game.placement=null");
d=t.evaluate('depth()');
let malik=t.evaluate("game.team.find(x=>x.name==='Malik Young').id");
assert.equal(d.starters.JV,malik,'Malik starts JV instead of being a varsity bench player');
assert(!d.squads.Varsity.some(x=>x.id===malik));
assert(d.dressed.Varsity.includes(malik),'Malik can suit up as varsity cover without losing JV starts');
t.evaluate("setSquadPreference('Freshman')");
assert.equal(t.evaluate('depth().level'),'Freshman');
assert.equal(t.evaluate('depth().decision').includes('accepted'),true);
t.evaluate('setDualSquad(true)');
assert.equal(t.evaluate('depth().dressLevel'),'JV','a good freshman may dress for JV while primarily playing freshman');
// An impossible varsity request is handled as a declined request and does not
// silently promote an underprepared freshman.
t.evaluate("for(const k of ATTRS)game.attrs[k]=25;game.placement=null;setSquadPreference('Varsity')");
d=t.evaluate('depth()');
assert.equal(d.level,'Freshman');
assert.match(d.decision,/declined/);
// Grade 10/11 QB + Malik competing: higher OVR Malik receives Varsity start,
// player is evaluated for JV instead of being automatically placed above him.
t.evaluate("game.grade=10;game.year=2;game.phase=0;game.week=1;game.squadPreference='Auto';game.dualSquad=true;for(const k of ATTRS)game.attrs[k]=77;game.team.forEach(x=>{for(const k of ATTRS)x.attrs[k]=x.grade===12?70:x.grade===11?75:x.grade===10?50:40});let m=game.team.find(x=>x.name==='Malik Young');m.grade=11;for(const k of ATTRS)m.attrs[k]=82;game.placement=null;");
d=t.evaluate('depth()');
assert.equal(d.starters.Varsity,malik,'highest-rated Malik starts varsity over lower-rated user');
assert.equal(d.level,'JV','player gets a meaningful lower-squad role when best JV QB');
assert.equal(d.role,'Starter');
assert.equal(d.dressLevel,'Varsity','player can start JV and suit up varsity as backup');
t.evaluate("setSquadPreference('Varsity')");
d=t.evaluate('depth()');
assert.equal(d.level,'Varsity');assert.equal(d.role,'Rotation');assert.equal(d.starters.Varsity,malik);
t.evaluate("setSquadPreference('JV')");
d=t.evaluate('depth()');assert.equal(d.level,'JV');assert.equal(d.role,'Starter');
let g=t.save();assert.equal(g.squadPreference,'JV');assert.equal(g.dualSquad,true);
// Track starts after football week; when simulating JV, varsity and JV both have
// their actual named starters counted, never falsely counting player as varsity starter.
t.evaluate('game.schedule=createSchedule();game.gamePending=true;simulateGame()');
g=t.save();assert.equal(g.games[0].level,'JV');assert.equal(g.games[0].upperDress,'Varsity');
assert.equal(g.positionStarts.you.JV,1);assert.equal(g.positionStarts.you.Varsity,0);
assert.equal(g.positionStarts[malik].Varsity,1);
assert.match(t.el.get('app').innerHTML,/Higher-team backup duty/);
// Existing save restoration: cache retains choice and real primary/dress split.
let stored=JSON.parse(t.data.get('gridiron-life-v5'));
assert.equal(stored.squadPreference,'JV');assert.equal(stored.dualSquad,true);
assert.equal(stored.positionStarts.you.JV,1);
// At fall week 6, reevaluate; do not award fake starts or reset choices.
t.evaluate('game.week=6;game.placement=null');
let mid=t.evaluate('depth()');assert.equal(mid.level,'JV');
assert.equal(t.evaluate('game.positionStarts.you.JV'),1);
// 1A schools have only varsity. No ineligible freshman/JV choice or phantom dual assignment.
t.evaluate("game.school.classif=1;game.grade=9;game.squadPreference='Freshman';game.placement=null");
d=t.evaluate('depth()');assert.equal(d.level,'Varsity');assert.equal(d.dressLevel,null);assert.match(d.decision,/unavailable/);
console.log('PASS: coach-controlled starters, Malik JV-to-varsity development, player squad requests, dual duty, recorded starts, save, age and 1A rules.');
// Position-room relationships are named, consume hours, reject duplicate weekly
// visits, and persist memories. A scheduled story remembers its NPC.
let r=testGame();
r.evaluate("game.plan={training:0,study:0,work:0,social:0,recovery:0};game.activityHoursThisWeek=0;game.gigHoursThisWeek=0");
const person=r.evaluate('game.team[0].id');
r.evaluate(`teamInteraction('${person}','film')`);
let m=r.save().teammateMemories[person];
assert.equal(m.rapport,54);assert.equal(m.meetings,1);assert.equal(r.save().activityHoursThisWeek,2);
r.evaluate(`teamInteraction('${person}','competition')`);
assert.equal(r.save().teammateMemories[person].meetings,1,'once per NPC per week');
r.evaluate('game.week=2;game.activityHoursThisWeek=0');
r.evaluate(`teamInteraction('${person}','encouragement')`);
assert.equal(r.save().teammateMemories[person].meetings,2);assert.equal(r.save().activityHoursThisWeek,1);
r.evaluate("game.scheduledEvent=null;game.eventCount=2;game.eventLast={};game.phase=0;game.teamIntensity=2;game.stress=10;game.familyExpect=8;Object.keys(game.academics.courses).forEach(k=>game.academics.courses[k]=80);maybeEvent()");
assert.equal(r.save().scheduledEvent.kind,'position');
const evId=r.save().scheduledEvent.npcId,meetings=r.save().teammateMemories[evId]?.meetings||0;
r.evaluate('chooseEvent(1)');
assert.equal(r.save().teammateMemories[evId].meetings,meetings+1);
assert.equal(r.save().scheduledEvent,null);
console.log('PASS: named teammate film, competitiveness, time cost, no duplicate visits, rival story and persistent memories.');
