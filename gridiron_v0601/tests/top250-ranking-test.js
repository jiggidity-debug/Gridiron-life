// Part 8.9 validates actual recruitment board generation, not a brittle source regex.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const els=new Map();function el(id){if(!els.has(id)){const defaults={name:'Jordan Carter',position:'QB',school:'0',bg:'working',hometown:'Texas',jersey:'11',hand:'Right',heightFeet:'6',heightInches:'2',weight:'180',a_iq:'50',a_behavior:'50'};els.set(id,{value:defaults[id]||(id.startsWith('a_')?'38':''),innerHTML:'',textContent:'',style:{}})}return els.get(id)}
const store=new Map(),ctx=vm.createContext({Math,console,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},document:{getElementById:el,querySelector:()=>null},alert:x=>{throw Error(x)},confirm:()=>true});
for(const name of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),ctx,{filename:name});
vm.runInContext('start();recruitingState()',ctx);const board=JSON.parse(vm.runInContext('JSON.stringify(game.recruiting.board)',ctx));
assert.equal(board.length,1600);assert.equal(new Set(board.map(x=>x.name)).size,1600);
assert.equal(new Set(board.map(x=>x.pos)).size,22);
assert.equal(board.filter(x=>x.score===77).length,2);
assert(board.slice(2,250).every(x=>x.score>=58&&x.score<=76));
assert(board.slice(250).every(x=>x.score>=28&&x.score<=57));
vm.runInContext('persist()',ctx);assert.equal(JSON.parse(store.get('gridiron-life-v5')).recruiting.boardVersion,3);
console.log('PASS 1600 unique names, 22 positions, realistic Top 250 spread and saved board version');
