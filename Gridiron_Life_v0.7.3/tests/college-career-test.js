/* Part 8: high school graduation -> recruiting -> full college career and transfer/save. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function sim(prefill=new Map()){
 const els=new Map();function el(id){if(!els.has(id)){let defaults={name:'Jordan Carter',position:'QB',school:'0',bg:'working',hometown:'Texas',jersey:'11',hand:'Right',heightFeet:'6',heightInches:'2',weight:'180',a_iq:'50',a_behavior:'50'};els.set(id,{id,value:defaults[id]||(id.startsWith('a_')?'38':''),textContent:'',style:{},innerHTML:''});}return els.get(id)}
 const ctx=vm.createContext({Math,console,localStorage:{getItem:k=>prefill.get(k)||null,setItem:(k,v)=>prefill.set(k,v),removeItem:k=>prefill.delete(k)},document:{getElementById:el,querySelector:()=>null},alert:x=>{throw Error(x)},confirm:()=>true});
 for(const name of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js')).sort())vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),ctx,{filename:name});
 return {ev:q=>vm.runInContext(q,ctx),snap:()=>JSON.parse(JSON.stringify(vm.runInContext('game',ctx))),el,store:prefill};
}
let t=sim();t.ev('start()');
t.ev('game.grade=12;game.year=4;game.attrs.accuracy=84;game.attrs.awareness=82;game.attrs.arm=79;game.gpa=3.3;game.games.unshift({year:4,week:1,phase:0,level:"Varsity",role:"Starter",win:true,score:24,opp:14,opponentName:"Cedar Valley Lions",stats:{passAtt:30,passComp:25,passYards:270,passTD:3,interceptions:0},plays:[]});startNextSchoolYear();render()');
let g=t.snap();assert.equal(g.stage,'recruiting');assert.equal(g.finished,false);assert.equal(g.college,undefined);
assert.match(t.el('app').innerHTML,/Scholarship offers/);
assert.equal(g.recruiting.colleges.length,685);assert.equal(g.recruiting.board.length,1600);
assert(g.recruiting.stars>=0);assert.equal(g.recruiting.offers.length,685); // Offers are earned, not guaranteed.
const id=g.recruiting.offers.find(x=>x.offer&&g.recruiting.colleges[x.id].tier==='FBS')?.id ?? g.recruiting.colleges.find(x=>x.tier==='FBS').id;
t.ev('collegeSign('+id+','+(g.recruiting.offers[id].offer?'false':'true')+')');g=t.snap();assert.equal(g.stage,'college');assert.equal(g.college.year,1);assert.equal(g.college.schedule.length,12);assert.equal(g.college.roster.length,6);
assert.equal(g.games.length,1,'previous high school stats survive');assert.match(t.el('app').innerHTML,/College football/);
const originalRating=t.ev('rating(game.attrs,game.pos)');assert.equal(originalRating,t.ev('rating(game.attrs,game.pos)'));
// The first year supports real 12-game simulation and independent college records.
for(let i=0;i<12;i++)t.ev('collegeSimGame()');g=t.snap();assert.equal(g.college.games.filter(x=>x.phase==='regular').length,12);assert.equal(g.college.record.reduce((a,b)=>a+b),12);assert.equal(g.college.programs.find(x=>x.id===id).record.reduce((a,b)=>a+b),12);
let playoff=0;while(g.college.phase==='postseason'&&playoff++<3){t.ev('collegeSimGame()');g=t.snap()}
assert(['offseason','complete'].includes(g.college.phase),'season must reach offseason after postseason');
assert.equal(g.college.yearHistory.length,1);assert.equal(g.college.eligibilityUsed,1);
const originalSchool=g.college.program.name;
const possible=t.ev("collegeTransferOptions().find(x=>x.interest>=25&&x.program.tier==='FBS')?.program.id");
if(possible!==undefined){t.ev('collegeTransfer('+possible+')');g=t.snap();assert.notEqual(g.college.program.name,originalSchool);assert.equal(g.college.transferHistory.length,1)}
t.ev('persist()');let u=sim(t.store);assert.equal(u.snap().stage,'college');assert.equal(u.snap().college.games.length,g.college.games.length);
t.ev('collegeNextYear()');g=t.snap();assert.equal(g.college.year,2);assert.equal(g.college.games.filter(x=>x.year===1).length>=12,true);
assert.equal(g.college.record.reduce((a,b)=>a+b),0);assert.equal(g.college.schedule.length,12);
// Follow remaining seasons and ensure graduation completes without dead-end or double-counting.
for(let years=0;years<6 && g.stage==='college';years++){
 let count=0;while(g.college.phase==='regular'&&count++<13){t.ev('collegeSimGame()');g=t.snap()}
 count=0;while(g.college.phase==='postseason'&&count++<3){t.ev('collegeSimGame()');g=t.snap()}
 if(g.college.phase==='offseason')t.ev('collegeNextYear()');g=t.snap();
}
if(g.stage!=='collegeComplete')console.log('debug end state',g.college.year,g.college.phase,g.college.eligibilityUsed,g.college.yearHistory.map(x=>[x.year,x.redshirt]),g.college.gamesPlayedThisYear);assert.equal(g.stage,'collegeComplete');assert.equal(g.college.eligibilityUsed,4);assert.equal(g.college.yearHistory.length,4);
assert(g.games.length>=1,'high school games not lost');
console.log('PASS: graduation/signing, recruiting board/offers, 12-game schedule, NCAA-like fictional league, postseason, transfer, save/reload, complete four college eligibility seasons.');
// Import an already-completed Part 7.2 career and allow immediate college signing.
const migrated=JSON.parse(JSON.stringify(g));delete migrated.stage;delete migrated.college;migrated.grade=12;migrated.finished=true;
const previous=new Map([['gridiron-life-v5',JSON.stringify(migrated)]]);u=sim(previous);assert.equal(u.snap().stage,'recruiting');assert.match(u.el('app').innerHTML,/Scholarship offers/);console.log('PASS: legacy completed HS career opens the new recruiting flow.');
