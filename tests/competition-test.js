/* Part 4: season formats, qualification, bracket wins/losses, and save persistence. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
function boot(preload){
 const elements=new Map(),store=new Map(Object.entries(preload||{}));
 const document={getElementById(id){if(!elements.has(id)){
  let value=id==='name'?'Jordan Carter':id==='position'?'RB':id==='bg'?'working':id==='school'?'0':id==='height'?'70':id==='weight'?'180':id==='a_iq'||id==='a_behavior'?'50':'38';
  elements.set(id,{value,innerHTML:'',textContent:'',style:{}})}return elements.get(id)}};
 const ctx=vm.createContext({console,Math,document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},alert:s=>{throw Error(s)},confirm:()=>true});
 for(const f of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f});
 const exec=s=>vm.runInContext(s,ctx),state=()=>JSON.parse(JSON.stringify(exec('game')));
 return {ctx,exec,state,store,document};
}
function resolve(t){if(t.state().scheduledEvent)t.exec('chooseEvent(0)')}
function doGame(t){resolve(t);t.exec('nextWeek()');assert(t.state().gamePending);t.exec('simulateGame()');resolve(t)}
let a=boot();a.exec('schools[0].classif=1;start()');
assert.equal(a.state().schedule.length,10);
assert.equal(a.state().competition.teams.length,8);
assert.equal(a.state().competition.regularWeeks,10);
assert.equal(new Set(a.state().schedule.filter(x=>x.district).map(x=>x.opponentLeagueId)).size,7);
assert.equal(a.state().schedule.filter(x=>x.district).length,7);
for(let i=0;i<9;i++)doGame(a);
assert.equal(a.state().games.length,9);
assert.equal(a.state().competition.playedWeeks.length,9);
assert.equal(a.state().competition.teams[0].record.reduce((x,y)=>x+y,0),9);
// Force a last place finish for this test; the season must end without phantom extra games.
a.exec('game.competition.teams.find(t=>t.id==="school").districtRecord=[0,99]');
doGame(a);
let g=a.state();
assert.equal(g.games.length,10);
assert.equal(g.phase,1,'season ends immediately after Week 10 if out of playoffs');
assert.equal(g.competition.postseason.status,'missed');
assert.equal(g.competition.postseason.rounds.length,6);
assert(g.competition.postseason.championId);
assert.equal(g.competition.teams.filter(t=>t.districtRecord[0]+t.districtRecord[1]>=7).length,8);
a.exec("tab='team';render()");
assert.match(a.document.getElementById('app').innerHTML,/District standings/);
assert.match(a.document.getElementById('app').innerHTML,/State playoffs/);
assert.match(a.document.getElementById('app').innerHTML,/Bi-District/);
console.log('PASS: 10 games, 7 district opponents, standings, 64-team bracket, non-qualifier transitions to winter.');

let b=boot();b.exec('schools[0].classif=1;start()');
for(let i=0;i<9;i++)doGame(b);
b.exec('game.competition.teams.find(t=>t.id==="school").districtRecord=[99,0]');
doGame(b);g=b.state();
assert.equal(g.phase,0,'qualifying school should remain in fall for postseason');
assert.equal(g.week,11);
assert.equal(g.competition.postseason.status,'active');
assert.equal(g.competition.postseason.rounds[0].matches.length,32);
assert.equal(g.competition.postseason.teams.length,64);
assert.equal(b.exec('currentMatchup().round'),'Bi-District');
const exported=b.store.get('gridiron-life-v5');
let reloaded=boot({'gridiron-life-v5':exported});
assert.equal(reloaded.state().competition.postseason.status,'active');
assert.equal(reloaded.exec('currentMatchup().round'),'Bi-District');
// Take the genuine simulateGame path; either a win advances or a defeat ends the run.
doGame(reloaded);g=reloaded.state();
assert.equal(g.games.length,11);
assert.equal(g.games[0].playoff,true);
assert.equal(g.games[0].round,'Bi-District');
assert.equal(g.games[0].opponentName.length>0,true);
if(g.games[0].win){
 assert.equal(g.phase,0);
 assert.equal(g.week,12);
 assert.equal(g.competition.postseason.rounds[1].name,'Area');
}else{
 assert.equal(g.phase,1);
 assert.equal(g.competition.postseason.status,'eliminated');
 assert(g.competition.postseason.championId);
}
console.log('PASS: qualifier reaches playoff game, has named six-round bracket, saves and resumes, advances or exits properly.');

// Force a simulated six-round school championship to test every bracket transition.
let c=boot();c.exec('schools[0].classif=1;start()');
for(let i=0;i<9;i++)doGame(c);
c.exec('game.competition.teams.find(t=>t.id==="school").districtRecord=[99,0]');
doGame(c);
for(let i=0;i<6;i++){
 assert.equal(c.state().competition.postseason.roundIndex,i);
 assert.equal(c.exec('currentPlayoffMatchup().round'),['Bi-District','Area','Regional','State Quarterfinal','State Semifinal','State Championship'][i]);
 c.exec('onPlayoffGame({score:40,opp:3,playoff:true})');
 if(i<5)c.exec('game.week++');
}
assert.equal(c.state().competition.postseason.status,'champion');
assert.equal(c.state().competition.postseason.championId,'school');
assert.equal(c.state().competition.postseason.rounds.length,6);
assert.equal(c.state().endFallAfterThisWeek,true);
console.log('PASS: six playoff rounds connect to correct winners through championship.');
