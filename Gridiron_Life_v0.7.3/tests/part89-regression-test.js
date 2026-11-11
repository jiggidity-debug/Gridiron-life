const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function fresh(){const elems=new Map();const store=new Map();const el=id=>{if(!elems.has(id)){const v={name:'Jordan Carter',position:'QB',school:'0',bg:'working',hometown:'Texas',jersey:'11',hand:'Right',heightFeet:'6',heightInches:'2',weight:'180',a_iq:'50',a_behavior:'50'};elems.set(id,{value:v[id]||(id.startsWith('a_')?'38':''),innerHTML:'',style:{},textContent:''})}return elems.get(id)};
const ctx=vm.createContext({Math,console,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},document:{getElementById:el,querySelector:()=>null},alert:x=>{throw Error(x)},confirm:()=>true});
for(const name of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),ctx,{filename:name});
return {exec:x=>vm.runInContext(x,ctx),snap:()=>JSON.parse(vm.runInContext('JSON.stringify(game)',ctx)),el};}
const t=fresh();t.exec('start();game.grade=12;game.year=4;game.gpa=3.4;game.attrs.accuracy=94;game.attrs.awareness=88;game.attrs.arm=88;game.gamePending=true;simulateGame()');
let g=t.snap();assert(g.games.length);let v=g.games[0];assert(v.stats.passTD>=0);assert(v.stats.passTD*7<=v.score,'QB passing touchdowns cannot exceed team scoring');
assert(v.plays.filter(x=>x.includes('Completed pass')&&x.includes('TOUCHDOWN')).length===v.stats.passTD,'each pass TD must be a real scoring completion');
t.exec('game.grade=12;game.finished=true;game.stage="recruiting";recruitingState()');let school=t.snap().recruiting.colleges.find(x=>x.tier==='FBS');t.exec('collegeSign('+school.id+',true)');
const tabs=t.el('app').innerHTML;for(const name of ['Development','Life','Team','Player Profile','History'])assert(tabs.includes(name),'College navigation missing '+name);
t.exec("tab='develop';render()");assert.match(t.el('app').innerHTML,/Player attributes/);assert.match(t.el('app').innerHTML,/College weekly availability/);
t.exec("tab='life';render()");assert.match(t.el('app').innerHTML,/Money and NIL/);
t.exec("tab='profile';render()");assert.match(t.el('app').innerHTML,/College scouting and attributes/);
t.exec('collegeSimGame()');g=t.snap();v=g.college.games[0];assert(v.stats.passTD*7<=v.score);assert(v.plays.filter(x=>x.includes('Completed pass')&&x.includes('TOUCHDOWN')).length===v.stats.passTD);
console.log('PASS high-school TD attribution; college continuity, development, NIL, profile and score-linked touchdowns');
