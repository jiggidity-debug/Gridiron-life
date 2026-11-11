// No browser or third-party packages required. Runs the production JS in script-tag order.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const dir=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\s+defer\s+src="(js\/[^"?]+)/g)].map(m=>m[1]).filter(s=>!s.endsWith('/99-boot.js'));
const mem=new Map();
const context={console,Math,Date,JSON,Number,String,Array,Object,Set,Map,Promise,parseInt,parseFloat,isFinite,
 localStorage:{setItem(k,v){mem.set(k,v)},getItem(k){return mem.get(k)||null},removeItem(k){mem.delete(k)}},
 document:{getElementById(){return null},body:{classList:{add(){},remove(){}}},addEventListener(){}},
 confirm(){return true},alert(){},setTimeout(){},window:null};
context.window=context;vm.createContext(context);
for(const file of scripts)vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),context,{filename:file});
const run=(code)=>vm.runInContext(code,context);
assert(fs.readFileSync(path.join(dir,'js/60-calendar.js'),'utf8').includes('v601UpdateAcademics();')); 
const savePath=process.argv[2]||'/mnt/data/gridiron-life-v060-save (11).json';
if(fs.existsSync(savePath)){
 const save=JSON.parse(fs.readFileSync(savePath,'utf8'));
 context.testSave=save;
 run('game=testSave; migrateSkillModel(); game.stage="nfl"; game.v6=v6State(); game.v6.nfl=v6League();');
 run('game.v6.nfl.phase="offseason";game.v6.nfl.status="unsigned";game.v6.nfl.team=null; game.v6.nfl.year=2; game.v6.nfl.playerAge=25; game.v6.nfl.contractYears=0; game.v6.nfl.offseasonWeeks=careerOffseasonWeeks("nfl");game.v6.nfl.offers=[];');
 run('v6NFLNextYear()');
 assert.strictEqual(run('game.v6.nfl.year'),3);
 assert.strictEqual(run('game.v6.nfl.seasonHistory.filter(s=>s.year===2).length'),1);
 assert.strictEqual(run('game.v6.nfl.seasonHistory.filter(s=>s.year===3).length'),0);
 // End another unsigned season: only one record for its own year.
 run('game.v6.nfl.offseasonWeeks=careerOffseasonWeeks("nfl");v6NFLNextYear()');
 assert.strictEqual(run('game.v6.nfl.seasonHistory.filter(s=>s.year===3).length'),1);
 // Wear must affect biological age; same calendar age, different physical strain.
 run('game.v6.nfl.playerAge=31;game.health=healthState();game.health.wear=0;');
 const fresh=run('physicalAgePenalty()');
 run('game.health.wear=85;');
 assert(run('physicalAgePenalty()')>fresh);
 // Specialist OVR skills are reachable by the existing training groups.
 const count=run('Object.keys(POSITION_OVR_PROFILES).filter(p=>{const g=new Set(trainingSkillKeys(p));return [...Object.keys(POSITION_OVR_PROFILES[p].physical),...Object.keys(POSITION_OVR_PROFILES[p].skills)].every(k=>g.has(k))}).length');
 assert.strictEqual(count,22);
 console.log('PASS: save migration, unsigned year records, wear-dependent age, and training coverage for all 22 positions');
}else console.log('PASS: scripts loaded; provide a save path for career state assertions');
// A restored varsity career must still advance through the integrated weekly path.
if(fs.existsSync(savePath)){
 context.testSave=JSON.parse(fs.readFileSync(savePath,'utf8'));
 const week=run(`game=testSave; migrateSkillModel(); game.stage='highschool'; game.grade=11; game.year=3; game.phase=1; game.week=2; game.gamePending=false; game.scheduledEvent=null; game.focus=Object.fromEntries(trainingGroups().map(g=>[g[0],2])); const before=game.week; applyWeek(); ({before,after:game.week,roster:game.team.length})`);
 assert.strictEqual(week.after,week.before+1,'high-school week must advance exactly once');
 assert(week.roster>0);
 console.log('PASS: integrated high-school weekly advancement');
}

// Training participation must materially influence growth across every position.
if(fs.existsSync(savePath)){
 const results=run(`(() => {
  const positions=Object.keys(POSITION_OVR_PROFILES), out=[];
  const original=JSON.parse(JSON.stringify(testSave));
  for(const pos of positions){
   const values=[];
   for(const hours of [0,8,20]){
    game=JSON.parse(JSON.stringify(original));game.pos=pos;game.stage='college';game.progress={};
    game.athleticAttributes=Object.fromEntries(PHYSICAL_ATTRIBUTES.map(k=>[k,50]));
    game.technicalAttributes=Object.fromEntries(TECHNICAL_SKILLS.map(k=>[k,50]));
    game.college={program:{coaching:70,facilities:70},weeklyPlan:{training:hours,study:6,recovery:8},games:[],year:2,phase:'season'};
    game.focus=Object.fromEntries(trainingGroups(pos).map(g=>[g[0],Math.round(hours/5)]));
    game.teamIntensity=2;game.extraIntensity=2;game.fatigue=5;game.stress=10;game.morale=80;game.injury=null;
    syncLegacyAttrs();const before=rating(game.attrs,pos);
    for(let w=0;w<52;w++)developWeek();values.push(rating(game.attrs,pos)-before);
   }
   out.push({pos,low:values[0],mid:values[1],high:values[2]});
  }
  game=original;return out;
 })()`);
 for(const x of results){
  assert(x.high>=x.mid && x.mid>=x.low,JSON.stringify(x));
  assert(x.high>x.low,'Training did not affect '+x.pos);
 }
 console.log('PASS: low / moderate / dedicated training responses for all 22 positions');
}
