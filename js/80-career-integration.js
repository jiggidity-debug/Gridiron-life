/* Gridiron Life 0.7 — unified career lifecycle and college recognition. */
/* Career scheduling, professional development, and action feedback. */
'use strict';
function v603WeekKey(){
 if(!game)return '';
 if(game.stage==='nfl'||game.stage==='nflEntry'){
  const n=game.v6?.nfl||{};return 'NFL:'+n.year+':'+n.phase+':'+n.week;
 }
 if(game.stage==='college'||game.stage==='collegeComplete'){
  const c=game.college||{};return 'COLLEGE:'+c.year+':'+c.phase+':'+c.week;
 }
 return 'HS:'+game.year+':'+game.phase+':'+game.week;
}
function v603IsPro(){return game&&['nfl','nflEntry'].includes(game.stage)}
function v603CareerSync(){
 if(!game)return;
 const key=v603WeekKey();
 if(!key)return;
 if(game.v603WeekKey!==key){
  // For old saves, the old counter was never cleared in the NFL.
  game.activityHoursThisWeek=0;
  game.gigHoursThisWeek=0;
  game.v603WeekKey=key;
  if(typeof persist==='function')persist();
 }
}
// Make the stage key authoritative whenever the week advances, not merely the old HS counter.
const v603OldAllHours=allHours;
allHours=function(){v603CareerSync();return v603OldAllHours()};
const v603OldHoursCap=hoursCap;
hoursCap=function(){return v603IsPro()?30:v603OldHoursCap()};
// Academic stress does not follow an athlete into professional football.
const v603OldStress=stressBreakdown;
stressBreakdown=function(){
 const p=v603OldStress();
 if(v603IsPro()){p.academic=0;p.job=0;p.total=p.baseline+p.intensity+p.extraTraining+p.family-p.social-p.recovery;}
 return p;
};
// Pro life should not display school coursework as a meaningful weekly commitment.
const v603OldDevelopScreen=developScreen;
developScreen=function(){
 if(!v603IsPro())return v603OldDevelopScreen();
 v603CareerSync();const free=Math.max(0,hoursCap()-allHours());
 const fields=[['training','Individual training'],['social','Personal & social time'],['recovery','Recovery and rehabilitation']];
 const allocated=used()+(game.activityHoursThisWeek||0)+(game.gigHoursThisWeek||0)+(game.job?.hours||0);
 return panel('Professional weekly schedule',
  '<p>NFL · 30 discretionary hours each week. Team practices are mandatory and separate from these hours. Purchased activities reset with each new NFL week.</p>'+
  '<div class="line"><strong>'+allocated+' / '+hoursCap()+' hours allocated</strong><span class="accent">'+free+'h free</span></div>'+
  '<p class="muted">Recurring schedule: '+used()+'h · Activities purchased this week: '+(game.activityHoursThisWeek||0)+'h'+(game.job?' · Existing job: '+game.job.hours+'h':'')+'.</p>'+
  fields.map(([k,label])=>rang(label,Number(game.plan[k]||0),0,hoursCap(),"alloc('"+k+"',+this.value)",'h')).join('')+
  (Number(game.plan.study||0)+Number(game.plan.work||0)>0?'<p class="muted">Legacy school/work allocations are being released for professional scheduling.</p>':'')
 )+panel('Team preparation',
  rang('Practice intensity',game.teamIntensity,0,4,"setIntensity('teamIntensity',+this.value)")+
  '<p class="muted">Team sessions and the game plan affect fatigue and roster evaluations.</p>'
 )+panel('Individual training · '+game.plan.training+' hours',
  '<p>Training hours count toward weekly attribute progress. Focus the hours on the skills you want to improve.</p>'+
  '<div class="line"><strong>'+focusTotal()+' / '+game.plan.training+' assigned</strong></div>'+
  GROUPS[game.pos].map(g=>rang(g[1],game.focus[g[0]],0,game.plan.training,"setFocus('"+g[0]+"',+this.value)",'h')).join('')+
  rang('Training intensity',game.extraIntensity,0,4,"setIntensity('extraIntensity',+this.value)")
 )+panel('Player attributes','<div class="grid">'+ATTRS.map(k=>'<div class="tile"><small>'+e(k)+'</small><div class="line"><strong>'+game.attrs[k]+'</strong><small>'+Math.round((game.progress[k]||0)/12*100)+'% to next</small></div></div>').join('')+'</div>')+healthPanel();
};
// Legacy school commitments are removed once for existing NFL players.
function v603NormalizeProPlan(){
 if(!v603IsPro()||game.v603ProPlanMigrated)return;
 game.plan=game.plan||{};
 for(const k of ['training','study','work','social','recovery'])game.plan[k]=Number(game.plan[k]||0);
 game.plan.study=0;game.plan.work=0;
 game.gigHoursThisWeek=0;
 game.v603ProPlanMigrated=true;
 persist();
}
// NFL development remains a mix of club practices and extra focused training.
// Preserve baseline growth; make intentional weekly training count more, with fatigue penalties.
const v603OldNFLDevelopment=v6NFLDevelopment;
v6NFLDevelopment=function(){
 v603CareerSync();
 v603OldNFLDevelopment();
 if(!v603IsPro())return;
 const groups=GROUPS[game.pos]||[], focus=game.focus||{};
 const fatigueFactor=cl(1-Number(game.fatigue||0)/145,.25,1);
 const recovery=Number(game.plan?.recovery||0);
 const intensity=Number(game.extraIntensity||2);
 for(const g of groups){
  const hours=Math.max(0,Number(focus[g[0]]||0));if(!hours)continue;
  const gain=hours*.31*fatigueFactor*(.85+intensity*.12)*(game.gymWeeks>0?1.12:1);
  for(const a of g[2]){
   if(!Number.isFinite(game.attrs[a])||game.attrs[a]>=99)continue;
   game.progress[a]=(Number(game.progress[a])||0)+gain;
   while(game.progress[a]>=12&&game.attrs[a]<99){game.attrs[a]++;game.progress[a]-=12;}
  }
 }
 if(recovery>=5){game.fatigue=cl(game.fatigue-Math.min(7,recovery*.3),0,100);}
 for(const [modern,old] of Object.entries({speed:'speed',accel:'accel',agility:'agility',strength:'power',stamina:'endurance'}))if(game.athleticAttributes&&Number.isFinite(game.attrs[old]))game.athleticAttributes[modern]=game.attrs[old];
 for(const [modern,old] of Object.entries({vision:'vision',carrying:'carrying',catching:'catching',elusiveness:'elusiveness',routes:'routes',release:'release',runBlocking:'blocking'}))if(game.technicalAttributes&&Number.isFinite(game.attrs[old]))game.technicalAttributes[modern]=game.attrs[old];
};
// Success and failure feedback for all purchase buttons, and for changes to weekly plans.
const v603OldBuyItem=buyItem;
buyItem=function(id){
 v603CareerSync();
 const before={money:game.money,morale:game.morale,stress:game.stress,hours:game.activityHoursThisWeek||0};
 feedback='';v603OldBuyItem(id);
 if(game.money<before.money){
  const item=MARKET.find(x=>x.id===id);
  feedback='Purchased '+(item?.name||id)+': $'+(before.money-game.money).toFixed(0)+' spent'+
   (game.morale!==before.morale?', morale '+(game.morale-before.morale>0?'+':'')+Math.round(game.morale-before.morale):'')+
   (game.stress!==before.stress?', stress '+Math.round(game.stress-before.stress):'')+
   ((game.activityHoursThisWeek||0)>before.hours?', '+((game.activityHoursThisWeek||0)-before.hours)+' hours used':'')+'.';
  persist();render();
 }else if(!feedback){feedback='Purchase did not complete; check ownership, available hours and money.';render();}
};
// Capped free-time purchases use the live career week rather than Year 4 HS forever.
// Base market implementation reads game.year/yearWeeks; the adapter maps its comparison
// to a stage-aware stamp without changing the archived HS timeline.
const v603MarketBuy=buyItem;
buyItem=function(id){
 if(['social','family'].includes(id)){
  const current=v603WeekKey();
  game.lastPurchaseWeek=game.lastPurchaseWeek||{};
  const prior=game.lastPurchaseWeek[id];
  if(prior===current){feedback='Already completed '+(id==='social'?'Weekend outing':'Household contribution')+' this '+(v603IsPro()?'NFL ':'')+'week.';render();return;}
  const before=game.money;
  // The legacy function tests a HS stamp: clear only the obsolete cooldown.
  if(game.lastPurchaseWeek[id]===game.year+':'+game.yearWeeks)delete game.lastPurchaseWeek[id];
  v603MarketBuy(id);
  if(game.money<before){game.lastPurchaseWeek[id]=current;persist();}
  return;
 }
 return v603MarketBuy(id);
};
// Keep the store relevant to NFL athletes; historical ownership and purchases persist.
const v603OldMoneyScreen=moneyScreen;
moneyScreen=function(){
 if(!v603IsPro())return v603OldMoneyScreen();
 const available=['gear','social','family','trainer','gym','equipment','event','discretion'];
 const store=MARKET.filter(x=>available.includes(x.id)).map(x=>{
  const owned=x.once&&game.purchases?.[x.id];
  const usedThisWeek=['social','family'].includes(x.id)&&game.lastPurchaseWeek?.[x.id]===v603WeekKey();
  return '<div class="tile store"><div><strong>'+e(x.name)+'</strong><p class="muted">'+e(x.description.replace('school','community').replace('tutoring','mentorship'))+'</p><small>'+x.hours+'h · $'+x.price+'</small></div><button class="alt" '+(owned||usedThisWeek?'disabled':'')+' onclick="buyItem(\''+x.id+'\')">'+(owned?'Owned':usedThisWeek?'Used this week':'Buy · $'+x.price)+'</button></div>';
 }).join('');
 return panel('Professional life & finances','<p>Balance: <strong>$'+Number(game.money||0).toLocaleString(undefined,{maximumFractionDigits:2})+'</strong>. Purchases use the same weekly discretionary-hour budget as personal training. Your NFL salary does not buy OVR directly.</p><p class="muted">Activity hours remaining this week: '+Math.max(0,hoursCap()-allHours())+'.</p><div class="store-grid">'+store+'</div>')+
 panel('Transactions',(game.ledger||[]).slice(0,10).map(x=>'<div class="line"><span>'+e(x.reason)+'</span><strong>$'+x.amount+'</strong></div>').join('')||'<p>No transactions yet.</p>');
};
// Attach unobtrusive, global action status so failures never look like successful clicks.
let v603ToastSerial=0;
function v603Toast(message){
 let el=document.getElementById('v603-action-status');if(!el){el=document.createElement('div');el.id='v603-action-status';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el);}
 el.textContent=message;el.classList.add('visible');
 const serial=++v603ToastSerial;setTimeout(()=>{if(serial===v603ToastSerial)el.classList.remove('visible')},4800);
}
const v603OldRender=render;
render=function(){
 if(game){v603CareerSync();v603NormalizeProPlan();}
 v603OldRender();
 const root=document.getElementById('app');
 if(root&&game&&v603IsPro()){
  // Hide misleading high-school-only labels in the old stress and life panels.
  root.querySelectorAll('.v6-legacy .panel').forEach(p=>{
   if(p.textContent.includes('Stress · how to manage it')){
    const rows=p.querySelectorAll('.line');rows.forEach(row=>{if(row.textContent.includes('Struggling courses'))row.remove();});
   }
  });
 }
};
document.addEventListener('click',function(ev){
 const button=ev.target.closest('button[onclick]');if(!button||!game)return;
 const action=button.getAttribute('onclick')||'';
 if(/^(v6Change|v6Detail|v6GoOld|v6Back|v6OldPage|tab=|render\(\)|openSection|v6Skill)/.test(action))return;
 const before=feedback;
 setTimeout(()=>{
  if(!game)return;
  if(feedback&&feedback!==before)v603Toast(feedback);
  else if(/buyItem\(/.test(action))v603Toast(feedback||'No purchase completed. Check free hours and weekly limits.');
  else if(/alloc\(|setFocus\(|v6TrainFocus\(/.test(action))v603Toast('Weekly training schedule updated.');
 },0);
},true);


/* Calendar-complete college and NFL offseason lifecycle. */
'use strict';
function careerOffseasonWeeks(stage){
 if(stage==='college'){
   const c=game?.college||{},played=(c.games||[]).filter(g=>g.year===c.year).length;
   return 40-Math.max(0,played-12); // Twelve regular-season weeks, plus postseason.
 }
 const n=game?.v6?.nfl||{},played=(n.games||[]).filter(g=>g.year===n.year).length;
 return 52-4-played; // Four camp weeks, regular season and postseason.
}
function careerCalendarPeriod(stage,week){
 if(stage==='college')return week<=10?'Winter development':week<=22?'Spring practices':week<=32?'Summer training':'Fall camp preparation';
 return week<=7?'Winter recovery':week<=12?'Free agency and draft':week<=22?'Organized team activities':'Training camp preparation';
}
function v603OffseasonNotice(kind,week){const stage=kind==='College'?'college':'nfl';feedback=kind+' · '+careerCalendarPeriod(stage,week)+' · week '+week+'/'+careerOffseasonWeeks(stage)+'. Training and recovery applied.';}
function v603CollegeOffseasonWeek(){
 const c=collegeState();if(!c||c.phase!=='offseason')return;
 c.offseasonWeeks=Number(c.offseasonWeeks||0);
 if(c.offseasonWeeks>=careerOffseasonWeeks('college')){feedback='Offseason complete. Begin the next season or review college exit options.';render();return;}
 const plan=c.weeklyPlan||{training:11,study:8,recovery:9};
 const prior=game.fatigue;
 const training=Math.max(0,Number(plan.training||0)),recovery=Math.max(0,Number(plan.recovery||0));
 const fatigueImpact=cl(1-prior/150,.25,1);
 const efficiency=cl((.55+game.iq/200+game.morale/240-game.stress/450)*(c.program.coaching/70)*(c.program.facilities/75),.22,1.5)*fatigueImpact;
 const groups=GROUPS[game.pos]||[];let gains=[];
 const focusTotalHours=Math.max(1,groups.reduce((a,g)=>a+Number(game.focus?.[g[0]]||0),0));
 for(const g of groups){
  const focused=Number(game.focus?.[g[0]]||0);
  const groupHours=focused>0?training*focused/focusTotalHours:training/Math.max(1,groups.length)*.28;
  for(const [i,attr] of g[2].entries()){
   if(!Number.isFinite(game.attrs[attr])||game.attrs[attr]>=99)continue;
   game.progress[attr]=(Number(game.progress[attr])||0)+groupHours*.42*efficiency*(i===0?1:.65);
   let gained=0;while(game.progress[attr]>=12&&game.attrs[attr]<99){game.attrs[attr]++;game.progress[attr]-=12;gained++;}
   if(gained)gains.push(attr+' +'+gained);
  }
 }
 game.fatigue=cl(Math.round((prior+training*(.12+.09*Number(game.extraIntensity||2))-4.8-recovery*.7)*10)/10,0,100);
 const health=healthState();
 health.wear=cl(Math.round((health.wear-Math.max(.35,1.1+recovery*.17-training*.045))*100)/100,0,100);
 game.stress=cl(game.stress+0.2+training*.04-recovery*.13,0,100);
 game.morale=cl(game.morale+Number(plan.study||0)*0.01+recovery*.045,0,100);
 if(game.injury){game.injury.weeks=Math.max(0,game.injury.weeks-1);if(!game.injury.weeks)game.injury=null;}
 // No college GPA change during an offseason without enrolled classes.
 c.offseasonWeeks++;c.week=c.offseasonWeeks;
 c.history.unshift(careerCalendarPeriod('college',c.week)+' W'+c.week+': fatigue '+prior.toFixed(0)+' → '+game.fatigue.toFixed(0)+(gains.length?' · '+gains.join(', '):' · skill progress earned'));
 c.history=c.history.slice(0,250);
 v603OffseasonNotice('College',c.week);persist();render();
}
const v603CollegeFinishOriginal=collegeFinishYear;
collegeFinishYear=function(){
 const before=game?.college?.yearHistory?.length||0;
 v603CollegeFinishOriginal();
 const c=game?.college;if(!c||c.yearHistory.length===before)return;
 c.offseasonWeeks=0;
 // Let players develop through their final college offseason before NFL entry.
 if(c.phase==='complete'&&game.stage==='collegeComplete'){c.phase='offseason';game.stage='college';c.finalCollegeOffseason=true;}
 persist();
};
const v603CollegeNextOriginal=collegeNextYear;
collegeNextYear=function(){
 const c=collegeState();if(!c||c.phase!=='offseason')return;
 if(Number(c.offseasonWeeks||0)<careerOffseasonWeeks('college')){feedback='Complete '+(careerOffseasonWeeks('college')-Number(c.offseasonWeeks||0))+' more college offseason weeks before starting the new season.';render();return;}
 if(c.finalCollegeOffseason||c.eligibilityUsed>=4||c.year>=5){
  c.phase='complete';game.stage='collegeComplete';profileMilestone('college-completed','College football career completed','Finished at '+c.program.name+'.',{snapshot:true});persist();render();return;
 }
 v603CollegeNextOriginal();c.offseasonWeeks=0;persist();
};
// Unlike the old version, expiring contracts no longer skip every offseason week.
v6NFLFinishSeason=function(){
 const n=v6League();n.seasonHistory.push({year:n.year,team:n.team?.name||'Free Agent',record:n.record.slice(),status:n.rosterStatus,games:n.games.filter(g=>g.year===n.year).length});
 n.phase='offseason';n.status='offseason';n.week=0;n.offseasonWeeks=0;
 n.contractYears=Math.max(0,n.contractYears-1);
 n.history.unshift('NFL Year '+n.year+' complete: '+n.record.join('–')+'. The full offseason calendar is available for preparation.');
 if(n.contractYears===0)n.news.unshift({title:'Contract expired',body:'Free agency will open during the offseason calendar.'});
 persist();
};
const v603NFLNextOriginal=v6NFLNextYear;
v6NFLNextYear=function(){
 const n=v6League();if(n.phase!=='offseason')return;
 if(Number(n.offseasonWeeks||0)<careerOffseasonWeeks('nfl')){feedback='Complete '+(careerOffseasonWeeks('nfl')-Number(n.offseasonWeeks||0))+' more NFL offseason weeks.';render();return;}
 if(n.contractYears===0){if(!n.offers?.length)v6NFLOffers();feedback='Sign a free-agent contract to enter the next training camp.';render();return;}

 v603NFLNextOriginal();n.offseasonWeeks=0;persist();
};
function v603NFLOffseasonWeek(){
 const n=v6League();if(game.stage!=='nfl'||n.phase!=='offseason')return;
 n.offseasonWeeks=Number(n.offseasonWeeks||0);
 if(n.offseasonWeeks>=careerOffseasonWeeks('nfl')){feedback='NFL offseason complete. Continue to camp or free agency.';render();return;}
 const prev=game.fatigue,rest=Number(game.plan?.recovery||0),train=Number(game.plan?.training||0);
 // Uses the standard NFL player-development routine, including the established focused-training bonus.
 v6NFLDevelopment();
 game.fatigue=cl(Math.round((game.fatigue+train*(.11+.06*Number(game.extraIntensity||2))-5.5-rest*.82)*10)/10,0,100);
 const health=healthState();
 health.wear=cl(Math.round((health.wear-Math.max(.35,.95+rest*.16-train*.045))*100)/100,0,100);
 game.stress=cl(game.stress+.4+train*.04-rest*.13-Number(game.plan?.social||0)*.09,0,100);
 game.morale=cl(game.morale+Number(game.plan?.social||0)*.18+rest*.03,0,100);
 if(game.injury){game.injury.weeks=Math.max(0,game.injury.weeks-1);if(!game.injury.weeks)game.injury=null;}
 n.offseasonWeeks++;n.week=n.offseasonWeeks;
 if(n.offseasonWeeks===8&&n.contractYears===0){
   v6NFLOffers();n.phase='offseason';n.status='freeAgency';
   n.news.unshift({title:'Free agency opens',body:'Review contract offers during the offseason, then continue weekly preparation.'});
 }
 if(n.offseasonWeeks===12)n.news.unshift({title:'NFL Draft',body:'The annual rookie draft has concluded; clubs continue offseason roster evaluations.'});
 if(n.offseasonWeeks===19)n.news.unshift({title:'Organized team activities',body:'Teams hold practices and prepare their playbooks before training camp.'});
 n.history.unshift(careerCalendarPeriod('nfl',n.week)+' W'+n.week+': fatigue '+prev.toFixed(0)+' → '+game.fatigue.toFixed(0)+'; training completed.');
 n.history=n.history.slice(0,250);
 v603OffseasonNotice('NFL',n.week);persist();render();
}
// If users click the main hub action in the offseason, it advances one week rather than jumping a whole year.
const v603NFLAdvanceOriginal=v6NFLAdvance;
v6NFLAdvance=function(){const n=v6League();if(game.stage==='nfl'&&n.phase==='offseason')return v603NFLOffseasonWeek();return v603NFLAdvanceOriginal();};
const v603ProCareerOriginal=v6ProCareer;
v6ProCareer=function(n){
 let out=v603ProCareerOriginal(n);
 if(n.phase!=='offseason')return out;
 const w=Number(n.offseasonWeeks||0),remaining=careerOffseasonWeeks('nfl')-w;
 const description='<div class="v6-surface"><strong>NFL annual calendar · '+w+'/'+careerOffseasonWeeks('nfl')+' weeks complete</strong><p>Use Develop to choose training, social time and recovery. Each completed week improves skills and allows fatigue to recover. Current fatigue: '+Math.round(game.fatigue)+'.</p><p>Contract: '+(n.contractYears?'Continue with '+e(n.team?.name||'your club'):'Free agency opens in week 8')+'.</p></div>';
 out=out.replace('Start Next Camp','Advance Offseason Week');
 out=out.replace('<div class="v6-surface"><strong>Game Plan</strong>',description+'<div class="v6-surface"><strong>Game Plan</strong>');
 out=out.replace('onclick="v6NFLAdvance()"', 'onclick="v6NFLAdvance()"');
 if(n.status==='freeAgency'&&n.offers?.length)out+='<div class="v6-surface"><strong>Free agency offers</strong>'+n.offers.map(o=>{const t=n.proTeams.find(x=>x.id===o.teamId);return '<button onclick="v6NFLSign('+o.teamId+')">'+e(t?.name||'Club')+' · $'+o.yearly.toLocaleString()+'/yr</button>';}).join('')+'</div>';
 if(remaining===0)out=out.replace('Advance Offseason Week','Finish Offseason / Begin Camp').replace('v6NFLAdvance()','v6NFLNextYear()');
 return out;
};


/* College recognition. Fictional awards evaluated from actual player game logs.
   Separate division awards; do not fabricate national comparisons to unsimulated NPC stats. */
'use strict';
function v603HonorState(){
 const c=collegeState();if(!c)return null;
 if(!Array.isArray(c.honors))c.honors=[];
 if(!Array.isArray(c.showcases))c.showcases=[];
 return c;
}
function v603CollegeProduction(g){
 const s=g.stats||{},n=k=>Number(s[k])||0;
 const offense=n('rushYards')+n('recYards')+n('passYards')*.55;
 const tds=n('rushTD')+n('recTD')+n('passTD');
 const defense=n('tackles')*5+n('tfl')*10+n('sacks')*20+n('passDef')*9;
 const line=n('blocks')*3-n('pressures')*2;
 const kicks=n('fgMade')*18+n('xpMade')*2+n('puntYards')*.12+n('longSnaps')*2;
 return Math.max(0,offense+tds*75+defense+line+kicks-n('interceptions')*30);
}
function v603HonorProgram(c,year){
 const y=c.yearHistory.find(x=>x.year===year),name=y?.program||c.program.name;
 const program=(c.programs||[]).find(p=>p.name===name)||c.program;
 return {name,tier:program.tier||c.program.tier,conference:program.conference||c.program.conference};
}
function v603HonorAdd(c,year,title,kind,detail,score){
 if(c.honors.some(x=>x.year===year&&x.title===title))return false;
 const program=v603HonorProgram(c,year);
 const item={year,title,kind,detail,score,program:program.name,tier:program.tier};
 c.honors.push(item);
 c.news.unshift({year,week:c.week,title:game.name+' earns '+title,body:detail});
 c.history.unshift('COLLEGE HONOR · Year '+year+': '+title+'. '+detail);
 return true;
}
function v603EvaluateWeeklyHonor(result){
 const c=v603HonorState();if(!c||!result||result.role.startsWith('DNP')||result.role==='Practice squad')return;
 const score=v603CollegeProduction(result);
 const tier=v603HonorProgram(c,result.year).tier,scale=tier==='JUCO'?'JUCO ':'';
 if(score>=180)v603HonorAdd(c,result.year,scale+'Conference Player of the Week · W'+result.week,'weekly','Performance recognition: '+Math.round(score)+' impact points against '+result.opponentName+'.',score);
 if(score>=370)v603HonorAdd(c,result.year,scale+'National Player of the Week · W'+result.week,'weekly','National weekly recognition within the '+collegeTier(tier).label+' level.',score);
}
function v603EvaluateSeasonHonors(year){
 const c=v603HonorState();if(!c)return;
 const games=c.games.filter(g=>g.year===year&&!String(g.role).startsWith('DNP'));
 if(!games.length)return;
 const regular=games.filter(g=>g.phase==='regular'),sample=regular.length?regular:games;
 const impact=sample.reduce((sum,g)=>sum+v603CollegeProduction(g),0);
 const avg=impact/sample.length;
 const starts=sample.filter(g=>g.role==='Starter').length;
 const participation=Math.min(1,sample.length/8);
 const eligible=sample.length>=5;
 const program=v603HonorProgram(c,year);
 const prefix=program.tier==='JUCO'?'JUCO ':'';
 const conference=program.conference;
 const details=sample.length+' games; '+Math.round(avg)+' impact points per game; '+starts+' starts. Awards are based on player production, not a full NPC ballot.';
 if(!eligible)return;
 const adj=avg*participation;
 if(adj>=115)v603HonorAdd(c,year,'Second Team '+conference+' All-Conference','season',details,adj);
 if(adj>=190)v603HonorAdd(c,year,'First Team '+conference+' All-Conference','season',details,adj);
 if(adj>=265)v603HonorAdd(c,year,prefix+'Conference Player of the Year','season',details,adj);
 if(adj>=235)v603HonorAdd(c,year,prefix+'Second Team All-American ('+program.tier+')','season',details,adj);
 if(adj>=325)v603HonorAdd(c,year,prefix+'First Team All-American ('+program.tier+')','season',details,adj);
 if(adj>=400)v603HonorAdd(c,year,prefix+'National Player of the Year ('+program.tier+')','season',details,adj);
 if(adj>=250)v603HonorAdd(c,year,prefix+game.pos+' of the Year ('+program.tier+')','season',details,adj);
 if(year===1&&adj>=170)v603HonorAdd(c,year,prefix+'Freshman of the Year ('+program.tier+')','season',details,adj);
 const entry=c.yearHistory.find(x=>x.year===year);
 if(entry){entry.honors=c.honors.filter(x=>x.year===year&&x.kind==='season').map(x=>x.title);}
}
const v603HonorsFinishOriginal=collegeFinishYear;
collegeFinishYear=function(){
 const c=collegeState(),year=c?.year;
 v603HonorsFinishOriginal();
 if(c&&c.yearHistory.some(y=>y.year===year)){
  v603EvaluateSeasonHonors(year);
  persist();
 }
};
const v603HonorsGameOriginal=collegeSimGame;
collegeSimGame=function(){
 const c=collegeState(),before=c?.games?.length||0;
 v603HonorsGameOriginal();
 if(!c||c.games.length===before)return;
 v603EvaluateWeeklyHonor(c.games[0]);
 // End-of-year awards should include the final postseason game even when season completion happened inside simulation.
 if(c.yearHistory.some(y=>y.year===c.games[0].year))v603EvaluateSeasonHonors(c.games[0].year);
 persist();render();
};
function v603ShowcaseEligible(){
 const c=v603HonorState();if(!c)return false;
 const season=c.yearHistory[c.yearHistory.length-1];if(!season)return false;
 const recent=c.games.filter(g=>g.year===season.year&&!String(g.role).startsWith('DNP'));
 const count=recent.length,score=recent.reduce((sum,g)=>sum+v603CollegeProduction(g),0)/Math.max(1,count);
 return count>=5&&(score>=135||recent.filter(g=>g.role==='Starter').length>=6||c.honors.some(h=>h.year===season.year&&h.kind==='season'));
}
function v603PlayCollegeShowcase(){
 const c=v603HonorState();if(!c||!['offseason','jucoGraduation','complete'].includes(c.phase))return;
 const year=c.year;
 if(c.showcases.some(s=>s.year===year)){feedback='Showcase already completed this college year.';render();return;}
 if(!v603ShowcaseEligible()){feedback='Not eligible for a postseason college showcase this year.';render();return;}
 const tier=c.program.tier,juco=tier==='JUCO';
 const name=juco?'JUCO National Prospect Showcase':tier==='FBS'?'Senior All-Star Showcase':'College Division All-Star Showcase';
 const fatigue=Number(game.fatigue||0);
 const performance=cl(Math.round(rating(game.attrs,game.pos)*.73+Number(game.morale||50)*.09-fatigue*.11+R(-7,7)),20,95);
 const grade=performance>=70?'Standout':performance>=55?'Solid':'Developing';
 const boost=performance>=75?3:performance>=62?2:performance>=50?1:0;
 c.showcases.push({year,tier,name,performance,grade,scoutingBoost:boost});
 v603HonorAdd(c,year,name+' invitation','showcase','Played in the '+name+'; evaluation '+performance+'/95 ('+grade+').',performance);
 c.news.unshift({year,week:c.week,title:game.name+' completes '+name,body:'Showcase grade: '+grade+'. Future scouting adjustment: +'+boost+' points. Does not directly raise attributes.'});
 game.fatigue=cl(fatigue+4,0,100);
 feedback=name+' completed: '+grade+' showing; +'+boost+' draft scouting points, +4 fatigue.';
 persist();render();
}
const v603HonorsDraftRatingOriginal=v6ProRating;
v6ProRating=function(){
 const ratingValue=v603HonorsDraftRatingOriginal();
 const c=game?.college;
 const best=Array.isArray(c?.showcases)?Math.max(0,...c.showcases.map(x=>Number(x.scoutingBoost||0))):0;
 const seasonHonors=Array.isArray(c?.honors)?c.honors.filter(h=>h.kind==='season'&&(/All-American|Player of the Year| of the Year/.test(h.title))).length:0;
 return cl(ratingValue+best+Math.min(3,seasonHonors),30,99);
};
function v603CollegeHonorsPanel(){
 const c=v603HonorState();if(!c)return '';
 const awards=[...c.honors].sort((a,b)=>b.year-a.year||({'season':0,'showcase':1,'weekly':2}[a.kind]-{'season':0,'showcase':1,'weekly':2}[b.kind]));
 const archived=c.yearHistory.map(y=>y.year).filter(y=>!c.honors.some(a=>a.year===y&&a.kind==='season'));
 const eligible=v603ShowcaseEligible()&&['offseason','jucoGraduation','complete'].includes(c.phase)&&!c.showcases.some(x=>x.year===c.year);
 const showcase=eligible?'<div class="story"><strong>All-star showcase invitation available</strong><p>Complete a postseason prospect showcase to earn a scouting evaluation. The event causes fatigue and does not guarantee a draft selection.</p><button onclick="v603PlayCollegeShowcase()">Play Prospect Showcase</button></div>':'';
 return panel('College honors & all-star showcases','<p class="muted">Weekly honors, all-conference, divisional All-American, position and national awards are based on your actual college game production. JUCO honors are separate from four-year awards. Unsimulated rival players do not form a complete national ballot.</p>'+showcase+(awards.length?awards.map(a=>'<div class="line"><span><strong>'+e(a.title)+'</strong><br><small>Year '+a.year+' · '+e(a.program)+' · '+e(a.kind)+'</small><br><small>'+e(a.detail)+'</small></span></div>').join(''):'<p>No college honors earned yet.</p>')+(archived.length?'<p class="muted">Season awards for older saves are evaluated from saved game logs when the honors archive is first opened.</p>':''));
}
function v603BackfillCollegeHonors(){
 const c=v603HonorState();if(!c)return;
 if(c.honorsBackfilled)return;
 // Evaluate past completed seasons using original stored game logs, never invented wins or awards.
 for(const entry of c.yearHistory){
  for(const g of c.games.filter(x=>x.year===entry.year))v603EvaluateWeeklyHonor(g);
  v603EvaluateSeasonHonors(entry.year);
 }
 c.honorsBackfilled=true;persist();
}
const v603HonorsCollegeScreenOriginal=collegeScreen;
collegeScreen=function(){v603BackfillCollegeHonors();return v603HonorsCollegeScreenOriginal()+v603CollegeHonorsPanel();};
const v603HonorsProfileOriginal=collegeProfilePanel;
collegeProfilePanel=function(){v603BackfillCollegeHonors();const c=v603HonorState();return v603HonorsProfileOriginal()+panel('College recognition','<p>'+c.honors.filter(h=>h.kind==='season').length+' seasonal awards · '+c.honors.filter(h=>h.kind==='weekly').length+' weekly awards · '+c.showcases.length+' all-star showcases.</p>');};
