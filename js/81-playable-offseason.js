/* v0.603 playable offseason: eight actual development/recovery weeks at college and NFL level. */
'use strict';
const V603_OFFSEASON_WEEKS=8;
function v603OffseasonNotice(kind,week){feedback=kind+' offseason: week '+week+' of '+V603_OFFSEASON_WEEKS+' completed. Training and recovery applied.';}
function v603CollegeOffseasonWeek(){
 const c=collegeState();if(!c||c.phase!=='offseason')return;
 c.offseasonWeeks=Number(c.offseasonWeeks||0);
 if(c.offseasonWeeks>=V603_OFFSEASON_WEEKS){feedback='Offseason complete. Begin the next season or review college exit options.';render();return;}
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
 game.stress=cl(game.stress+0.2+training*.04-recovery*.13,0,100);
 game.morale=cl(game.morale+Number(plan.study||0)*0.01+recovery*.045,0,100);
 if(game.injury){game.injury.weeks=Math.max(0,game.injury.weeks-1);if(!game.injury.weeks)game.injury=null;}
 // No college GPA change during an offseason without enrolled classes.
 c.offseasonWeeks++;c.week=c.offseasonWeeks;
 c.history.unshift('Offseason W'+c.week+': fatigue '+prior.toFixed(0)+' → '+game.fatigue.toFixed(0)+(gains.length?' · '+gains.join(', '):' · skill progress earned'));
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
 if(Number(c.offseasonWeeks||0)<V603_OFFSEASON_WEEKS){feedback='Complete '+(V603_OFFSEASON_WEEKS-Number(c.offseasonWeeks||0))+' more college offseason weeks before starting the new season.';render();return;}
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
 n.history.unshift('NFL Year '+n.year+' complete: '+n.record.join('–')+'. Eight weeks available for offseason preparation.');
 if(n.contractYears===0)n.news.unshift({title:'Contract expires after offseason',body:'Complete offseason development before entering free agency.'});
 persist();
};
const v603NFLNextOriginal=v6NFLNextYear;
v6NFLNextYear=function(){
 const n=v6League();if(n.phase!=='offseason')return;
 if(Number(n.offseasonWeeks||0)<V603_OFFSEASON_WEEKS){feedback='Complete '+(V603_OFFSEASON_WEEKS-Number(n.offseasonWeeks||0))+' more NFL offseason weeks.';render();return;}
 if(n.contractYears===0){n.year++;n.playerAge++;v6NFLOffers();return;}
 v603NFLNextOriginal();n.offseasonWeeks=0;persist();
};
function v603NFLOffseasonWeek(){
 const n=v6League();if(game.stage!=='nfl'||n.phase!=='offseason')return;
 n.offseasonWeeks=Number(n.offseasonWeeks||0);
 if(n.offseasonWeeks>=V603_OFFSEASON_WEEKS){feedback='NFL offseason complete. Continue to camp or free agency.';render();return;}
 const prev=game.fatigue,rest=Number(game.plan?.recovery||0),train=Number(game.plan?.training||0);
 // Uses the standard NFL player-development routine, including the v0.603 focus bonus.
 v6NFLDevelopment();
 game.fatigue=cl(Math.round((game.fatigue+train*(.11+.06*Number(game.extraIntensity||2))-5.5-rest*.82)*10)/10,0,100);
 game.stress=cl(game.stress+.4+train*.04-rest*.13-Number(game.plan?.social||0)*.09,0,100);
 game.morale=cl(game.morale+Number(game.plan?.social||0)*.18+rest*.03,0,100);
 if(game.injury){game.injury.weeks=Math.max(0,game.injury.weeks-1);if(!game.injury.weeks)game.injury=null;}
 n.offseasonWeeks++;n.week=n.offseasonWeeks;
 n.history.unshift('NFL offseason W'+n.week+': fatigue '+prev.toFixed(0)+' → '+game.fatigue.toFixed(0)+'; training completed.');
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
 const w=Number(n.offseasonWeeks||0),remaining=V603_OFFSEASON_WEEKS-w;
 const description='<div class="v6-surface"><strong>Playable NFL Offseason · '+w+'/'+V603_OFFSEASON_WEEKS+' weeks complete</strong><p>Use Develop to choose training, social time and recovery. Each completed week improves skills and allows fatigue to recover. Current fatigue: '+Math.round(game.fatigue)+'.</p><p>Contract: '+(n.contractYears?'Continue with '+e(n.team?.name||'your club'):'Free agency opens after completing this offseason')+'.</p></div>';
 out=out.replace('Start Next Camp','Advance Offseason Week');
 out=out.replace('<div class="v6-surface"><strong>Game Plan</strong>',description+'<div class="v6-surface"><strong>Game Plan</strong>');
 out=out.replace('onclick="v6NFLAdvance()"', 'onclick="v6NFLAdvance()"');
 if(remaining===0)out=out.replace('Advance Offseason Week','Finish Offseason / '+(n.contractYears?'Begin Camp':'Free Agency')).replace('v6NFLAdvance()','v6NFLNextYear()');
 return out;
};
