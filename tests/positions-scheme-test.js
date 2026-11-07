const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.resolve(__dirname,'..');
function setup(pos,runRate){
  const store=new Map(),nodes=new Map();
  const document={getElementById(id){if(!nodes.has(id))nodes.set(id,{value:id==='position'?pos:id==='bg'?'working':id==='heightFeet'?'5':id==='heightInches'?'9':id==='a_iq'||id==='a_behavior'?'50':id==='name'?'Jordan Carter':id==='school'?'0':id==='weight'?'155':id==='jersey'?'7':'38',innerHTML:'',style:{}});return nodes.get(id)}};
  const ctx=vm.createContext({console,Math,document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},alert:s=>{throw Error(s)},confirm:()=>true});
  for(const n of fs.readdirSync(path.join(root,'js')).filter(n=>n.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',n),'utf8'),ctx,{filename:n});
  const run=s=>vm.runInContext(s,ctx);run(`schools[0].classif=6;schools[0].runRate=${runRate};start()`);return {run,snap:()=>JSON.parse(JSON.stringify(run('game')))};
}
const options=setup('CB',.5).run('Object.keys(GROUPS)');
assert.equal(options.length,22);
for(const pos of ['RB','FB','QB','WR','TE','LT','RG','C','DE','MLB','CB','FS','K','P','LS']){
  const t=setup(pos,.42);t.run('nextWeek();simulateGame()');const g=t.snap().games[0];assert(g,'game exists for '+pos);assert.match(t.run('gameStatsDescription(game.games[0],game.pos)'),/\d/);
  if(['CB','DE','MLB','FS'].includes(pos))assert('tackles' in g.stats);
  if(pos==='K')assert('fgAtt' in g.stats);
  if(pos==='LT')assert('blocks' in g.stats);
}
// High pass rates must not artificially eliminate pass-catching backs.
let withTargets=0;
for(let i=0;i<30;i++){let t=setup('RB',.25);t.run("game.placement.primary.you='Varsity';game.placement.starter.Varsity='you';nextWeek();simulateGame()");withTargets+=t.snap().games[0].stats.targets;}
assert(withTargets>0,'Air Raid RB needs receiving targets');
console.log('position families, box scores and receiving-back integration passed');
