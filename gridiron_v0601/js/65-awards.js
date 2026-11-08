/* Gridiron Life v0.5 Part 5 — earned awards; honest about simulated competition. */
function awardsState(){
  if(!game)return null;
  if(!game.awards||!Array.isArray(game.awards.earned))game.awards={earned:[],gameKeys:[],finalYears:[]};
  game.awards.gameKeys=game.awards.gameKeys||[];
  game.awards.finalYears=game.awards.finalYears||[];
  return game.awards;
}
function gameStatsDescription(g,pos){
  const s=g.stats||{},isQB=pos==='QB'||(s.passAtt||0)>0||((s.passYards||0)>0);
  if(DEFENSIVE_POSITIONS.includes(pos))return `${s.tackles||0} tackles, ${s.tfl||0} TFL, ${s.sacks||0} sacks, ${s.passDef||0} passes defended, ${s.defInt||0} interceptions; ${s.defSnaps||0} defensive snaps.`;
  if(LINEMEN.includes(pos))return `${s.offSnaps||0} offensive snaps, ${s.blocks||0} successful blocks, ${s.pressures||0} pressures allowed.`;
  if(pos==='K')return `${s.fgMade||0}/${s.fgAtt||0} field goals, ${s.xpMade||0}/${s.xpAtt||0} PAT.`;
  if(pos==='P')return `${s.punts||0} punts, ${s.puntYards||0} punt yards.`;
  if(pos==='LS')return `${s.longSnaps||0} long snaps.`;
  if(isQB){
    const att=s.passAtt||0,comp=s.passComp||0,yds=s.passYards||0;
    return `${comp}/${att} passing, ${yds} pass yards, ${s.passTD||0} pass TD, ${s.interceptions||0} INT; ${s.carries||0} rushes, ${s.rushYards||0} rush yards, ${s.rushTD||0} rush TD.`+(g.secondaryPosition?` Two-way ${g.secondaryPosition}: ${s.tackles||0} tackles, ${s.sacks||0} sacks.`:'');
  }
  return `${s.carries||0} carries, ${s.rushYards||0} rush yards, ${s.rushTD||0} rush TD; ${s.receptions||0} catches, ${s.recYards||0} rec yards, ${s.recTD||0} rec TD.`+(g.secondaryPosition?` Two-way ${g.secondaryPosition}: ${s.tackles||0} tackles, ${s.sacks||0} sacks, ${s.defInt||0} INT.`:'');
}
function gameImpact(g){
  const s=g.stats||{};
  const qb=game.pos==='QB';
  // Numbers are derived from football production, not player overall.
  // A position-neutral normalized yardage and scoring value for this prototype.
  if(DEFENSIVE_POSITIONS.includes(game.pos))return Math.round((s.tackles||0)*13+(s.tfl||0)*24+(s.sacks||0)*42+(s.passDef||0)*20+(s.defInt||0)*65+(g.win?12:0));
  if(LINEMEN.includes(game.pos))return Math.round((s.blocks||0)*5-(s.pressures||0)*10+(g.win?12:0));
  if(SPECIAL_POSITIONS.includes(game.pos))return Math.round((s.fgMade||0)*40+(s.xpMade||0)*8+(s.puntYards||0)*.9+(s.longSnaps||0)*4);
  const y=qb?(s.passYards||0)*.80+(s.rushYards||0):(s.rushYards||0)+(s.recYards||0)*1.10;
  const td=qb?(s.passTD||0)+(s.rushTD||0):(s.rushTD||0)+(s.recTD||0);
  const turnover=qb?(s.interceptions||0)*20:0;
  const strength=(g.opponentStrength??50)-50;
  return Math.round(y+td*65-turnover+strength*.55+(g.win?12:0));
}
function seasonImpact(results){
  if(!results.length)return 0;
  return Math.round(results.reduce((a,g)=>a+gameImpact(g),0)/results.length);
}
function earnHonor(id,title,kind,when,reason,g=null){
  const a=awardsState(),key=id+'|'+when;
  if(a.earned.some(x=>x.key===key))return false;
  const award={key,id,title,kind,year:game.year,week:game.week,grade:game.grade,level:g?.level||null,when,reason};
  a.earned.push(award);
  profileMilestone('honor-'+key,'Earned '+title,reason,{snapshot:true});
  if(g){g.honors=g.honors||[];g.honors.push({id,title});}
  note('Award earned: '+title+'. '+reason);
  return true;
}
function registerGameAwards(g){
  const a=awardsState(),key=g.year+'|'+g.week+'|'+(g.playoff?g.round:'regular')+'|'+g.level;
  if(a.gameKeys.includes(key))return;
  a.gameKeys.push(key);
  if(g.role==='Out (Injury)'||g.role==='Backup'&&gameImpact(g)<150)return;
  const impact=gameImpact(g),level=g.level;
  // Per-game school recognition is based on production, not a claim of being best among untracked players.
  if(impact>=170 && (g.stats.passAtt>=12||g.stats.carries+g.stats.receptions>=8))
    earnHonor('weekly-impact','Offensive Standout · '+level,'weekly',key,'Production score '+impact+' against '+g.opponentName+'.',g);
  // District award uses a simulated strength-adjusted performance benchmark.
  if(level==='Varsity'&&!g.playoff&&impact>=275 && g.opponentStrength>=45)
    earnHonor('district-week','District Performance of the Week','weekly',key,'Outstanding performance relative to the district benchmark.',g);
  if(level==='Varsity'&&g.playoff&&impact>=225)
    earnHonor('playoff-standout','Playoff Standout','weekly',key,'Strong production in the '+g.round+' round.',g);
}
function finalizeSeasonAwards(){
  const a=awardsState(),year=game.year;
  if(a.finalYears.includes(year))return;
  a.finalYears.push(year);
  const games=(game.games||[]).filter(g=>g.year===year&&g.phase===0&&!g.playoff);
  const varsity=games.filter(g=>g.level==='Varsity'),counts={};
  for(const g of games)counts[g.level]=(counts[g.level]||0)+1;
  const played=games.filter(g=>g.role==='Starter'||g.role==='Rotation');
  if(played.length>=6){
    const avg=seasonImpact(played),lev=played[0].level;
    if(avg>=135)earnHonor('season-impact','Season Offensive Standout · '+lev,'season','season|'+year,'Averaged a '+avg+' production score across '+played.length+' appearances.');
  }
  if(varsity.length>=7){
    const avg=seasonImpact(varsity),school=game.school;
    // Honors are modeled using explicit benchmark tiers; full opponent-player statistics do not yet exist.
    if(avg>=225)earnHonor('all-district-1','All-District · First Team (simulated)','season','season|'+year,'Exceeded the first-team district benchmark (average '+avg+').');
    else if(avg>=165)earnHonor('all-district-2','All-District · Second Team (simulated)','season','season|'+year,'Met the district production benchmark (average '+avg+').');
    if(avg>=285 && varsity.filter(g=>(g.opponentStrength??50)>=60).length>=3)
      earnHonor('all-state','All-State Recognition (simulated)','season','season|'+year,'Outstanding performance against a range of stronger opponents.');
  }
  const reports=academicState().termReports||[];
  const fall=reports.filter(r=>r.semester==='Fall');
  const last=fall[fall.length-1];
  if(last&&last.gpa>=3.5&&games.length>=6)
    earnHonor('academic','Academic Football Recognition','academic','season|'+year,'Fall term GPA '+last.gpa.toFixed(2)+'.');
}
function awardSummary(){
  const a=awardsState();return {weekly:a.earned.filter(x=>x.kind==='weekly').length,season:a.earned.filter(x=>x.kind==='season').length,academic:a.earned.filter(x=>x.kind==='academic').length};
}
function careerAwardSpotlight(){
  const a=awardsState(),last=a.earned.slice(-3).reverse();
  return panel('Awards & recognition',
    '<p class="muted">Awards come from games, semester grades, and simulated performance benchmarks. OVR alone never grants an award.</p>'+
    (last.length?last.map(x=>'<div class="line"><span>'+e(x.title)+' <small>· Year '+x.year+'</small></span><strong>'+e(x.kind)+'</strong></div>').join(''):'')+
    (!last.length?'<p>No awards yet. Outstanding performances and season results can earn recognition.</p>':''));
}
function awardsHistoryPanel(){
  const a=awardsState(),awards=a.earned.slice().reverse(),s=awardSummary();
  const rows=awards.map(x=>'<div class="log"><strong>'+e(x.title)+'</strong><br><small>Year '+x.year+' · '+e(x.kind)+' · '+(x.level?e(x.level)+' · ':'')+e(x.reason)+'</small></div>').join('');
  return panel('Awards & accolades',
    '<div class="grid"><div class="tile"><small>Weekly honors</small><div class="num">'+s.weekly+'</div></div><div class="tile"><small>Season and academic</small><div class="num">'+(s.season+s.academic)+'</div></div></div>'+
    '<p class="muted">Season and district honors are based on recorded production and simulated benchmarks, not a complete league-wide player-stat database. Awards earned in this version persist across saves and seasons; legacy games are not retroactively assigned speculative awards.</p>'+
    (rows||'<p>No awards earned yet.</p>'));
}
