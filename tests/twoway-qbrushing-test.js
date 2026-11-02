const assert=require('node:assert/strict');const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
function setup(pos,cls){
 const nodes=new Map(),store=new Map();const doc={getElementById(id){if(!nodes.has(id))nodes.set(id,{value:id==='position'?pos:id==='name'?'Test Player':id==='bg'?'working':id==='heightFeet'?'6':id==='heightInches'?'1':id==='school'?'0':id==='weight'?'185':'38',innerHTML:'',style:{}});return nodes.get(id)}};
 const ctx=vm.createContext({console,document:doc,Math,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},alert:()=>{},confirm:()=>true});
 for(const f of fs.readdirSync(path.join(root,'js')).filter(f=>f.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f});
 const run=s=>vm.runInContext(s,ctx);
 run(`schools[0].classif=${cls};start(); game.placement=null;`);
 return {run,snap:()=>JSON.parse(JSON.stringify(run('game')))};
}
let t=setup('RB',1);
t.run("requestTwoWay('MLB',true)");assert.equal(t.run('twoWayDecision().active'),true);
t.run('nextWeek();simulateGame()');let g=t.snap().games[0];assert.equal(g.secondaryPosition,'MLB');assert(g.stats.defSnaps>0);assert(g.stats.tackles>=0);assert.match(t.run('gameStatsDescription(game.games[0],game.pos)'),/Two-way MLB/);
assert(t.snap().health.weekReports[0].game>0);
t=setup('RB',6);t.run("requestTwoWay('MLB',true)");assert.equal(t.run('twoWayDecision().active'),false);
t=setup('QB',2);t.run("game.attrs.speed=99;game.attrs.accel=99;game.attrs.agility=99;game.placement=null;game.squadPreference='Varsity';game.placement=null;");
let carries=0,gameLog=0;
for(let i=0;i<20;i++){
 t.run('game.gamePending=true;simulateGame()');const r=t.snap().games[0]; carries+=r.stats.carries;gameLog+=r.plays.filter(p=>/QB scramble|Designed QB run/.test(p)).length;
}
assert(carries>0,'mobile QBs need rushing plays');assert.equal(carries,gameLog,'every QB carry must have a log entry');
console.log('two-way assignment, defensive stats, physical workload and QB running passed');
