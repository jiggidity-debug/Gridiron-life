/* v0.7 save and systems regression. Runs with node tests/v07-stability-test.cjs */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),save=process.argv[2]||'/mnt/data/gridiron-life-v060-save (10).json';
const base=JSON.parse(fs.readFileSync(save,'utf8'));
const elements=new Map();
const document={getElementById(id){if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',style:{setProperty(){}},classList:{add(){},remove(){}},querySelectorAll(){return []},setAttribute(){},appendChild(){}});return elements.get(id)},addEventListener(){},createElement(){return {classList:{add(){},remove(){}},setAttribute(){},style:{},textContent:''}},body:{appendChild(){},classList:{add(){},remove(){}}}};
const storage=new Map([['gridiron-life-v5',JSON.stringify(base)]]);
const ctx={console,Math,document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout(){},clearTimeout(){},alert(){},confirm:()=>true};ctx.window=ctx;
vm.createContext(ctx);
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const names=[...index.matchAll(/src="js\/([^"?]+)/g)].map(m=>m[1]);
for(const name of names){const file=path.join(root,'js',name);vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:name,timeout:4000});}
ctx.__save=JSON.stringify(base);
const evaluate=expr=>vm.runInContext(expr,ctx,{timeout:6000});
assert.equal(evaluate('game.name'),'Jordan Johnson');
assert.equal(evaluate('game.year'),3);
assert.equal(evaluate('typeof historyScreen'),'function');
assert.equal(evaluate('typeof profileScreen'),'function');
assert.equal(evaluate('typeof v603CollegeOffseasonWeek'),'function');
const wear=evaluate('healthState().wear');
assert(Number.isFinite(wear));
let recruitment=evaluate('recruitingState()');
assert(Number.isFinite(recruitment.scouting));
const grade=evaluate('game.grade');
const score=recruitment.scouting;
assert(grade>=11);
assert(score>=45,'standout varsity production should register meaningful recruiting evaluation');
assert.match(evaluate('historyScreen()'),/Year 1|High School|Career/i);
// Simulated high-school starts must use team-based touches and save teammate production.
evaluate('game.stage="highschool";game.phase=0;game.week=1;game.gamePending=true;game.injury=null;game.fatigue=0;');
evaluate('simulateGame()');
const latest=evaluate('game.games[0]');
assert(latest.stats.carries>=0,'carries should be nonnegative');
assert(Object.keys(latest.rosterStats||{}).length>0,'teammate statistics should be stored');
assert(!fs.readFileSync(path.join(root,'js/61-football.js'),'utf8').includes('stats.carries>='),'old per-game carry cap must be removed entirely');
assert(latest.stats.carries>=latest.plays.filter(p=>p.includes('Carry ')).length,'recorded player carries include fumbles as well as logged runs');
// Restore imported save before checking the offseason behavior.
evaluate('game=JSON.parse(__save);');
const before=evaluate('game.fatigue');
evaluate('game.college={year:1,phase:"offseason",week:0,program:{name:"Test College",tier:"JUCO",conference:"Test",coaching:70,facilities:70},history:[],news:[],yearHistory:[],games:[],weeklyPlan:{training:6,study:8,recovery:12}};game.stage="college";game.focus=game.focus||{};');
const wearBefore=evaluate('healthState().wear');
evaluate('v603CollegeOffseasonWeek()');
const wearAfter=evaluate('healthState().wear');
assert(wearAfter<wearBefore,'college offseason should reduce long-term wear');
for(let i=1;i<8;i++)evaluate('v603CollegeOffseasonWeek()');
const eightWeekWear=evaluate('healthState().wear');
assert(wearBefore-eightWeekWear>=14,'eight recovery-focused weeks should lower wear by at least 14 points');
assert.equal(evaluate('game.college.offseasonWeeks'),8);
console.log(JSON.stringify({pass:true,modules:names.length,save:base.name,grade,scouting:score,stars:recruitment.stars,offers:recruitment.offers.filter(o=>o.offer).length,fatigue:before,wear,offseasonWearAfter:wearAfter,eightWeekWear,testCarries:latest.stats.carries,testTargets:latest.stats.targets},null,2));
