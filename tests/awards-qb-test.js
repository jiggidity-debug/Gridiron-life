/* Awards & quarterback reports are position-specific, persistent, and repeat-safe. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
function boot(preload){
 const elements=new Map(),store=new Map(Object.entries(preload||{}));
 const document={getElementById(id){if(!elements.has(id)){
  const value=id==='name'?'Casey':id==='position'?'QB':id==='bg'?'working':id==='school'?'0':id==='heightFeet'?'5':id==='heightInches'?'11':id==='weight'?'185':id==='a_iq'||id==='a_behavior'?'50':'38';
  elements.set(id,{value,innerHTML:'',textContent:'',style:{}})}return elements.get(id)}};
 const ctx=vm.createContext({console,Math,document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},alert:s=>{throw Error(s)},confirm:()=>true});
 for(const f of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f});
 const exec=s=>vm.runInContext(s,ctx),state=()=>JSON.parse(JSON.stringify(exec('game')));
 return {exec,state,store,document};
}
const t=boot();t.exec('draft.position="QB";start()');
assert.equal(t.state().pos,'QB');
const simulated={year:1,phase:0,week:1,level:'Varsity',role:'Starter',score:40,opp:24,plays:['Q1 · Completed pass for 14 yd.'],opponentName:'Summit Tigers',opponentStrength:73,win:true,playoff:false,stats:{passAtt:34,passComp:26,passYards:320,passTD:3,interceptions:1,rushYards:12,carries:2,recYards:0,receptions:0}};
t.exec('game.games.unshift('+JSON.stringify(simulated)+')');
const text=t.exec('gameStatsDescription(game.games[0],game.pos)');
assert.match(text,/26\/34 passing, 320 pass yards, 3 pass TD, 1 INT/);
t.exec('registerGameAwards(game.games[0])');
let awards=t.state().awards.earned;
assert(awards.some(a=>a.title.startsWith('Offensive Standout')));
assert(awards.some(a=>a.title==='District Performance of the Week'));
t.exec('registerGameAwards(game.games[0])');
assert.equal(t.state().awards.earned.length,awards.length,'same game cannot double-pay awards');
t.exec('tab="career";render()');
assert.match(t.document.getElementById('app').innerHTML,/26\/34 passing, 320 pass yards, 3 pass TD, 1 INT/);
assert.doesNotMatch(t.document.getElementById('app').innerHTML,/0 carries, 0 rush yards, 0 rush TD;/);
t.exec('tab="history";render()');
assert.match(t.document.getElementById('app').innerHTML,/Awards & accolades/);
assert.match(t.document.getElementById('app').innerHTML,/Offensive Standout/);
const saved=JSON.stringify(t.state());
const loaded=boot({'gridiron-life-v5':saved});
assert.equal(loaded.state().awards.earned.length,awards.length);
loaded.exec('registerGameAwards(game.games[0])');
assert.equal(loaded.state().awards.earned.length,awards.length);
console.log('PASS: QB passing line, earned weekly awards, idempotence, history, save migration.');
// Season honors only once per season; no non-varsity All-State claims.
loaded.exec('game.games=Array.from({length:10},(_,i)=>({...game.games[0],week:i+1,stats:{...game.games[0].stats}}))');
loaded.exec('academicState().termReports.push({year:game.year,semester:"Fall",gpa:3.75})');
loaded.exec('finalizeSeasonAwards()');
let a=loaded.state().awards.earned;
assert(a.some(x=>x.kind==='academic'));
assert(a.some(x=>x.kind==='season'));
assert(a.some(x=>x.title.includes('All-District')));
assert(!a.some(x=>x.title.includes('Second Team')&&a.some(y=>y.title.includes('First Team'))));
loaded.exec('finalizeSeasonAwards()');
assert.equal(loaded.state().awards.earned.length,a.length);
console.log('PASS: season + academic honors, no duplicate or overlapping district tiers.');
// Legacy v0.5 Part 4 career receives an empty award register without retroactive fabricated prizes.
let legacy=JSON.parse(saved); delete legacy.awards;
const old=boot({'gridiron-life-v5':JSON.stringify(legacy)});
assert.equal(old.state().awards.earned.length,0);
console.log('PASS: older saves gain safe empty awards history; prior games not retro-awarded.');
