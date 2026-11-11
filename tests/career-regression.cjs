// Structural regression test for training, development and the NFL lifecycle.
// Run: node tests/career-regression.cjs [/path/to/exported-save.json]   (requires Playwright + Chromium)
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),POS=['QB','RB','FB','WR','TE','LT','LG','C','RG','RT','DE','DT','NT','OLB','ILB','MLB','CB','FS','SS','K','P','LS'];
(async()=>{const browser=await chromium.launch({args:['--disable-dev-shm-usage']});
 const open=async()=>{const p=await browser.newPage();p.on('pageerror',e=>{throw e});p.on('dialog',d=>d.accept());await p.goto('file://'+root+'/index.html');await p.waitForTimeout(120);return p};
 // 1. Every skill that drives a position's OVR can be trained at that position (physical, technical, scheme stay separate).
 let page=await open();
 const reach=await page.evaluate(POS=>POS.map(pos=>{creatorPosition=pos;part9ChangePosition(pos);part9Start();const prof=POSITION_OVR_PROFILES[pos],keys=new Set(trainingSkillKeys(pos));
  return {pos,missing:[...Object.keys(prof.skills),...Object.keys(prof.physical)].filter(k=>!keys.has(k)),groups:trainingGroups(pos).length,schemeInStores:Object.keys(game.v6||{}).length>0&&![...PHYSICAL_ATTRIBUTES,...TECHNICAL_SKILLS].some(k=>/scheme|playbook/i.test(k))}}),POS);
 for(const r of reach){assert.deepEqual(r.missing,[],r.pos+' has OVR skills no training group can raise: '+r.missing);assert(r.groups>=3,r.pos+' needs training groups');assert(r.schemeInStores,'scheme knowledge must stay out of the skill stores')}
 await page.close();
 // 2. Focused training raises OVR for every position at every level (HS, college, NFL offseason).
 page=await open();
 const grow=await page.evaluate(POS=>{persist=function(){};render=function(){};const out=[];for(const pos of POS){creatorPosition=pos;part9ChangePosition(pos);part9Start();const gs=trainingGroups(pos);const stages={};
  for(const stage of ['highschool','college','nfl']){game.stage=stage;if(stage==='college')game.college=game.college||{program:{coaching:65,facilities:70},weeklyPlan:{training:14,study:8,recovery:8},games:[],year:1,phase:'season'};if(stage==='nfl'){game.v6.nfl=v6League();game.v6.nfl.playerAge=24}
   const plan=trainingPlan();plan.training=14;game.focus=Object.fromEntries(gs.map((g,i)=>[g[0],i<3?5:0]));const before=rating(game.attrs,pos);for(let w=0;w<40;w++)developWeek();stages[stage]=rating(game.attrs,pos)-before}
  out.push({pos,stages})}return out},POS);
 for(const r of grow)for(const [stage,gain] of Object.entries(r.stages))assert(gain>=1,r.pos+' '+stage+': 40 weeks of focused training gained '+gain+' OVR');
 await page.close();
 // 3. Full careers: no cut loop, contracts renew, careers end (retirement or release) and the draft spreads over rounds.
 const rounds=new Set();let endings={retired:0,active:0};
 for(const pos of ['QB','RB','LT','DT','MLB','CB','K']){for(const build of ['focused','default']){page=await open();
  const r=await page.evaluate(({pos,build})=>{render=function(){};persist=function(){};creatorPosition=pos;part9ChangePosition(pos);
   if(build==='focused'){const pr=POSITION_OVR_PROFILES[pos];for(const k of [...Object.keys(pr.skills),...Object.keys(pr.physical)])part9SetStat(k,70)}
   part9Start();let steps=0;const info={outcome:'unknown',round:null,contracts:0};
   while(steps++<9000){const gs=trainingGroups();const pl=game.stage==='college'?game.college.weeklyPlan:game.plan;if(pl&&gs.length){const per=Math.floor(Number(pl.training||0)/gs.length);game.focus={};for(const g of gs)game.focus[g[0]]=per}
    if(game.scheduledEvent){chooseEvent(0);continue}const st=game.stage||'highschool';
    if(st==='highschool'){if(game.finished){info.outcome='stuck';break}game.gamePending?simulateGame():nextWeek()}
    else if(st==='recruiting'){const rs=recruitingState(),o=rs.offers.find(x=>x.offer);o?collegeSign(o.id):collegeSign(rs.colleges[0].id,true)}
    else if(st==='college'){const c=game.college;if(c.phase==='offseason'){(c.offseasonWeeks||0)<careerOffseasonWeeks('college')?v603CollegeOffseasonWeek():collegeNextYear()}else if(c.phase==='jucoGraduation'){info.outcome='juco';break}else collegeSimGame()}
    else if(st==='collegeComplete'){v6NFLDeclare();info.round=v6League().draftRound}
    else{const n=v6League();if(n.status==='retired'){info.outcome='retired';break}if(n.year>=20){info.outcome='active';break}
     if(n.offers?.length&&(n.status==='entry'||n.status==='freeAgency'))v6NFLSign(n.offers[0].teamId);
     else if(n.phase==='offseason'){if((n.offseasonWeeks||0)<careerOffseasonWeeks('nfl'))v6NFLOffseasonWeek();else v6NFLNextYear()}
     else v6NFLAdvance()}}
   info.contracts=v6League().contracts.length;info.steps=steps;return info},{pos,build});
  assert(r.outcome==='retired'||r.outcome==='active',pos+' '+build+' ended as '+r.outcome);assert(r.steps<9000,pos+' '+build+' never terminated');
  if(r.round!==null)rounds.add(r.round);endings[r.outcome==='retired'?'retired':'active']++;await page.close()}}
 assert(rounds.size>=3,'draft rounds should spread across several rounds, saw '+[...rounds]);
 // 4. An exported save loads, migrates to the modern skill model and keeps its training focus valid.
 if(process.argv[2]){const save=fs.readFileSync(process.argv[2],'utf8');page=await open();await page.evaluate(s=>localStorage.setItem('gridiron-life-v6',s),save);await page.reload();await page.waitForTimeout(250);
  const m=await page.evaluate(()=>({v:game.version,model:game.skillModel,ok:Object.keys(game.focus||{}).every(k=>trainingGroups().some(g=>g[0]===k)),ovr:rating(game.attrs,game.pos)}));
  assert.equal(m.v,6);assert.equal(m.model,2);assert(m.ok,'saved focus ids must map to training groups');assert(m.ovr>0);await page.close()}
 await browser.close();console.log('career-regression: all checks passed',{draftRounds:[...rounds].sort(),endings});
})().catch(e=>{console.error(e);process.exit(1)});
