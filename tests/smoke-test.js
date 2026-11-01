// Run from any directory: node tests/smoke-test.js
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
function sandbox(prefill = {}){
  const elements=new Map(),store=new Map(Object.entries(prefill));
  function getElementById(id){
    if(!elements.has(id)){
      let value='38';
      if(id==='name')value='Jordan Carter';
      if(id==='position')value='RB';
      if(id==='bg')value='working';
      if(id==='school')value='0';
      if(id==='heightFeet')value='5';
      if(id==='heightInches')value='9';
      if(id==='weight')value='155';
      if(id==='a_iq'||id==='a_behavior')value='50';
      elements.set(id,{value,innerHTML:'',textContent:'',style:{}});
    }
    return elements.get(id);
  }
  const ctx=vm.createContext({
    console,Math,
    document:{getElementById},
    localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},
    alert:s=>{throw new Error('Unexpected alert: '+s)},
    confirm:()=>true,
  });
  for(const name of fs.readdirSync(path.join(root,'js')).filter(n=>n.endsWith('.js')).sort()){
    vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),ctx,{filename:name});
  }
  function evalJs(s){return vm.runInContext(s,ctx)}
  function snap(){return JSON.parse(JSON.stringify(evalJs('game')))}
  return {ctx,store,getElementById,evalJs,snap};
}

let t=sandbox();
assert.match(t.getElementById('app').innerHTML,/Create your freshman/);
t.evalJs('schools[0].classif=6;start()');
let g=t.snap();
assert.equal(g.version,5);
assert.equal(g.team.length,20);
assert.deepEqual(g.team.map(x=>x.grade).sort((a,b)=>a-b),[9,9,9,9,9,10,10,10,10,10,11,11,11,11,11,12,12,12,12,12]);
assert.equal(g.schedule.length,10);
assert.match(t.getElementById('app').innerHTML,/v0.5 Part 8/);
t.evalJs("tab='team';render()");
assert.match(t.getElementById('app').innerHTML,/Position depth charts/);
assert.match(t.getElementById('app').innerHTML,/Freshman/);
const initialDepth=JSON.parse(JSON.stringify(t.evalJs('depth()')));
for(const level of ['Freshman','JV'])assert(initialDepth.squads[level].every(x=>x.grade<= (level==='Freshman'?9:11)));
assert(initialDepth.squads.Varsity.filter(x=>x.grade===12).length===5);
// Regular season: one game per week, with no silent simulation and persistent opponent.
t.evalJs("tab='career';nextWeek()");
assert.equal(t.snap().gamePending,true);
assert.equal(t.snap().games.length,0);
t.evalJs('simulateGame()');
g=t.snap();
assert.equal(g.games.length,1);
assert(g.games[0].opponentName);
assert(g.games[0].opponentStrength>=20);
assert.equal(g.games[0].stats.carries,g.games[0].plays.filter(x=>x.includes('Carry ')).length);
assert.equal(g.games[0].stats.receptions,g.games[0].plays.filter(x=>x.includes('reception')).length);
assert.equal(g.squadRecords[g.games[0].level][0]+g.squadRecords[g.games[0].level][1],1);
assert.equal(g.programRecord[0]+g.programRecord[1],1);
// Move through first football year and school year; events are resolved normally.
let ticks=0;
while(t.snap().year===1 && ticks++ < 160){
  const x=t.snap();
  if(x.scheduledEvent) t.evalJs('chooseEvent(0)');
  else if(x.gamePending) t.evalJs('simulateGame()');
  else t.evalJs('nextWeek()');
}
g=t.snap();
assert.equal(g.year,2,'school year must advance when spring ends');
assert.equal(g.grade,10,'freshman becomes sophomore before summer and preseason');
assert.equal(g.phase,3,'new year begins at summer');
assert.equal(g.week,1);
assert.equal(g.alumni.length,5,'graduating seniors removed');
assert(g.team.filter(x=>x.grade===12).length===5,'former juniors are the new seniors');
assert(g.alumni.every(x=>!g.team.some(a=>a.id===x.id)),'all graduated seniors removed from active roster');
assert.equal(g.team.filter(x=>x.grade===9).length,5,'incoming ninth graders added');
assert.equal(g.team.length,20,'position group cohort remains 20');
assert.equal(new Set(g.team.map(x=>x.id)).size,20,'all players have unique IDs');
assert(g.games.length>=10&&g.games.length<=16,'regular season plus possible playoff games');
assert.equal(g.seasonHistory.length,1,'year one archived once');
assert.equal(g.seasonHistory[0].year,1);
assert.equal(g.squadRecords.Freshman.reduce((a,b)=>a+b,0),0);
assert.equal(g.squadRecords.JV.reduce((a,b)=>a+b,0),0);
assert.equal(g.squadRecords.Varsity.reduce((a,b)=>a+b,0),0);
assert.equal(g.schedule.length,10);
// Summer and preseason never double-promote; first sophomore fall begins with zero record.
ticks=0;
while(!(t.snap().phase===0 && t.snap().year===2) && ticks++ < 100){
 const x=t.snap();
 if(x.scheduledEvent)t.evalJs('chooseEvent(0)');
 else t.evalJs('nextWeek()');
}
g=t.snap();
assert.equal(g.year,2);assert.equal(g.grade,10);assert.equal(g.phase,0);assert.equal(g.week,1);
assert.equal(g.games.filter(x=>x.year===2).length,0);
assert.equal(g.team.filter(x=>x.grade===9).length,5);
assert.equal(g.alumni.length,5);
assert.match(t.getElementById('app').innerHTML,/Year 2/);
const gamesBeforeYearTwo=t.snap().games.length;
if(t.snap().scheduledEvent)t.evalJs('chooseEvent(0)');
t.evalJs('nextWeek();simulateGame()');
g=t.snap();
assert.equal(g.games.filter(x=>x.year===2).length,1);
assert.equal(g.programRecord[0]+g.programRecord[1],1);
assert.equal(g.games.length,gamesBeforeYearTwo+1);
t.evalJs("tab='history';render()");
assert.match(t.getElementById('app').innerHTML,/Season records/);
assert.match(t.getElementById('app').innerHTML,/Year 1/);
assert.match(t.getElementById('app').innerHTML,/Opponent strength/);
assert.equal(JSON.parse(t.store.get('gridiron-life-v5')).version,5);
console.log('PASS: v0.5 creation, separate squads, school-year graduation, incoming class, schedule, seasonal records, history, save.');

// Migrating an untouched v0.4 save must not overwrite its rollback data.
const legacy=JSON.parse(JSON.stringify(g));
legacy.version=4;legacy.grade=9;legacy.year=1;legacy.phase=4;legacy.week=2;
delete legacy.seasonHistory;delete legacy.alumni;delete legacy.squadRecords;delete legacy.schedule;
// v0.4 would have 12th graders capped at 12.
legacy.team[0].grade=12;
const oldText=JSON.stringify(legacy);
t=sandbox({'gridiron-life-v4':oldText});
g=t.snap();
assert.equal(g.version,5);
assert.equal(g.grade,10);
assert.equal(g.year,2);
assert.equal(g.phase,4);
assert.equal(t.store.get('gridiron-life-v4'),oldText,'do not overwrite old save');
assert.equal(JSON.parse(t.store.get('gridiron-life-v5')).version,5);
console.log('PASS: imports a v0.4 preseason save into a separate v0.5 slot without altering v0.4 backup.');
