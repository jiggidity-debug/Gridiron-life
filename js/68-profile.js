/* Gridiron Life v0.5 Part 7.2: player biography, player-card and archive.
   Pure local rules, only observed in-game data; no external AI or fabricated stars. */
function profileState(){
  if(!game)return null;
  if(!game.playerProfile||typeof game.playerProfile!=='object')game.playerProfile={milestones:[],snapshots:[],keys:[],schoolHistory:[]};
  const p=game.playerProfile;
  p.milestones=Array.isArray(p.milestones)?p.milestones:[];
  p.snapshots=Array.isArray(p.snapshots)?p.snapshots:[];
  p.keys=Array.isArray(p.keys)?p.keys:[];
  p.schoolHistory=Array.isArray(p.schoolHistory)?p.schoolHistory:[];
  if(!p.schoolHistory.length)p.schoolHistory.push({year:game.year,grade:game.grade,name:game.school.name,classif:game.school.classif});
  else if(p.schoolHistory[p.schoolHistory.length-1].name!==game.school.name)
    p.schoolHistory.push({year:game.year,grade:game.grade,name:game.school.name,classif:game.school.classif});
  return p;
}
function profileGames(){return (game.games||[]).filter(g=>g&&g.stats&&g.year>=1);}
function profileStats(games){
  const sums={games:games.length,starts:0,varsityStarts:0,passAtt:0,passComp:0,passYards:0,passTD:0,interceptions:0,carries:0,rushYards:0,rushTD:0,receptions:0,recYards:0,recTD:0,wins:0,losses:0,playoffGames:0,tackles:0,tfl:0,sacks:0,passDef:0,defInt:0,defSnaps:0,offSnaps:0,blocks:0,pressures:0,fgAtt:0,fgMade:0,xpAtt:0,xpMade:0,punts:0,puntYards:0,longSnaps:0};
  for(const g of games){
    if(g.role==='Starter'){sums.starts++;if(g.level==='Varsity')sums.varsityStarts++;}
    if(g.win)sums.wins++;else sums.losses++;
    if(g.playoff)sums.playoffGames++;
    for(const k of ['passAtt','passComp','passYards','passTD','interceptions','carries','rushYards','rushTD','receptions','recYards','recTD','tackles','tfl','sacks','passDef','defInt','defSnaps','offSnaps','blocks','pressures','fgAtt','fgMade','xpAtt','xpMade','punts','puntYards','longSnaps'])sums[k]+=Number(g.stats[k]||0);
  }
  return sums;
}
function profileStatLine(s,pos){
  if(DEFENSIVE_POSITIONS.includes(pos))return s.tackles+' tackles · '+s.tfl+' TFL · '+s.sacks+' sacks · '+s.defInt+' INT';
  if(LINEMEN.includes(pos))return s.offSnaps+' offensive snaps · '+s.blocks+' blocks · '+s.pressures+' pressures allowed';
  if(pos==='K')return s.fgMade+'/'+s.fgAtt+' FG · '+s.xpMade+'/'+s.xpAtt+' PAT';
  if(pos==='P')return s.punts+' punts · '+s.puntYards+' punting yards';
  if(pos==='LS')return s.longSnaps+' long snaps';
  if(pos==='QB')return s.passComp+'/'+s.passAtt+' passing · '+s.passYards+' yards · '+s.passTD+' TD · '+s.interceptions+' INT';
  if(['RB','FB'].includes(pos))return s.carries+' carries · '+s.rushYards+' rushing yards · '+s.rushTD+' rush TD · '+s.receptions+' receptions · '+s.recYards+' receiving yards · '+s.recTD+' receiving TD';
  return s.receptions+' receptions · '+s.recYards+' yards · '+s.recTD+' receiving TD · '+s.carries+' rushes';
}
function profileTraits(){
  const keys=[...new Set(GROUPS[game.pos].flatMap(g=>g[2]))];
  const ordered=keys.map(k=>({key:k,value:Number(game.attrs[k]||0)})).sort((a,b)=>b.value-a.value||a.key.localeCompare(b.key));
  const pretty=s=>s.replace(/\b\w/g,c=>c.toUpperCase());
  return {best:ordered.slice(0,3).map(x=>({...x,label:pretty(x.key)})),develop:ordered.slice(-2).reverse().map(x=>({...x,label:pretty(x.key)}))};
}
function profileBio(){
  const p=profileState(),all=profileStats(profileGames()),thisYear=profileStats(profileGames().filter(g=>g.year===game.year)),d=depth(),r=rating(game.attrs,game.pos),traits=profileTraits();
  const schoolHistory=p.schoolHistory,school=game.school.name;
  const startYear=schoolHistory[0]?.year||game.year;
  const first=schoolHistory[0]?.name||school;
  const registered=p.keys.includes('registration');
  const lead=registered?game.name+' entered '+first+' as a freshman '+game.pos+'.':game.name+' is a grade '+game.grade+' '+game.pos+' at '+school+'.';
  const history=schoolHistory.length>1?' The school record shows '+schoolHistory.length+' programs, most recently '+school+'.':'';
  const physical=' Listed at '+Math.floor(game.height/12)+' ft '+game.height%12+' in and '+game.weight+' lb'+(game.hometown?' from '+game.hometown:'')+', '+game.name+' is a '+(r>=65?'rare high-school talent':r>=55?'strong high-school prospect':r>=45?'developing high-school player':'raw prospect still building foundational skills')+'.';
  const traitLine=' '+traits.best.slice(0,2).map(x=>{const v=x.value;const quality=v>=95?'elite':v>=90?'exceptional':v>=80?'outstanding':v>=70?'very strong':v>=60?'solid at the high school level':v>=50?'developing':v>=40?'limited':'a significant weakness';return x.label.toLowerCase()+' is '+quality+' at the '+(game.stage==='college'?'college':'high-school')+' level';}).join('; ')+'.';
  let experience=' No football game statistics have been recorded yet, so an on-field résumé is still developing.';
  if(all.games){
    const role=d.role==='Starter'?'is currently listed as a '+d.level+' starter':d.role==='Rotation'?'is currently in the '+d.level+' rotation':'is currently listed as a '+d.level+' '+d.role.toLowerCase();
    experience=' Across '+all.games+' recorded games, '+game.name+' has '+all.starts+' starts ('+all.varsityStarts+' varsity) and '+all.wins+' wins. The current depth chart '+role+'.';
    if(game.pos==='QB')experience+=' Career passing production is '+all.passComp+' completions on '+all.passAtt+' attempts for '+all.passYards+' yards, '+all.passTD+' touchdowns and '+all.interceptions+' interceptions.';
    else if(['RB','FB'].includes(game.pos)){experience+=' The back has '+all.rushYards+' rushing yards on '+all.carries+' carries and '+all.receptions+' receptions for '+all.recYards+' yards.';if(all.recYards>all.rushYards*1.4&&all.receptions>=12)experience+=' Receiving production has become the defining feature of this backfield role.';}
    else if(DEFENSIVE_POSITIONS.includes(game.pos))experience+=' Career defense: '+all.tackles+' tackles, '+all.tfl+' tackles for loss, '+all.sacks+' sacks, and '+all.defInt+' interceptions.';
    else if(LINEMEN.includes(game.pos))experience+=' Career line work: '+all.offSnaps+' offensive snaps, '+all.blocks+' successful blocks, and '+all.pressures+' pressures allowed.';
    else if(SPECIAL_POSITIONS.includes(game.pos))experience+=' Career special teams production: '+profileStatLine(all,game.pos)+'.';
    else experience+=' Career receiving production is '+all.receptions+' catches for '+all.recYards+' yards and '+all.recTD+' touchdowns.';
  }
  const honors=game.awards?.earned||[];
  const latestHonor=honors[honors.length-1];
  const awardLine=honors.length?' Recorded honors total '+honors.length+', most recently '+latestHonor.title+'.':'';
  const injuryCount=game.health?.injuryHistory?.length||0;
  const injuryLine=injuryCount?' The medical record lists '+injuryCount+' injuries during the tracked career.':'';
  const summer=game.summer||{},camps=summer.camps||[],titles=(summer.circuits||[]).filter(c=>c.title).length;
  const offseason=(camps.length?' Offseason records include '+camps.length+' camp or combine evaluations.':'')+(titles?' The player has won '+titles+' regional seven-on-seven title'+(titles===1?'':'s')+'.':'')+(Number(summer.exposure)>=45?' His camp appearances and game film have begun attracting broader scouting attention.':Number(summer.exposure)>0?' His scouting visibility remains limited, though evaluators have begun gathering information.':'');
  const trust=Number(game.coachTrust||0);const trustLine=trust>=80?' The coaching staff has strong confidence in his preparation and reliability.':trust>=60?' The coaching staff has growing confidence in his development.':trust>=40?' He continues to compete for the coaching staff’s confidence.':' His role remains unsettled as he works to earn the coaching staff’s confidence.';
  const context=' He maintains a '+Number(game.gpa||0).toFixed(2)+' GPA.'+trustLine+offseason;
  const scout=all.games<3?'Scouts have limited game film. Current evaluations should be considered preliminary.':
    (thisYear.games?game.name+' has appeared in '+thisYear.games+' games this season. ':'')+
    'Top measured traits: '+traits.best.map(x=>x.label+' '+x.value).join(', ')+'. Areas for development: '+traits.develop.map(x=>x.label+' '+x.value).join(', ')+'.';
  return {lead:lead+history+physical+traitLine,body:experience+awardLine+injuryLine+context,scout,career:all,season:thisYear,depth:d,traits,overall:r};
}
function profileMilestone(id,title,description,{snapshot=false}={}){
  const p=profileState();if(!p||p.keys.includes(id))return false;
  p.keys.push(id);
  p.milestones.push({id,title,description,year:game.year,week:game.week,phase:PHASES[game.phase]?.name||'School year',grade:game.grade,school:game.school.name});
  if(snapshot)profileSnapshot(id,title);
  return true;
}
function profileSnapshot(id,title){
  const p=profileState();if(!p||p.snapshots.some(x=>x.id===id))return false;
  const b=profileBio();
  p.snapshots.push({id,title,year:game.year,grade:game.grade,week:game.week,phase:PHASES[game.phase]?.name||'School year',school:game.school.name,
    overall:b.overall,role:b.depth.role,level:b.depth.level,stats:{...b.career},traitScores:b.traits.best.map(x=>({key:x.key,value:x.value})),bio:b.lead+' '+b.body});
  p.snapshots=p.snapshots.slice(-100);return true;
}
function profileGameFinished(result){
  profileState();
  const g=result;
  if(g.role==='Starter'){
    profileMilestone('first-start','First starting assignment','Made the first recorded start for '+g.level+' against '+g.opponentName+'.',{snapshot:true});
    if(g.level==='Varsity')profileMilestone('first-varsity-start','First varsity start','Started the varsity game against '+g.opponentName+'.',{snapshot:true});
  }
  if(g.playoff)profileMilestone('first-playoff','First varsity playoff listing','Was listed for the varsity postseason game against '+g.opponentName+'.',{snapshot:true});
  const s=g.stats||{},td=(s.passTD||0)+(s.rushTD||0)+(s.recTD||0);
  if(td>0)profileMilestone('first-td','First recorded touchdown','Recorded a touchdown in the game against '+g.opponentName+'.',{snapshot:true});
  if(game.pos==='QB'&&s.passYards>=300)profileMilestone('300-pass','First 300-yard passing game','Passed for '+s.passYards+' yards against '+g.opponentName+'.',{snapshot:true});
  if(game.pos==='RB'&&s.rushYards>=150)profileMilestone('150-rush','First 150-yard rushing game','Rushed for '+s.rushYards+' yards against '+g.opponentName+'.',{snapshot:true});
  if(['WR','TE'].includes(game.pos)&&s.recYards>=120)profileMilestone('120-rec','First 120-yard receiving game','Caught '+s.recYards+' yards against '+g.opponentName+'.',{snapshot:true});
}
function profileSeasonFinished(){
  profileMilestone('season-'+game.year,'Finished Year '+game.year+' football season','Completed '+profileStats(profileGames().filter(x=>x.year===game.year)).games+' recorded games during grade '+game.grade+'.',{snapshot:true});
}
function profileScreen(){
  const p=profileState(),b=profileBio(),s=b.career,traits=b.traits,d=b.depth,injuries=game.health?.injuryHistory||[];
  const initial=game.name.trim().split(/\s+/).map(x=>x[0]||'').slice(0,2).join('').toUpperCase();
  const playerCard='<div class="player-card"><div class="player-card-top"><div class="player-monogram">'+e(initial)+'</div><div><small>STUDENT ATHLETE PROFILE</small><h2>'+e(game.name)+'</h2><div class="profile-subline">#'+e(game.jersey??'—')+' · '+e(game.pos)+' · '+e(game.school.name)+'</div><div class="profile-subline">'+game.grade+'th grade · '+e(d.level)+' · '+e(d.role)+'</div></div><div class="player-ovr"><strong>'+b.overall+'</strong><small>OVR</small></div></div>'+
  '<div class="profile-metrics">'+[['Height',Math.floor(game.height/12)+"' "+(game.height%12)+'"'],['Weight',game.weight+' lb'],['Hand',game.hand||'Not listed'],['Hometown',game.hometown||'Not listed'],['Jersey preference','#'+(game.jersey??'—')],['GPA',(game.gpa||0).toFixed(2)]].map(([k,v])=>'<div><small>'+e(k)+'</small><strong>'+e(v)+'</strong></div>').join('')+'</div></div>';
  const snapshotRows=p.snapshots.slice().reverse().map(x=>'<details class="profile-archive"><summary>Year '+x.year+' · Grade '+x.grade+' · '+e(x.title)+' · '+x.overall+' OVR</summary><p><small>'+e(x.school)+' · '+e(x.phase)+' · Week '+x.week+' · '+e(x.level)+' '+e(x.role)+'</small></p><p>'+e(x.bio)+'</p><small>Career stats at this checkpoint: '+e(profileStatLine(x.stats,game.pos))+'</small></details>').join('');
  const milestoneRows=p.milestones.slice().reverse().map(x=>'<div class="log"><strong>'+e(x.title)+'</strong><br><small>Year '+x.year+' · '+e(x.school)+' · '+e(x.phase)+' W'+x.week+'</small><p>'+e(x.description)+'</p></div>').join('');
  const traitsHtml='<div class="grid">'+traits.best.map(x=>'<div class="tile"><small>'+e(x.label)+'</small><div class="num">'+x.value+'</div></div>').join('')+'</div>';
  return playerCard+panel('Living player biography','<p>'+e(b.lead)+'</p><p>'+e(b.body)+'</p>')+
    panel('Current scouting report','<p>'+e(b.scout)+'</p>'+traitsHtml+'<p class="muted">OVR and attribute evaluations are current; performance totals below come from recorded games.</p>')+
    panel('Career football statistics','<div class="grid">'+[['Recorded games',s.games],['Starts',s.starts],['Varsity starts',s.varsityStarts],['Wins',s.wins],['Playoff games',s.playoffGames],['Awards',game.awards?.earned?.length||0]].map(([a,v])=>'<div class="tile"><small>'+a+'</small><div class="num">'+v+'</div></div>').join('')+'</div><p><strong>'+e(game.pos)+' career:</strong> '+e(profileStatLine(s,game.pos))+'</p><p><strong>Current school year:</strong> '+e(profileStatLine(b.season,game.pos))+'</p>'+statGrid(game.games||[],true))+
    panel('Career milestones',milestoneRows||'<p>Milestones will appear as your career develops.</p>')+
    panel('Biography archive','<p class="muted">Snapshots preserve the biography as it appeared at registration and major career checkpoints. Existing saves cannot recover events that were never recorded.</p>'+(snapshotRows||'<p>The next major career event will create your first snapshot.</p>'))+
    panel('Background & school record','<p><strong>Upbringing:</strong> '+e(BG.find(x=>x[0]===game.bg)?.[1]||'Not listed')+'</p><p><strong>Program history:</strong> '+p.schoolHistory.map(x=>e(x.name)+' (Year '+x.year+')').join(' → ')+'</p>'+(injuries.length?'<p><strong>Recorded injuries:</strong> '+injuries.map(x=>e(x.name)+' · Year '+x.year).join(' · ')+'</p>':''));
}
