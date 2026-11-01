/* Part 7.2: factual registration, evolving player profile, career snapshot archive. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function harness(store=new Map()){
 const els=new Map();
 function el(id){if(!els.has(id)){
   const defaults={name:'Taylor Reed',position:'QB',bg:'working',school:'0',heightFeet:'6',heightInches:'2',weight:'190',hometown:'Lakeville',jersey:'12',hand:'Left',a_iq:'50',a_behavior:'50'};
   els.set(id,{id,value:defaults[id]||(id.startsWith('a_')?'38':''),innerHTML:'',textContent:'',style:{}});
 }return els.get(id)}
 const ctx=vm.createContext({console,Math,document:{getElementById:el,querySelector:()=>null},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},alert:s=>{throw Error(s)},confirm:()=>true});
 for(const n of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',n),'utf8'),ctx,{filename:n});
 return {el,ev:s=>vm.runInContext(s,ctx),snap:()=>JSON.parse(JSON.stringify(vm.runInContext('game',ctx))),store};
}
const t=harness();
assert.match(t.el('app').innerHTML,/High School Football Registration/);
assert.match(t.el('app').innerHTML,/hometown/i);
assert.match(t.el('app').innerHTML,/Submit Registration/);
t.ev('start()');
let g=t.snap();
assert.equal(g.name,'Taylor Reed');assert.equal(g.pos,'QB');assert.equal(g.hometown,'Lakeville');
assert.equal(g.hand,'Left');assert.equal(g.jersey,12);assert.equal(g.height,74);
assert.equal(g.playerProfile.milestones.length,1);assert.equal(g.playerProfile.snapshots.length,1);
assert.equal(g.playerProfile.milestones[0].id,'registration');
assert.match(g.playerProfile.snapshots[0].bio,/No football game statistics have been recorded yet/i);
assert.equal(g.playerProfile.snapshots[0].stats.games,0);
t.ev("tab='profile';render()");
assert.match(t.el('app').innerHTML,/Living player biography/);
assert.match(t.el('app').innerHTML,/Taylor Reed/);assert.match(t.el('app').innerHTML,/Lakeville/);
assert.match(t.el('app').innerHTML,/Biography archive/);
assert.doesNotMatch(t.el('app').innerHTML,/five.star recruit/i);
// Simulate a genuine game with a guaranteed starting position, not a fabricated result.
t.ev('game.school.classif=1; game.team.forEach(x=>{for(const k of ATTRS)x.attrs[k]=25;x.ovr=25});game.placement=null;');
assert.equal(t.ev('depth().role'),'Starter');
t.ev("tab='career';nextWeek();simulateGame()");
g=t.snap();
assert.equal(g.games.length,1);
assert(g.playerProfile.keys.includes('first-start'));
assert(g.playerProfile.keys.includes('first-varsity-start'));
assert(g.playerProfile.snapshots.length>=3);
t.ev("tab='profile';render()");
let html=t.el('app').innerHTML;
assert.match(html,/First varsity start/);
assert.match(html,/Career football statistics/);
assert.match(html,/Career passing production is/);
const expected=g.games[0].stats.passAtt;
assert.match(html,new RegExp('on '+expected+' attempts'));
// Old registration bio remains as it was despite new current stats and attributes.
assert.match(g.playerProfile.snapshots[0].bio,/No football game statistics/);
const firstSnapshot=JSON.stringify(g.playerProfile.snapshots[0]);
t.ev('game.attrs.accuracy=90;game.progress.accuracy=0;render()');
assert.match(t.el('app').innerHTML,/Accuracy \(90\)/);
assert.equal(JSON.stringify(t.snap().playerProfile.snapshots[0]),firstSnapshot);
// Replaying a milestone function doesn't produce a duplicate checkpoint.
const before=t.snap().playerProfile.snapshots.length;
t.ev('profileGameFinished(game.games[0])');
assert.equal(t.snap().playerProfile.snapshots.length,before);
// Year-to-year snapshots preserve their original grade and statistics.
t.ev('archiveFootballSeason();startNextSchoolYear()');
g=t.snap();
assert.equal(g.year,2);assert.equal(g.grade,10);
assert(g.playerProfile.keys.includes('season-1'));
assert(g.playerProfile.keys.includes('year-2'));
assert.equal(g.playerProfile.snapshots.find(x=>x.id==='season-1').grade,9);
// Reload from the actual localStorage save slot and verify archives.
t.ev('persist()');const expectedKeys=g.playerProfile.keys,loaded=harness(t.store);
assert.equal(loaded.snap().playerProfile.snapshots.length,g.playerProfile.snapshots.length);
assert.deepEqual(loaded.snap().playerProfile.keys,expectedKeys);
loaded.ev("tab='profile';render()");
assert.match(loaded.el('app').innerHTML,/Entered grade 10/);
console.log('PASS: registration, metadata, real QB game bio, first varsity start, deduped milestones, historical snapshots, next-year development and save/load.');
