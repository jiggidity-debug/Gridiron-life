/* v0.5 Part 4: score-linked opponents, separate squads, districts, postseason. */
function otherSquadGames(playerLevel,match){
  game.squadResults=game.squadResults||[];
  if(match.playoff)return null;
  let varsityOutcome=null;
  for(const level of levelsForSchool(game.school)){
    if(level===playerLevel)continue;
    let advantage=(game.school.prestige-match.opponentStrength)/8;
    let own=cl(R(10,37)+Math.round(advantage),0,55),opp=cl(R(10,37)-Math.round(advantage),0,55);
    if(own===opp)own++;
    const win=own>opp;
    game.squadRecords[level][win?0:1]++;
    const outcome={year:game.year,week:game.week,level,opponentName:match.opponentName,score:own,opp,win};
    game.squadResults.push(outcome);
    if(level==='Varsity')varsityOutcome=outcome;
  }
  return varsityOutcome;
}
// Secondary defensive assignment. Small-school duty can be requested by any
// healthy athlete; larger schools evaluate exceptional two-way candidates.
function twoWayDecision(){
  const pos=game.secondaryPosition;
  if(!pos||!DEFENSIVE_POSITIONS.includes(pos)||pos===game.pos||DEFENSIVE_POSITIONS.includes(game.pos))return {active:false,reason:'No secondary defensive position selected'};
  const level=game.school.classif,skill=rating(game.attrs,pos),primary=rating(game.attrs,game.pos);
  const allowed=level<=2||skill>= (level<=4?57:68)&&primary>= (level<=4?55:68);
  return {active:allowed&&Boolean(game.twoWayRequested),skill,level,reason:!game.twoWayRequested?'Two-way duty not requested':allowed?'Approved for two-way snaps':`Coach requires stronger secondary-position evaluation at ${level}A`};
}
function requestTwoWay(pos,enabled){
  if(game.gamePending){feedback='Finish the pending game first.';render();return}
  if(pos&&!DEFENSIVE_POSITIONS.includes(pos)){feedback='Select a defensive secondary position.';render();return}
  game.secondaryPosition=pos||null;game.twoWayRequested=Boolean(enabled);
  const d=twoWayDecision();feedback=d.reason;
  note('Two-way request: '+(pos||'None')+'. '+d.reason+'.');persist();render();
}
function simulateSecondaryDefense(stats,log,snapShare){
  const skill=rating(game.attrs,game.secondaryPosition);
  const classBonus=game.school.classif<=2?1:.6;
  const snaps=Math.round(R(39,64)*snapShare*classBonus);
  stats.defSnaps+=snaps;
  for(let i=0;i<snaps;i++){
    const q=Math.min(4,1+Math.floor(i/Math.max(1,snaps/4)));
    if(Math.random()<cl(.065+(skill-43)/750,.025,.16)){
      stats.tackles++;if(Math.random()<.15){stats.tfl++;log.push('Q'+q+' · Two-way '+game.secondaryPosition+' tackle for loss.');}
    }
    if(['DE','DT','NT','OLB','ILB','MLB'].includes(game.secondaryPosition)&&Math.random()<cl(.013+(skill-45)/2000,.003,.038)){
      stats.pressures++;if(Math.random()<.25){stats.sacks++;log.push('Q'+q+' · Two-way quarterback sack.');}
    }
    if(['CB','FS','SS','OLB','ILB','MLB'].includes(game.secondaryPosition)&&Math.random()<.013){
      stats.passDef++;if(Math.random()<.14){stats.defInt++;log.push('Q'+q+' · Two-way interception.');}
    }
  }
  log.push('Two-way defense · '+snaps+' snaps, '+stats.tackles+' tackles, '+stats.sacks+' sacks.');
}
// Shared run evaluation: physical tools, carrying/vision, existing playbook
// knowledge and coaching oppose the current matchup's run defense. No single
// attribute is permitted to dominate the result.
function runYardsFor(runner,match,scheme,liveUser=false){
 const a=runner.attrs||{},v=k=>Number(a[k]||35),def=Number(match.opponentRunDefense??match.opponentDefense??match.opponentStrength??55);
 const knowledge=liveUser&&typeof v6LearnedScheme==='function'?v6LearnedScheme(scheme.scheme):cl((runner.ovr||rating(a,runner.pos))*1.05,15,85);
 const playbook=liveUser&&typeof v6Playbook==='function'?v6Playbook().knowledge:knowledge*.75;
 const physical=(v('speed')-45)*.020+(v('accel')-45)*.027+(v('agility')-45)*.020+(v('elusiveness')-45)*.022+(v('power')-45)*.021+(v('endurance')-45)*.007;
 const technical=(v('vision')-45)*.019+(v('carrying')-45)*.013+(knowledge-45)*.016+(playbook-45)*.009;
 const matchup=(scheme.coaching-55)*.010-(def-55)*.056;
 const health=liveUser?(game.fatigue*.020+healthState().wear*.012):0;
 const technique=liveUser&&typeof v6GameplayRunBonus==='function'?v6GameplayRunBonus()*.28:0;
 const burst=Math.random()<cl(.035+(v('speed')+v('accel')+v('agility')-150)/1800,.015,.14)?R(5,15):0;
 return cl(Math.round(R(-3,8)+physical+technical+technique+matchup-health+burst),-7,34);
}
function selectCoachPlayer(pool,scheme,pos,chosenRole){
 if(!pool.length)return null;
 const reliability=cl(Number(scheme.star||50)/100,0,1);
 const weights=pool.map(x=>{
   const a=x.attrs||{},ovr=x.ovr||rating(a,x.pos);
   const style=programArchetype(x);
   const fit=(scheme.scheme==='Power Run'||scheme.scheme==='Wishbone')?(style==='Power'?5:0):(scheme.scheme==='Spread'?(style==='Speed'||style==='Vertical'?5:0):0);
   const trust=x.id==='you'?((game.coachTrust||50)-50)*.07:0;
   const talent=cl(ovr+fit+trust,10,99);
   // Reliance governs how concentrated touches become, with no per-game cap.
   return Math.pow(Math.max(2,talent-12),.75+reliability*1.7);
 });
 let roll=Math.random()*weights.reduce((a,b)=>a+b,0);
 for(let i=0;i<pool.length;i++){roll-=weights[i];if(roll<=0)return pool[i]}
 return pool[pool.length-1];
}
function simulateGame(){
  if(!game.gamePending)return;
  let d=depth(),rank=d.rank,role=game.injury?'Out (Injury)':d.role,sch=game.school,match=currentMatchup()||{opponentName:'Unknown opponent',opponentStrength:50};
  const upperDress=!match.playoff?d.dressLevel:null;
  const gameLevel=match.playoff?'Varsity':d.level;
  if(match.playoff&&d.level!=='Varsity'){role=d.dressLevel==='Varsity'?'Backup (Varsity dress)':'Not rostered for Varsity';rank=999;}
  let offensePlays=R(46,67),runPlays=0,passPlays=0, log=[],stats={carries:0,rushYards:0,rushTD:0,targets:0,receptions:0,recYards:0,recTD:0,passAtt:0,passComp:0,passYards:0,passTD:0,interceptions:0,offSnaps:0,defSnaps:0,stSnaps:0,tackles:0,tfl:0,sacks:0,passDef:0,defInt:0,forcedFumbles:0,blocks:0,pressures:0,fgAtt:0,fgMade:0,xpAtt:0,xpMade:0,punts:0,puntYards:0,longSnaps:0};
  const onField=programGameRoster(gameLevel);
  const rushingRoom=onField.filter(x=>x.pos==='RB'||x.pos==='FB');
  const targetRoom=onField.filter(x=>['WR','TE','RB','FB'].includes(x.pos));
  const passerRoom=onField.filter(x=>x.pos==='QB');
  const rosterStats={};
  const getLine=x=>x.id==='you'?stats:(rosterStats[x.id]||(rosterStats[x.id]={carries:0,rushYards:0,rushTD:0,targets:0,receptions:0,recYards:0,recTD:0,passAtt:0,passComp:0,passYards:0,passTD:0,interceptions:0,offSnaps:0,fumbles:0}));
  let share=role==='Starter'?.58:role==='Rotation'?.29:role==='Backup'?.11:.03;
  share*=.65+sch.star/180;share*=game.injury||match.playoff&&d.level!=='Varsity'?0:1;
  // Possession-based scoring: a touchdown only occurs when a play reaches the end zone.
  // The user's yards and turnovers are part of the same possessions as team scoring.
  let gameScore=0,opponent=0,teamRush=0,teamPass=0,ball=R(15,35),downs=0,toGo=10,drivePlays=0,drives=0;
  const nextDrive=()=>{drives++;ball=R(15,35);downs=0;toGo=10;drivePlays=0;};
  const advance=(yards,credit,kind)=>{
    const old=ball;ball=Math.max(1,ball+yards);drivePlays++;if(yards>=toGo){downs=0;toGo=10;}else{downs++;toGo=Math.max(1,toGo-yards);}
    if(ball>=100){gameScore+=7;if(credit&&kind==='pass')stats.passTD++;if(credit&&kind==='run')stats.rushTD++;if(credit&&kind==='receive')stats.recTD++;nextDrive();return true;}
    if(drivePlays>=11||downs>=4){if(ball>=65&&Math.random()<.70)gameScore+=3;nextDrive();}
    return false;
  };
  const opponentDrives=()=>{
    // Opponent scoring is also drive based; team quality and the defensive matchup
    // change successful-play probability, not an independent final-score die roll.
    let score=0;const quality=cl(.49+((match.opponentOffense??match.opponentStrength)-(sch.prestige*.6+sch.coaching*.4))/210,.28,.72);
    for(let drive=0;drive<Math.max(6,Math.round(drives*.88));drive++){
      let yard=R(15,35);
      for(let play=0;play<9;play++){
        if(Math.random()<.055){break;}
        yard+=Math.random()<quality?R(4,16):R(-4,3);
        if(yard>=100){score+=7;break;}
        if(play===8&&yard>=64&&Math.random()<.69)score+=3;
      }
    }
    return score;
  };
  for(let i=0;i<offensePlays;i++){
    const run=Math.random()<sch.runRate;
    if(run)runPlays++;else passPlays++;
    const q='Q'+(Math.floor(i/offensePlays*4)+1)+' · ';
    if(run){
      let carrier=selectCoachPlayer(rushingRoom,sch);
      const qb=selectCoachPlayer(passerRoom,sch);
      if(qb&&Math.random()<cl(.018+(sch.runRate-.5)*.1,.01,.07))carrier=qb;
      if(!carrier){advance(R(-3,6),false,'run');continue;}
      const mine=carrier.id==='you';const line=getLine(carrier);
      const yards=runYardsFor(carrier,match,sch,mine);
      teamRush+=yards;line.carries++;line.rushYards+=yards;line.offSnaps++;
      const loose=Math.random()<cl(.009+(45-Number(carrier.attrs.carrying||35))*.00028,.002,.042);
      if(loose){line.fumbles=(line.fumbles||0)+1;nextDrive();if(mine)log.push(q+'Lost fumble on '+yards+' yd run.');continue;}
      const td=advance(yards,false,'run');if(td)line.rushTD++;
      if(mine)log.push(q+'Carry '+(yards>=0?'+':'')+yards+' yd'+(td?' · TOUCHDOWN':'')+'.');
    }else{
      const passer=selectCoachPlayer(passerRoom,sch);
      const target=selectCoachPlayer(targetRoom,sch);
      const quarterback=passer?getLine(passer):null;
      const receiver=target?getLine(target):null;
      const passingSkill=passer?(Number(passer.attrs.accuracy||35)*.65+Number(passer.attrs.awareness||35)*.35):45;
      const catchSkill=target?(Number(target.attrs.catching||35)*.55+Number(target.attrs.routes||35)*.25+Number(target.attrs.release||35)*.20):45;
      const defense=match.opponentPassDefense??match.opponentDefense??match.opponentStrength;
      const success=Math.random()<cl(.48+(passingSkill-45)*.0021+(catchSkill-45)*.0020+(sch.prestige-defense)*.0018-game.fatigue*.0005,.19,.81);
      const yards=success?cl(Math.round(R(2,20)+(catchSkill-45)*.11+(Number(target?.attrs.speed||40)-45)*.075),1,37):0;
      if(quarterback){quarterback.passAtt++;quarterback.offSnaps++;}
      if(receiver)receiver.targets++;
      if(!success){advance(0,false,'pass');if(passer?.id==='you'||target?.id==='you')log.push(q+'Incomplete pass.');continue;}
      teamPass+=yards;
      if(quarterback){quarterback.passComp++;quarterback.passYards+=yards;}
      if(receiver){receiver.receptions++;receiver.recYards+=yards;receiver.offSnaps++;}
      const td=advance(yards,false,'pass');
      if(td){if(quarterback)quarterback.passTD++;if(receiver)receiver.recTD++;}
      if(passer?.id==='you'||target?.id==='you')log.push(q+(passer?.id==='you'?'Completion':'Reception')+' for '+yards+' yd'+(td?' · TOUCHDOWN':'')+'.');
    }
  }
  // Defensive, offensive-line and specialist box scores are generated from
  // actual role and estimated snaps rather than fake carries/receptions.
  const active=!game.injury&&role!=='Out (Injury)'&&!String(role).startsWith('Not rostered');
  const snapShare=role==='Starter'?.82:role==='Rotation'?.45:role==='Backup'?.16:.04;
  if(active && DEFENSIVE_POSITIONS.includes(game.pos)){
    stats.defSnaps=Math.round(R(45,68)*snapShare);
    const pursuit=((game.attrs.speed||38)+(game.attrs.vision||38)+(game.attrs.power||38))/3;
    const tackleOdds=cl(.075+(pursuit-45)/730,.025,.20);
    for(let i=0;i<stats.defSnaps;i++){
      const q=1+Math.floor(i/Math.max(1,stats.defSnaps/4));
      if(Math.random()<tackleOdds){stats.tackles++;if(Math.random()<.16){stats.tfl++;log.push('Q'+Math.min(q,4)+' · Tackle for loss.');}}
      if(['DE','DT','NT','OLB','ILB','MLB'].includes(game.pos)&&Math.random()<cl(.018+(game.attrs.accel-45)/1800,.004,.05)){
        stats.pressures++;if(Math.random()<.28){stats.sacks++;log.push('Q'+Math.min(q,4)+' · Quarterback sack.');}}
      if(['CB','FS','SS','OLB','ILB','MLB'].includes(game.pos)&&Math.random()<.016){stats.passDef++;if(Math.random()<.18){stats.defInt++;log.push('Q'+Math.min(q,4)+' · Interception made.');}else log.push('Q'+Math.min(q,4)+' · Pass breakup.');}
    }
    if(stats.tackles)log.push('Defensive totals · '+stats.tackles+' tackles, '+stats.tfl+' TFL, '+stats.sacks+' sacks.');
  }else if(active&&LINEMEN.includes(game.pos)){
    stats.offSnaps=Math.round(offensePlays*snapShare);
    const anchorStrength=((game.attrs.blocking||38)+(game.attrs.power||38)+(game.attrs.awareness||38))/3;
    stats.blocks=Math.round(stats.offSnaps*cl(.4+(anchorStrength-45)/220,.15,.8));
    stats.pressures=Math.max(0,Math.round(stats.offSnaps*cl(.09-(anchorStrength-50)/680,.01,.20)));
    log.push('Offensive line · '+stats.offSnaps+' snaps, '+stats.blocks+' successful blocks, '+stats.pressures+' pressures allowed.');
  }else if(active&&SPECIAL_POSITIONS.includes(game.pos)){
    stats.stSnaps=Math.round(R(6,13)*snapShare);
    if(game.pos==='K'){
      stats.fgAtt=Math.round(stats.stSnaps/3);stats.xpAtt=Math.round(stats.stSnaps/3);
      const odds=cl(.55+(game.attrs.accuracy-45)/220,.35,.93);
      for(let i=0;i<stats.fgAtt;i++)if(Math.random()<odds){stats.fgMade++;gameScore+=3;}
      for(let i=0;i<stats.xpAtt;i++)if(Math.random()<cl(odds+.12,.5,.99)){stats.xpMade++;gameScore+=1;}
      log.push('Kicking · '+stats.fgMade+'/'+stats.fgAtt+' FG; '+stats.xpMade+'/'+stats.xpAtt+' PAT.');
    }else if(game.pos==='P'){
      stats.punts=Math.max(1,Math.round(stats.stSnaps/2));stats.puntYards=stats.punts*cl(Math.round(31+(game.attrs.power-38)/5),24,55);
      log.push('Punting · '+stats.punts+' punts for '+stats.puntYards+' yards.');
    }else{stats.longSnaps=stats.stSnaps;log.push('Long snapping · '+stats.longSnaps+' snaps.');}
  }
  // Separate defensive workload and statistics for approved two-way players.
  const tw=twoWayDecision();
  if(active&&tw.active){
    const defenseShare=(role==='Starter'?.75:role==='Rotation'?.46:role==='Backup'?.22:.10);
    simulateSecondaryDefense(stats,log,defenseShare);
  }
  // Teammate defensive and line statistics are derived for the SAME game and
  // stored alongside the player's box score, never fabricated retroactively.
  const defenders=onField.filter(x=>DEFENSIVE_POSITIONS.includes(x.pos));
  for(const x of defenders){
    if(x.id==='you')continue;const l=getLine(x);l.defSnaps=R(36,60);
    l.tackles=l.tackles||0;l.sacks=l.sacks||0;l.tfl=l.tfl||0;
  }
  for(let i=0;i<R(33,52);i++){
    const tackle=selectCoachPlayer(defenders,sch);if(!tackle||tackle.id==='you')continue;
    const l=getLine(tackle);l.tackles++;
    if(Math.random()<.09){l.tfl++;if(['DE','DT','NT','OLB','ILB','MLB'].includes(tackle.pos)&&Math.random()<.25)l.sacks++;}
  }
  for(const lineman of onField.filter(x=>LINEMEN.includes(x.pos)&&x.id!=='you')){
    const l=getLine(lineman);l.offSnaps=offensePlays;
    l.blocks=Math.round(offensePlays*cl(.48+(lineman.ovr-45)*.006,.25,.80));
  }
  opponent=opponentDrives();
  let overtime=false;if(gameScore===opponent){overtime=true;if(Math.random()<.5)gameScore+=3;else opponent+=3}
  const win=gameScore>opponent;
  if(!match.playoff){
    game.squadRecords[gameLevel][win?0:1]++;
    game.record=game.squadRecords[d.level].slice();
  }else{game.postseasonRecord=game.postseasonRecord||[0,0];game.postseasonRecord[win?0:1]++}
  const varsityOutcome=otherSquadGames(gameLevel,match)||{score:gameScore,opp:opponent};
  if(!match.playoff)game.programRecord[varsityOutcome.score>varsityOutcome.opp?0:1]++;
  const result={week:game.week,playoff:!!match.playoff,round:match.round||null,overtime,phase:game.phase,year:game.year,score:gameScore,opp:opponent,opponentName:match.opponentName,opponentStrength:match.opponentStrength,opponentDefense:match.opponentDefense,opponentRunDefense:match.opponentRunDefense,opponentPassDefense:match.opponentPassDefense,win,role,level:gameLevel,upperDress,secondaryPosition:tw.active?game.secondaryPosition:null,stats,rosterStats,teamRush,teamPass,runPlays,passPlays,plays:log};
  game.games.unshift(result);
  recordPositionStarts(gameLevel,match);
  if(game.injury)note('Medical restriction: you missed this game while recovering from '+game.injury.name+'.');
  note((match.playoff?match.round+' playoff':'Game '+game.week)+' against '+match.opponentName+': '+(win?'W':'L')+' '+gameScore+'–'+opponent+'. '+role+' ('+gameLevel+')'+(upperDress?' · Also dressed for '+upperDress+' (backup)':'')+'. '+gameStatsDescription(result,game.pos));
  game.gamePending=false;
  competitionGameFinished(result,varsityOutcome);
  registerGameAwards(result);
  profileGameFinished(result);
  registerGameWorkload(stats,role);
  game.coachTrust=cl(game.coachTrust+(game.injury?0:(win?2:0))+(stats.rushTD+stats.recTD+stats.passTD?2:0),0,100);
  applyWeek();maybeEvent();tab='career';render();
}

/* Part 7: track actual position starts from this release forward. Avoid
   retroactively inventing old NPC starts that the previous game did not log. */
function recordPositionStarts(gameLevel,match){
  game.positionStarts=game.positionStarts||{};
  game.recordedStartWeeks=game.recordedStartWeeks||[];
  const key=game.year+'-'+game.week+'-'+(match.playoff?'playoff':'regular');
  if(game.recordedStartWeeks.includes(key))return;
  game.recordedStartWeeks.push(key);
  const starters=depth().starters;
  const levels=match.playoff?['Varsity']:levelsForSchool(game.school);
  for(const level of levels){
    const id=starters[level];if(!id)continue;
    game.positionStarts[id]=game.positionStarts[id]||{Freshman:0,JV:0,Varsity:0};
    game.positionStarts[id][level]=(game.positionStarts[id][level]||0)+1;
  }
}
