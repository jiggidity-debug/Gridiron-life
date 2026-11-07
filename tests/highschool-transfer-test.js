const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),els=new Map(),store=new Map();
const defaults={name:'Taylor Miles',position:'QB',bg:'working',school:'0',heightFeet:'6',heightInches:'1',weight:'180',hometown:'',jersey:'9',hand:'Right',schoolClass:'1'};
function el(id){if(!els.has(id))els.set(id,{id,value:defaults[id]||'38',innerHTML:'',textContent:'',style:{}});return els.get(id)}
const ctx=vm.createContext({console,Math,document:{getElementById:el},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},alert:x=>{throw Error(x)},confirm:()=>true});
for(const f of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f});
const run=x=>vm.runInContext(x,ctx);
for(let n=1;n<=6;n++){let count=run(`schools.filter(s=>!s.prep&&s.classif===${n}).length`);assert(count>=4,`${n}A has choices`)}
assert.equal(run('schools.filter(s=>s.prep).length'),4);
assert.match(run('setupScreen()'),/School classification/);
assert.match(run('setupScreen()'),/School<select/);
// Simulate the level-then-school selection and make sure it filters correctly.
el('school-class').value='5';run('schoolClassSelection()');assert.equal(run('schools[draft.school].classif'),5);assert(!el('school').innerHTML.includes('National Summit Prep'));
// Create, test regular transfer + retained records + selective prep gating.
el('school').value=String(run('draft.school'));run('start()');
assert.match(run('schoolTransferScreen()'),/Closed during fall season/);
const before=run('game.school.id');run(`requestHighSchoolTransfer(${run('schools.find(s=>s.id!==game.school.id).id')})`);assert.equal(run('game.school.id'),before);
run('game.phase=3;game.grade=11');
const target=run('schools.find(s=>!s.prep&&s.id!==game.school.id).id');run(`requestHighSchoolTransfer(${target})`);assert.equal(run('game.school.id'),target);
assert.equal(run('game.schoolTransfers.length'),1);
const prep=run('schools.find(s=>s.prep).id');run(`requestHighSchoolTransfer(${prep})`);assert.notEqual(run('game.school.id'),prep);
run('game.gpa=3.4');run('ATTRS.forEach(k=>game.attrs[k]=65)');run(`requestHighSchoolTransfer(${prep})`);
assert.equal(run('game.school.prep'),true);assert.equal(run('game.schoolTransfers.length'),2);
assert.match(run('schoolTransferScreen()'),/National preparatory programs/);
console.log('PASS high school class-based selection, offseason transfers and gated prep admission');
