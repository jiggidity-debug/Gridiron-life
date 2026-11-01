/* v0.5 Part 1: per-squad game results and named opponents.
   Deep defensive player matchups and the postseason are scheduled for later modules. */
function otherSquadGames(playerLevel,match){
  game.squadResults=game.squadResults||[];
  for(const level of levelsForSchool(game.school)){
    if(level===playerLevel)continue;
    let advantage=(game.school.prestige-match.opponentStrength)/8;
    let own=cl(R(10,37)+Math.round(advantage),0,55),opp=cl(R(10,37)-Math.round(advantage),0,55);
    if(own===opp)own++;
    const win=own>opp;
    game.squadRecords[level][win?0:1]++;
    game.squadResults.push({year:game.year,week:game.week,level,opponentName:match.opponentName,score:own,opp,win});
  }
}
function simulateGame(){
  if(!game.gamePending)return;
  let d=depth(),rank=d.rank,role=d.role,sch=game.school,match=currentMatchup()||{opponentName:'Unknown opponent',opponentStrength:50};
  let offensePlays=R(46,67),runPlays=0,passPlays=0, log=[],stats={carries:0,rushYards:0,rushTD:0,targets:0,receptions:0,recYards:0,recTD:0,passAtt:0,passComp:0,passYards:0,passTD:0,interceptions:0};
  let share=role==='Starter'?.58:role==='Rotation'?.29:role==='Backup'?.11:.03;
  share*=.65+sch.star/180;share*=game.injury?0:1;
  let gameScore=0,opponent=cl(R(7,39)+Math.round((match.opponentStrength-sch.prestige)/5),0,55),teamRush=0,teamPass=0;
  for(let i=0;i<offensePlays;i++){
    let run=Math.random()<sch.runRate;run?runPlays++:passPlays++;
    let you=Math.random()<share;
    if(game.pos==='QB')you=rank<=2&&Math.random()<(role==='Starter'?.88:.20);
    if(run){
      let yards=cl(R(-3,9)+Math.round((game.attrs.vision-45)/12)+Math.round((sch.prestige-match.opponentStrength)/22),-5,23);
      teamRush+=yards;
      if(you&&game.pos==='RB'){
        stats.carries++;stats.rushYards+=yards;
        let td=Math.random()<.038&&yards>0;
        if(td)stats.rushTD++;
        log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Carry '+(yards>=0?'+':'')+yards+' yd'+(td?' · TOUCHDOWN':'')+'.');
        if(td)gameScore+=7;
      }else if(Math.random()<.035)gameScore+=7;
    }else{
      let success=Math.random()<cl(.55+(game.attrs.catching-45)/350+(sch.prestige-match.opponentStrength)/280,.30,.82),yards=success?R(1,19):0;
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
        }else{if(Math.random()<.05){stats.interceptions++;log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Interception.')}else log.push('Q'+(Math.floor(i/offensePlays*4)+1)+' · Incomplete pass.')}
      }else if(Math.random()<.04)gameScore+=7;
    }
  }
  gameScore+=R(0,3)*3;
  const win=gameScore>opponent;
  game.squadRecords[d.level][win?0:1]++;
  game.programRecord[win?0:1]++;
  game.record=game.squadRecords[d.level].slice();
  otherSquadGames(d.level,match);
  const result={week:game.week,phase:game.phase,year:game.year,score:gameScore,opp:opponent,opponentName:match.opponentName,opponentStrength:match.opponentStrength,win,role,level:d.level,stats,teamRush,teamPass,runPlays,passPlays,plays:log};
  game.games.unshift(result);
  note('Game '+game.week+' against '+match.opponentName+': '+(win?'W':'L')+' '+gameScore+'–'+opponent+'. '+role+' ('+d.level+'). '+stats.carries+' carries / '+stats.rushYards+' rushing yards; '+stats.receptions+' catches / '+stats.recYards+' receiving yards.');
  game.gamePending=false;
  game.coachTrust=cl(game.coachTrust+(win?2:0)+(stats.rushTD+stats.recTD+stats.passTD?2:0),0,100);
  applyWeek();maybeEvent();tab='career';render();
}
