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
function simulateGame(){
  if(!game.gamePending)return;
  let d=depth(),rank=d.rank,role=game.injury?'Out (Injury)':d.role,sch=game.school,match=currentMatchup()||{opponentName:'Unknown opponent',opponentStrength:50};
  const upperDress=!match.playoff?d.dressLevel:null;
  const gameLevel=match.playoff?'Varsity':d.level;
  if(match.playoff&&d.level!=='Varsity'){role=d.dressLevel==='Varsity'?'Backup (Varsity dress)':'Not rostered for Varsity';rank=999;}
  let offensePlays=R(46,67),runPlays=0,passPlays=0, log=[],stats={carries:0,rushYards:0,rushTD:0,targets:0,receptions:0,recYards:0,recTD:0,passAtt:0,passComp:0,passYards:0,passTD:0,interceptions:0,offSnaps:0,defSnaps:0,stSnaps:0,tackles:0,tfl:0,sacks:0,passDef:0,defInt:0,forcedFumbles:0,blocks:0,pressures:0,fgAtt:0,fgMade:0,xpAtt:0,xpMade:0,punts:0,puntYards:0,longSnaps:0};
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
    let run=Math.random()<sch.runRate;run?runPlays++:passPlays++;
    let you=Math.random()<share;
    if(game.pos==='RB' || game.pos==='FB'){
      const routeShare=game.pos==='RB'?.23:.09;
      you=Math.random()<share*(run?1.25:Math.min(2.2,routeShare/Math.max(.12,1-sch.runRate)*2.6));
    }
    if(game.pos==='QB')you=!game.injury&&rank<=2&&Math.random()<(role==='Starter'?.88:.20);
    if(run){
      let yards=cl(R(-3,9)+Math.round((game.attrs.vision-45)/12)+Math.round((sch.prestige-(match.opponentRunDefense??match.opponentStrength))/16)-Math.floor(game.fatigue/34)-Math.floor(healthState().wear/35)+(you&&['RB','FB'].includes(game.pos)&&typeof v6GameplayRunBonus==='function'?v6GameplayRunBonus():0),-5,23);
      teamRush+=yards;
      if(you&&game.pos==='QB'){
        stats.offSnaps++;
        // Designed QB runs scale with scheme and mobility; slow QBs still
        // occasionally run sneaks and broken plays, but rarely break away.
        const mobility=(game.attrs.speed+game.attrs.agility+game.attrs.accel)/3;
        const attemptOdds=cl(.035+(mobility-48)/270+(sch.runRate-.45)*.14,.012,.32);
        if(Math.random()<attemptOdds){
          const runYards=cl(Math.round(R(-4,8)+(mobility-48)/10-game.fatigue/40),-6,26);
          stats.carries++;stats.rushYards+=runYards;
          const td=advance(runYards,true,'run');
          log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Designed QB run '+runYards+' yd'+(td?' · TOUCHDOWN':'')+'.');
        }else advance(yards,false,'run');
      }else if(you&&['RB','FB'].includes(game.pos)){
        stats.offSnaps++;
        stats.carries++;stats.rushYards+=yards;
        let td=advance(yards,true,'run');
        log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Carry '+(yards>=0?'+':'')+yards+' yd'+(td?' · TOUCHDOWN':'')+'.');
      }else advance(yards,false,'run');
    }else{
      let passingSkill=game.pos==='QB'?(game.attrs.accuracy*.65+game.attrs.awareness*.35):game.pos==='WR'||game.pos==='TE'?game.attrs.catching:48;
      let success=Math.random()<cl(.51+(passingSkill-45)/310+(sch.prestige-(match.opponentPassDefense??match.opponentStrength))/210-game.fatigue/900+(you&&typeof v6GameplayCatchBonus==='function'?v6GameplayCatchBonus():0)+(typeof v6GameplayKnowledgeBonus==='function'?v6GameplayKnowledgeBonus():0),.24,.85),yards=success?R(1,Math.max(10,Math.min(35,Math.round(14+(game.pos==='QB'?game.attrs.arm:50)/6)))):0;
      teamPass+=yards;
      if(you&&(['WR','TE','RB','FB'].includes(game.pos))){
        stats.offSnaps++;
        stats.targets++;
        if(success){
          stats.receptions++;stats.recYards+=yards;
          let td=advance(yards,true,'receive');
          log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · '+yards+' yd reception'+(td?' · TOUCHDOWN':'')+'.');

        }else{advance(0,false,'pass');log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Target, incomplete.');}
      }else if(you&&game.pos==='QB'){
        stats.offSnaps++;
        // Pressure can force an improvised scramble instead of a pass.
        const mobility=(game.attrs.speed+game.attrs.accel+game.attrs.agility)/3;
        const scramble=Math.random()<cl(.025+(mobility-48)/300,.008,.21);
        if(scramble){
          const scrambleYards=cl(Math.round(R(-4,9)+(mobility-48)/9-game.fatigue/45),-7,28);
          stats.carries++;stats.rushYards+=scrambleYards;
          const td=advance(scrambleYards,true,'run');
          log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · QB scramble '+scrambleYards+' yd'+(td?' · TOUCHDOWN':'')+'.');
          continue;
        }
        stats.passAtt++;
        if(success){
          stats.passComp++;stats.passYards+=yards;
          let td=advance(yards,true,'pass');
          log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Completed pass for '+yards+' yd'+(td?' · TOUCHDOWN':'')+'.');

        }else{if(Math.random()<cl(.064-(game.attrs.awareness-45)/750,.012,.11)){stats.interceptions++;nextDrive();log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Interception.')}else{advance(0,false,'pass');log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Incomplete pass.')}}
      }else advance(success?yards:0,false,'pass');
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
  opponent=opponentDrives();
  let overtime=false;if(gameScore===opponent){overtime=true;if(Math.random()<.5)gameScore+=3;else opponent+=3}
  const win=gameScore>opponent;
  if(!match.playoff){
    game.squadRecords[gameLevel][win?0:1]++;
    game.record=game.squadRecords[d.level].slice();
  }else{game.postseasonRecord=game.postseasonRecord||[0,0];game.postseasonRecord[win?0:1]++}
  const varsityOutcome=otherSquadGames(gameLevel,match)||{score:gameScore,opp:opponent};
  if(!match.playoff)game.programRecord[varsityOutcome.score>varsityOutcome.opp?0:1]++;
  const result={week:game.week,playoff:!!match.playoff,round:match.round||null,overtime,phase:game.phase,year:game.year,score:gameScore,opp:opponent,opponentName:match.opponentName,opponentStrength:match.opponentStrength,opponentDefense:match.opponentDefense,opponentRunDefense:match.opponentRunDefense,opponentPassDefense:match.opponentPassDefense,win,role,level:gameLevel,upperDress,secondaryPosition:tw.active?game.secondaryPosition:null,stats,teamRush,teamPass,runPlays,passPlays,plays:log};
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
