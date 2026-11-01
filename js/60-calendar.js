/* v0.5 Part 1: calendar, advancement and independent school-team season records. */
function emptySquadRecords(){return {Freshman:[0,0],JV:[0,0],Varsity:[0,0]}}
function sumRecord(records){return Object.values(records).reduce((tot,r)=>[tot[0]+r[0],tot[1]+r[1]],[0,0])}
function createSchedule(){
  const others=game.schools.filter(s=>s.id!==game.school.id).sort((a,b)=>Math.abs(a.classif-game.school.classif)-Math.abs(b.classif-game.school.classif));
  const near=others.filter(s=>Math.abs(s.classif-game.school.classif)<=1);
  const pool=near.length>=3?near:others;
  return Array.from({length:PHASES[0].weeks},(_,i)=>{const s=pool[(i+R(0,pool.length-1))%pool.length];return {week:i+1,opponentId:s.id,opponentName:s.name,opponentClass:s.classif,opponentStrength:cl(Math.round((s.prestige+s.coaching)/2+R(-7,7)),20,95),home:i%2===0}});
}
function currentMatchup(){return (game.schedule||[])[game.week-1]||null}
function currentRecord(){let l=depth().level;return game.squadRecords?.[l]||game.record||[0,0]}
function seasonGames(year=game.year){return game.games.filter(g=>g.year===year&&g.phase===0)}
function repairSeasonData(){
  game.alumni=game.alumni||[];
  game.seasonHistory=game.seasonHistory||[];
  game.nextNpcId=game.nextNpcId||1000;
  game.squadRecords=emptySquadRecords();
  for(const g of seasonGames()){
    const level=g.level&&game.squadRecords[g.level]?g.level:'Varsity';
    game.squadRecords[level][g.win?0:1]++;
  }
  game.programRecord=game.games.filter(g=>g.phase===0).reduce((r,g)=>{r[g.win?0:1]++;return r},[0,0]);
  game.record=currentRecord().slice();
  game.schedule=createSchedule();
  if(game.year>=2&&!game.team.some(x=>x.grade===9)){
    // Old saves have no stable age history for players capped at grade 12.
    // Preserve ambiguous seniors rather than silently deleting an actual current senior.
    game.team.push(...makeFreshmen(5));
    game.history.unshift({title:'v0.5 legacy roster migration',text:'Incoming ninth graders added. Older v0.4 seniors cannot be dated reliably and will graduate at the next scheduled school-year rollover.'});
  }
}
function archiveFootballSeason(){
  if(game.seasonHistory.some(s=>s.year===game.year))return;
  game.seasonHistory.push({year:game.year,grade:game.grade,records:JSON.parse(JSON.stringify(game.squadRecords||emptySquadRecords())),games:seasonGames().length});
}
function startNextSchoolYear(){
  if(game.grade>=12){game.finished=true;note('High school graduation. College career remains a future update; your records are preserved.');return}
  const turnover=annualRosterTurnover();
  game.grade++;game.year++;
  const maturity=game.physicalType==='late'&&game.grade>=11?R(5,10):game.physicalType==='early'?R(0,2):R(2,5);
  game.weight+=maturity;game.attrs.power=cl(game.attrs.power+Math.floor(maturity/3),20,99);
  game.squadRecords=emptySquadRecords();game.programRecord=[0,0];game.record=[0,0];game.schedule=createSchedule();
  game.history.unshift({title:'School-year roster turnover',text:turnover.graduates+' seniors graduated; '+turnover.entrants+' freshmen arrived. You are entering grade '+game.grade+' for Year '+game.year+'.'});
}
function applyWeek(){
  let d=depth();game.role=d.role;
  let load=impact();game.fatigue=cl(game.fatigue+load.change,0,100);
  applyAcademicsWeek();
  if(game.job){const wages=game.job.hours*game.job.rate;game.money+=wages;ledgerEntry('income',wages,game.job.title+' wages')}
  if(game.transportWeeks>0)game.transportWeeks--; 
  game.morale=cl(game.morale+game.plan.social*.14-game.stress*.012-(game.plan.training>16?1:0),0,100);
  let academicPressure=PHASES[game.phase].school&&strugglingCourses().length?2:0;
  let overwork=Math.max(0,(game.teamIntensity+game.extraIntensity-3))*.9+Math.max(0,game.plan.training-15)*.22;
  let jobPressure=game.job?game.job.hours*.065:0;
  game.stress=cl(game.stress+1+academicPressure+overwork+jobPressure+game.familyExpect/85-game.plan.recovery*.20-game.plan.social*.27,0,100);
  if(game.teamIntensity===0&&PHASES[game.phase].teamHours>0){game.coastingWeeks=(game.coastingWeeks||0)+1;if(game.coastingWeeks%3===0){game.coachTrust=cl(game.coachTrust-2,0,100);note('Coach trust -2: repeated minimum-effort practices.')}} else game.coastingWeeks=0;
  game.gigHoursThisWeek=0;game.activityHoursThisWeek=0;
  if(game.job&&Math.random()<.17)note('Your '+game.job.title+' shift went well. '+game.job.hours+' hours reserved, $'+game.job.hours*game.job.rate+' earned.');
  development();
  if(game.phase===0&&game.week>=6&&game.fatigue>40&&Math.random()<(game.gearProtection?.08:.10)){game.injury={name:pick(['Ankle sprain','Hamstring strain','Shoulder strain']),weeks:R(1,3)};note('Injury: '+game.injury.name+'. Medical staff recommends recovery; unavailable for '+game.injury.weeks+' week(s).')}
  else if(game.injury){game.injury.weeks--;if(game.injury.weeks<=0){note('Medical staff cleared you to return.');game.injury=null}}
  const endingPhase=game.phase,endingWeek=game.week;
  game.week++;game.yearWeeks++;
  if(endingPhase===0&&endingWeek===PHASES[0].weeks)finalizeSemester('Fall');
  if(endingPhase===2&&endingWeek===PHASES[2].weeks)finalizeSemester('Spring');
  if(game.week>PHASES[game.phase].weeks)advancePhase();
  persist();
}
function advancePhase(){
  let last=PHASES[game.phase].name;
  if(game.phase===2){ // Spring ends: the previous year's seniors graduate before summer football.
    archiveFootballSeason();startNextSchoolYear();
    if(game.finished){persist();return}
    game.phase=3;
  }else if(game.phase===4){game.phase=0;game.week=1}
  else {game.phase++;}
  game.week=1;
  note('Calendar transition: '+last+' → '+PHASES[game.phase].name+' · Year '+game.year+', grade '+game.grade+'. Schedule now allows '+hoursCap()+' discretionary hours.');
  if(allHours()>hoursCap()){
    let over=allHours()-hoursCap();
    for(let k of ['social','training','recovery','study','work']){let cut=Math.min(over,game.plan[k]);game.plan[k]-=cut;over-=cut;if(!over)break}
    while(focusTotal()>game.plan.training){let key=Object.keys(game.focus).find(k=>game.focus[k]>0);if(!key)break;game.focus[key]--}
    if(over>0 && game.job){note('A recurring job conflicts with the new phase; it was ended to keep your schedule valid.');game.job=null;over=0}
    note('Your discretionary schedule was reduced to fit the new phase; review commitments.');
  }
  game.scheduledEvent={title:'A new phase begins',body:'Your schedule and expectations have changed. Review your workload, school situation, and relationships before advancing.',choices:[['Review my priorities','You take time to consider what this phase means for your development.',1],['Talk with my family','Your family appreciates being included in your plans.',2]]};
}
function nextWeek(){
  if(game.finished){note('Graduation reached. This build ends at the high-school boundary.');render();return}
  if(game.scheduledEvent||game.gamePending){feedback='Resolve the current event or game before continuing.';render();return}
  if(game.phase===0){game.gamePending=true;game.role=depth().role;note('Week '+game.week+' game day. You must choose to simulate the game.');persist();render();return}
  applyWeek();maybeEvent();render();
}
