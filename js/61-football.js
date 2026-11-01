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
function simulateGame(){
  if(!game.gamePending)return;
  let d=depth(),rank=d.rank,role=game.injury?'Out (Injury)':d.role,sch=game.school,match=currentMatchup()||{opponentName:'Unknown opponent',opponentStrength:50};
  const upperDress=!match.playoff?d.dressLevel:null;
  const gameLevel=match.playoff?'Varsity':d.level;
  if(match.playoff&&d.level!=='Varsity'){role=d.dressLevel==='Varsity'?'Backup (Varsity dress)':'Not rostered for Varsity';rank=999;}
  let offensePlays=R(46,67),runPlays=0,passPlays=0, log=[],stats={carries:0,rushYards:0,rushTD:0,targets:0,receptions:0,recYards:0,recTD:0,passAtt:0,passComp:0,passYards:0,passTD:0,interceptions:0};
  let share=role==='Starter'?.58:role==='Rotation'?.29:role==='Backup'?.11:.03;
  share*=.65+sch.star/180;share*=game.injury||match.playoff&&d.level!=='Varsity'?0:1;
  let gameScore=0,opponent=cl(R(9,36)+Math.round(((match.opponentOffense??match.opponentStrength)-(sch.prestige*.6+sch.coaching*.4))/4),0,55),teamRush=0,teamPass=0;
  for(let i=0;i<offensePlays;i++){
    let run=Math.random()<sch.runRate;run?runPlays++:passPlays++;
    let you=Math.random()<share;
    if(game.pos==='QB')you=!game.injury&&rank<=2&&Math.random()<(role==='Starter'?.88:.20);
    if(run){
      let yards=cl(R(-3,9)+Math.round((game.attrs.vision-45)/12)+Math.round((sch.prestige-(match.opponentRunDefense??match.opponentStrength))/16)-Math.floor(game.fatigue/34)-Math.floor(healthState().wear/35),-5,23);
      teamRush+=yards;
      if(you&&game.pos==='RB'){
        stats.carries++;stats.rushYards+=yards;
        let td=Math.random()<.038&&yards>0;
        if(td)stats.rushTD++;
        log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Carry '+(yards>=0?'+':'')+yards+' yd'+(td?' · TOUCHDOWN':'')+'.');
        if(td)gameScore+=7;
      }else if(Math.random()<.035)gameScore+=7;
    }else{
      let passingSkill=game.pos==='QB'?(game.attrs.accuracy*.65+game.attrs.awareness*.35):game.pos==='WR'||game.pos==='TE'?game.attrs.catching:48;
      let success=Math.random()<cl(.51+(passingSkill-45)/310+(sch.prestige-(match.opponentPassDefense??match.opponentStrength))/210-game.fatigue/900,.24,.85),yards=success?R(1,Math.max(10,Math.min(35,Math.round(14+(game.pos==='QB'?game.attrs.arm:50)/6)))):0;
      teamPass+=yards;
      if(you&&(['WR','TE','RB'].includes(game.pos))){
        stats.targets++;
        if(success){
          stats.receptions++;stats.recYards+=yards;
          let td=Math.random()<.045;stats.recTD+=td?1:0;
          log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · '+yards+' yd reception'+(td?' · TOUCHDOWN':'')+'.');
          if(td)gameScore+=7;
        }else log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Target, incomplete.');
      }else if(you&&game.pos==='QB'){
        stats.passAtt++;
        if(success){
          stats.passComp++;stats.passYards+=yards;
          let td=Math.random()<.045;stats.passTD+=td?1:0;
          log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Completed pass for '+yards+' yd'+(td?' · TOUCHDOWN':'')+'.');
          if(td)gameScore+=7;
        }else{if(Math.random()<cl(.064-(game.attrs.awareness-45)/750,.012,.11)){stats.interceptions++;log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Interception.')}else log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Incomplete pass.')}
      }else if(Math.random()<.04)gameScore+=7;
    }
  }
  gameScore+=R(0,3)*3;
  let overtime=false;if(gameScore===opponent){overtime=true;if(Math.random()<.5)gameScore+=3;else opponent+=3}
  const win=gameScore>opponent;
  if(!match.playoff){
    game.squadRecords[gameLevel][win?0:1]++;
    game.record=game.squadRecords[d.level].slice();
  }else{game.postseasonRecord=game.postseasonRecord||[0,0];game.postseasonRecord[win?0:1]++}
  const varsityOutcome=otherSquadGames(gameLevel,match)||{score:gameScore,opp:opponent};
  if(!match.playoff)game.programRecord[varsityOutcome.score>varsityOutcome.opp?0:1]++;
  const result={week:game.week,playoff:!!match.playoff,round:match.round||null,overtime,phase:game.phase,year:game.year,score:gameScore,opp:opponent,opponentName:match.opponentName,opponentStrength:match.opponentStrength,opponentDefense:match.opponentDefense,opponentRunDefense:match.opponentRunDefense,opponentPassDefense:match.opponentPassDefense,win,role,level:gameLevel,upperDress,stats,teamRush,teamPass,runPlays,passPlays,plays:log};
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
