/* Gridiron Life v0.5 Part 4 — persistent fictional district competition and postseason.
   This is a playable fictional Texas-style 8-school district / 64-school state bracket,
   not an exact encoding of any particular UIL classification or division. */
const PLAYOFF_ROUNDS=['Bi-District','Area','Regional','State Quarterfinal','State Semifinal','State Championship'];
const RIVAL_PLACES=['Clearwater','Pine Ridge','Lakeshore','Kingston','Meadowbrook','Brookhaven','Ironwood','Cypress Bend','Stonebridge','Valley View','Fairmont','South Creek','Silver Oaks','Westlake','Riverton','Granite Hill'];
const RIVAL_MASCOTS=['Falcons','Bulldogs','Mustangs','Panthers','Tigers','Chargers','Wildcats','Rams','Warriors','Eagles','Bears','Raiders'];
function generatedTeam(id,name,classif,strength){
 const defense=cl(strength+R(-12,10),25,96),offense=cl(strength+R(-10,12),25,96);
 return {id,name,classif,strength,offense,defense,runDefense:cl(defense+R(-12,12),25,96),passDefense:cl(defense+R(-12,12),25,96),scheme:pick(SCHEMES)[0],record:[0,0],districtRecord:[0,0],pointsFor:0,pointsAgainst:0};
}
function schoolCompetitionTeam(){
 const s=game.school,base=cl(Math.round(s.prestige*.6+s.coaching*.4),25,94);
 const t=generatedTeam('school',s.name,s.classif,base);
 t.offense=cl(Math.round(base*.87+rating(game.attrs,game.pos)*.13),25,96);
 t.defense=cl(Math.round(s.prestige*.48+s.coaching*.52),25,96);
 t.runDefense=cl(t.defense+R(-6,6),25,96);t.passDefense=cl(t.defense+R(-6,6),25,96);
 t.scheme=s.scheme;
 return t;
}
function districtRoundRobin(ids){
 const rot=ids.slice(),rounds=[];
 for(let r=0;r<ids.length-1;r++){
  const matches=[];
  for(let k=0;k<ids.length/2;k++)matches.push({aId:rot[k],bId:rot[ids.length-1-k]});
  rounds.push(matches);
  rot.splice(1,0,rot.pop());
 }
 return rounds;
}
function makeDistrict(){
 const teams=[schoolCompetitionTeam()];
 for(let i=1;i<8;i++){
  const name=RIVAL_PLACES[(i*3+game.school.id+game.year)%RIVAL_PLACES.length]+' '+RIVAL_MASCOTS[(i*5+game.year)%RIVAL_MASCOTS.length];
  teams.push(generatedTeam('district-'+i,name,game.school.classif,cl(teams[0].strength+R(-22,21),26,93)));
 }
 return teams;
}
function competitionState(){
 if(!game)return null;
 if(game.competition?.year===game.year)return game.competition;
 const oldSchedule=Array.isArray(game.schedule)&&game.schedule.length===12?game.schedule:null;
 const regularWeeks=oldSchedule?12:10;
 const teams=makeDistrict(),robin=districtRoundRobin(teams.map(t=>t.id));
 const fixtures=[],rivalMatches={};
 for(let wk=1;wk<=regularWeeks;wk++){
  if(oldSchedule){
   const original=oldSchedule[wk-1],district=wk>regularWeeks-7;
   const opponent=district?teams[1+wk-(regularWeeks-6)]:null;
   if(opponent){opponent.name=original.opponentName||opponent.name;opponent.strength=original.opponentStrength||opponent.strength}
   fixtures.push({...original,week:wk,district,opponentLeagueId:opponent?.id||null,
    opponentOffense:opponent?.offense??cl((original.opponentStrength||50)+R(-8,8),20,95),
    opponentDefense:opponent?.defense??cl((original.opponentStrength||50)+R(-8,8),20,95),
    opponentRunDefense:opponent?.runDefense??(original.opponentStrength||50),
    opponentPassDefense:opponent?.passDefense??(original.opponentStrength||50)});
   if(district){const other=teams.slice(1).filter(t=>t.id!==opponent.id);rivalMatches[wk]=[{aId:'school',bId:opponent.id},...Array.from({length:3},(_,i)=>({aId:other[i*2].id,bId:other[i*2+1].id}))]}
  }else if(wk<=3){
   const opponents=game.schools.filter(s=>s.id!==game.school.id).sort((a,b)=>Math.abs(a.classif-game.school.classif)-Math.abs(b.classif-game.school.classif));
   const s=opponents[(wk+game.year-2+opponents.length)%opponents.length];
   let strength=cl(Math.round((s.prestige+s.coaching)/2),23,93);
   const opp=generatedTeam('outside-'+s.id,s.name,s.classif,strength);
   fixtures.push({week:wk,opponentId:s.id,opponentName:s.name,opponentClass:s.classif,opponentStrength:strength,opponentOffense:opp.offense,opponentDefense:opp.defense,opponentRunDefense:opp.runDefense,opponentPassDefense:opp.passDefense,home:wk%2===1,district:false});
  }else{
   const pairs=robin[wk-4],own=pairs.find(m=>m.aId==='school'||m.bId==='school'),id=own.aId==='school'?own.bId:own.aId,opp=teams.find(t=>t.id===id);
   rivalMatches[wk]=pairs;
   fixtures.push({week:wk,opponentId:opp.id,opponentName:opp.name,opponentClass:opp.classif,opponentStrength:opp.strength,opponentOffense:opp.offense,opponentDefense:opp.defense,opponentRunDefense:opp.runDefense,opponentPassDefense:opp.passDefense,home:wk%2===1,district:true,opponentLeagueId:id});
  }
 }
 const c={year:game.year,regularWeeks,teams,fixtures,rivalMatches,playedWeeks:[],headToHead:[],postseason:null};
 game.competition=c;
 // Preserve old v0.5 Part 3 games and current season when migrating mid-year.
 const prior=(game.games||[]).filter(g=>g.year===game.year&&g.phase===0&&!g.playoff&&g.week<=regularWeeks).sort((a,b)=>a.week-b.week);
 for(const g of prior){
  const fixture=fixtures[g.week-1],v=fixture?.district;
  if(!fixture||c.playedWeeks.includes(g.week))continue;
  const varsityOutcome=g.level==='Varsity'?g:(game.squadResults||[]).find(x=>x.year===g.year&&x.week===g.week&&x.level==='Varsity');
  const home=varsityOutcome||{score:R(8,35),opp:R(8,35)};
  recordCompetitionWeek(c,fixture,home.score,home.opp,true);
 }
 return c;
}
function createSchedule(){return competitionState().fixtures.map(x=>({...x}));}
function matchTeam(c,id){return c.teams.find(t=>t.id===id)}
function recordCompetitionWeek(c,fixture,schoolScore,opponentScore,replay=false){
 const wk=fixture.week;if(c.playedWeeks.includes(wk))return;
 c.playedWeeks.push(wk);
 const district=Boolean(fixture.district),school=matchTeam(c,'school');
 const mark=(team,points,against,inDistrict)=>{
  team.record[points>against?0:1]++;
  if(inDistrict)team.districtRecord[points>against?0:1]++;
  team.pointsFor+=points;team.pointsAgainst+=against;
 };
 // A tie is not a valid final high-school football result; past saves may include them.
 if(schoolScore===opponentScore)opponentScore+=3;
 mark(school,schoolScore,opponentScore,district);
 if(district){const rival=matchTeam(c,fixture.opponentLeagueId);if(rival){mark(rival,opponentScore,schoolScore,true);c.headToHead.push({aId:'school',bId:rival.id,scoreA:schoolScore,scoreB:opponentScore})}}
 if(!district){
  for(const t of c.teams.slice(1)){
   const s=simulateNeutralScore(t,{strength:cl(50+R(-12,12),25,89),offense:50,defense:50});
   mark(t,s[0],s[1],false);
  }
 }else{
  for(const m of c.rivalMatches[wk]||[]){
   if(m.aId==='school'||m.bId==='school')continue;
   const a=matchTeam(c,m.aId),b=matchTeam(c,m.bId),scores=simulateNeutralScore(a,b);
   mark(a,scores[0],scores[1],true);mark(b,scores[1],scores[0],true);
   c.headToHead.push({...m,scoreA:scores[0],scoreB:scores[1]});
  }
 }
}
function simulateNeutralScore(a,b){
 const af=cl((a.offense??a.strength)-(b.defense??b.strength),-60,60);
 const bf=cl((b.offense??b.strength)-(a.defense??a.strength),-60,60);
 const scoreA=cl(Math.round(23+af*.35+R(-12,12)),3,60),scoreB=cl(Math.round(23+bf*.35+R(-12,12)),3,60);
 if(scoreA===scoreB)return Math.random()<.5?[scoreA+3,scoreB]:[scoreA,scoreB+3];
 return [scoreA,scoreB];
}
function districtTable(){
 const c=competitionState(),rows=c.teams.slice();
 rows.sort((a,b)=>{
  const wins=b.districtRecord[0]-a.districtRecord[0];if(wins)return wins;
  const losses=a.districtRecord[1]-b.districtRecord[1];if(losses)return losses;
  const meetings=c.headToHead.filter(m=>(m.aId===a.id&&m.bId===b.id)||(m.aId===b.id&&m.bId===a.id));
  if(meetings.length===1){const m=meetings[0],aWin=m.aId===a.id?m.scoreA>m.scoreB:m.scoreB>m.scoreA;if(aWin)return -1;return 1}
  return (b.pointsFor-b.pointsAgainst)-(a.pointsFor-a.pointsAgainst)||b.strength-a.strength||a.id.localeCompare(b.id);
 });
 return rows;
}
function playoffTeamFrom(club,idx){return {...club,id:club.id,name:club.name,bracketId:idx,record:club.record?.slice()||[0,0],districtRecord:club.districtRecord?.slice()||[0,0]}}
function buildBracket(c){
 const sorted=districtTable(),districts=[sorted.slice(0,4).map(t=>playoffTeamFrom(t,t.id))];
 for(let d=1;d<16;d++){
  const rankTeams=Array.from({length:4},(_,i)=>{
   const id='state-'+d+'-'+i;
   return generatedTeam(id,RIVAL_PLACES[(d+i*4)%RIVAL_PLACES.length]+' '+RIVAL_MASCOTS[(d*2+i)%RIVAL_MASCOTS.length]+' '+(d+1),game.school.classif,cl(54+R(-24,30)+(3-i)*2,23,96));
  });
  districts.push(rankTeams);
 }
 const entrants=districts.flat(),matches=[];
 for(let d=0;d<16;d+=2){let a=districts[d],b=districts[d+1];for(let i=0;i<4;i++)matches.push({aId:a[i].id,bId:b[3-i].id,scoreA:null,scoreB:null,winnerId:null})}
 return {roundIndex:0,rounds:[{name:PLAYOFF_ROUNDS[0],matches}],teams:entrants,status:'pending',qualified:sorted.slice(0,4).some(x=>x.id==='school'),districtPlace:sorted.findIndex(x=>x.id==='school')+1,championId:null};
}
function findBracketTeam(post,id){return post.teams.find(t=>t.id===id)}
function currentPlayoffMatchup(){
 const p=game.competition?.postseason;if(!p||p.status!=='active')return null;
 const round=p.rounds[p.roundIndex],m=round?.matches.find(x=>x.aId==='school'||x.bId==='school');if(!m)return null;
 const id=m.aId==='school'?m.bId:m.aId,opp=findBracketTeam(p,id);
 return {week:game.week,playoff:true,round:round.name,opponentId:id,opponentName:opp.name,opponentClass:opp.classif,opponentStrength:opp.strength,opponentOffense:opp.offense,opponentDefense:opp.defense,opponentRunDefense:opp.runDefense,opponentPassDefense:opp.passDefense,home:m.aId==='school',district:false};
}
function currentMatchup(){
 if(!game||game.phase!==0)return null;
 const c=competitionState();return game.week>c.regularWeeks?currentPlayoffMatchup():c.fixtures[game.week-1]||null;
}
function fillRoundAndAdvance(p,schoolResult=null){
 const rd=p.rounds[p.roundIndex];
 for(const m of rd.matches){
  if(m.winnerId)continue;
  const a=findBracketTeam(p,m.aId),b=findBracketTeam(p,m.bId);
  let score=schoolResult&&(m.aId==='school'||m.bId==='school')?(m.aId==='school'?[schoolResult.score,schoolResult.opp]:[schoolResult.opp,schoolResult.score]):simulateNeutralScore(a,b);
  m.scoreA=score[0];m.scoreB=score[1];m.winnerId=score[0]>score[1]?m.aId:m.bId;
 }
 const winners=rd.matches.map(x=>x.winnerId);
 if(winners.length===1){p.championId=winners[0];p.status=p.status==='spectator'?'spectator':p.championId==='school'?'champion':(p.qualified?'eliminated':'missed');return}
 const next=p.roundIndex+1;
 p.rounds.push({name:PLAYOFF_ROUNDS[next],matches:Array.from({length:winners.length/2},(_,i)=>({aId:winners[i*2],bId:winners[i*2+1],scoreA:null,scoreB:null,winnerId:null}))});
 p.roundIndex=next;
}
function finishBracket(p){while(!p.championId)fillRoundAndAdvance(p)}
function onRegularSeasonGame(result,varsityResult){
 const c=competitionState(),fixture=c.fixtures[result.week-1];
 recordCompetitionWeek(c,fixture,varsityResult.score,varsityResult.opp);
 if(result.week<c.regularWeeks)return;
 const p=buildBracket(c);c.postseason=p;
 const teamRank=p.districtPlace;
 if(!p.qualified){p.status='missed';finishBracket(p);game.endFallAfterThisWeek=true;note('Regular season ended. '+game.school.name+' finished '+ordinal(teamRank)+' in district and missed the varsity playoffs.');return}
 if(result.level!=='Varsity'){
  p.status='spectator';finishBracket(p);game.endFallAfterThisWeek=true;
  note('The varsity team qualified '+ordinal(teamRank)+' in district, but you competed on '+result.level+'. The varsity postseason was simulated separately.');return;
 }
 p.status='active';note('PLAYOFFS! '+game.school.name+' qualified '+ordinal(teamRank)+' in district. Bi-District begins next week.');
}
function ordinal(x){return x+(x%10===1&&x%100!==11?'st':x%10===2&&x%100!==12?'nd':x%10===3&&x%100!==13?'rd':'th')}
function onPlayoffGame(result){
 const c=competitionState(),p=c.postseason;if(!p||p.status!=='active')return;
 const thisRound=p.roundIndex;fillRoundAndAdvance(p,result);
 const played=p.rounds[thisRound].matches.find(m=>m.aId==='school'||m.bId==='school');
 if(played?.winnerId==='school'){
  if(p.championId==='school'){game.endFallAfterThisWeek=true;note('STATE CHAMPIONS! '+game.school.name+' won the '+game.school.classif+'A fictional state bracket.');}
  else note('Playoff victory in '+PLAYOFF_ROUNDS[thisRound]+'! Next: '+PLAYOFF_ROUNDS[thisRound+1]+'.');
 }else{
  p.status='eliminated';finishBracket(p);game.endFallAfterThisWeek=true;
  note('Playoff elimination in '+PLAYOFF_ROUNDS[thisRound]+'. Final bracket champion: '+findBracketTeam(p,p.championId)?.name+'.');
 }
}
function competitionGameFinished(result,varsityResult){
 if(result.playoff)onPlayoffGame(result);else onRegularSeasonGame(result,varsityResult);
}
function seasonStatusText(){
 const c=competitionState(),p=c.postseason;
 if(p){
  const champion=p.championId?findBracketTeam(p,p.championId)?.name:'';
  return {status:p.status,description:p.status==='active'?'Qualified — '+PLAYOFF_ROUNDS[p.roundIndex]+' next':p.status==='champion'?'State champion':p.status==='missed'?'Missed playoffs · '+ordinal(p.districtPlace)+' district':p.status==='spectator'?'Varsity qualified · not on varsity': 'Eliminated in playoffs',champion};
 }
 const left=c.regularWeeks-c.playedWeeks.length;
 return {status:'race',description:left+' regular-season game'+(left===1?'':'s')+' remaining · top 4 in district qualify',champion:''};
}
