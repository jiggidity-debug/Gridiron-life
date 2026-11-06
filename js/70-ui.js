/* Gridiron Life v0.5 Part 5 — clarity patch for health, stress, and equipment. */

function panel(t,content){return '<section class="panel"><h2>'+t+'</h2>'+content+'</section>'}

function stat(label,val){return '<div class="tile"><div class="num">'+e(val)+'</div><small>'+label+'</small></div>'}

function rang(label,v,min,max,func,detail=''){return '<div class="line"><span>'+label+'</span><strong>'+v+(detail||'')+'</strong></div><input aria-label="'+e(label)+'" type="range" min="'+min+'" max="'+max+'" value="'+v+'" oninput="'+func+'">'}

function selectedSchoolStats(){
  const si=Number(document.getElementById('school')?.value??draft.school);
  const s=schools[si]||schools[0];
  const run=Math.round(s.runRate*100);
  const levels=levelsForSchool(s).join(' · ');
  const attribute=(label,n)=>'<div class="school-metric"><div class="line"><span>'+e(label)+'</span><strong>'+Math.round(n)+'/100</strong></div><div class="meter"><i style="width:'+cl(n,0,100)+'%"></i></div></div>';
  return '<p><strong>'+e(s.name)+'</strong> · '+s.classif+'A · '+e(s.scheme)+' offense</p>'+
    '<p class="muted">Coach: '+e(s.coach)+' · Defensive scheme: '+e(s.defense)+' · Squads: '+e(levels)+'</p>'+
    '<div class="grid school-metrics">'+[
      attribute('Program strength / prestige',s.prestige),
      attribute('Coaching quality',s.coaching),
      attribute('Facilities',s.facilities),
      attribute('Program expectations',s.expectations)
    ].join('')+'</div>'+
    '<p><strong>Offensive tendency:</strong> '+run+'% run · '+(100-run)+'% pass. These are the school\'s simulated tendencies, not your guaranteed playing time.</p>'+
    '<details><summary>Compare all schools</summary><div class="table-scroll"><table><thead><tr><th>School</th><th>Class</th><th>Scheme</th><th>Prestige</th><th>Coach</th><th>Facilities</th></tr></thead><tbody>'+
      schools.map((x,i)=>'<tr'+(i===si?' class="selected-school"':'')+'><td>'+e(x.name)+'</td><td>'+x.classif+'A</td><td>'+e(x.scheme)+'</td><td>'+x.prestige+'</td><td>'+x.coaching+'</td><td>'+x.facilities+'</td></tr>').join('')+
    '</tbody></table></div></details>';
}
function showSchoolStats(){
  const el=document.getElementById('school-profile');
  if(el)el.innerHTML=selectedSchoolStats();
  const chosen=Number(document.getElementById('school')?.value);
  if(Number.isInteger(chosen)&&schools[chosen])draft.school=chosen;
}
function schoolClassSelection(){
 const selector=document.getElementById('school-class');if(!selector)return;
 const level=selector.value;
 const available=schools.map((x,i)=>({x,i})).filter(({x})=>!x.prep&&String(x.classif)===level);
 const current=Number(document.getElementById('school')?.value??draft.school);
 const target=available.some(a=>a.i===current)?current:available[0]?.i;
 const el=document.getElementById('school');if(!el)return;
 el.innerHTML=available.map(({x,i})=>'<option value="'+i+'"'+(i===target?' selected':'')+'>'+e(x.name)+' · '+e(x.scheme)+'</option>').join('');
 el.value=String(target);draft.school=target;showSchoolStats();
}
function schoolChoiceRow(){
 const school=schools[draft.school]||schools[0];const level=school.prep?'6':String(school.classif);
 const available=schools.map((x,i)=>({x,i})).filter(({x})=>!x.prep&&String(x.classif)===level);
 const chosen=available.some(x=>x.i===draft.school)?draft.school:available[0]?.i;
 draft.school=chosen;
 return '<div class="signup-grid"><label>School classification<select id="school-class" onchange="schoolClassSelection()">'+[1,2,3,4,5,6].map(n=>'<option value="'+n+'"'+(String(n)===level?' selected':'')+'>'+n+'A</option>').join('')+'</select></label>'+
 '<label>School<select id="school" onchange="showSchoolStats()">'+available.map(({x,i})=>'<option value="'+i+'"'+(i===chosen?' selected':'')+'>'+e(x.name)+' · '+e(x.scheme)+'</option>').join('')+'</select></label></div>';
}
function requestPositionChange(pos){
 if(!game||!POSITION_FAMILIES[pos]||game.pos===pos)return;
 if(game.gamePending||game.scheduledEvent){feedback='Finish the current game or decision before changing positions.';render();return;}
 const old=game.pos;game.pos=pos;game.focus={};GROUPS[pos].forEach(g=>game.focus[g[0]]=0);
 if(game.college)game.college.position=pos;
 if(typeof assignRoster==='function')try{assignRoster();}catch(_e){}
 if(typeof evaluatePlacement==='function')try{evaluatePlacement();}catch(_e){}
 if(game.playerProfile){profileMilestone('position-change-'+game.year+'-'+game.week+'-'+pos,'Position change',old+' to '+pos+' at '+game.school.name,{snapshot:true});}
 note('Position change: '+old+' → '+pos+'. Coach reevaluates the depth chart; a starting role is not guaranteed.');
 feedback='Position changed to '+pos+'. Training focus reset; check your team depth chart.';persist();render();
}
function positionChangeScreen(){return panel('Change football position','<p>Request a new primary position. Ratings stay unchanged, but the depth-chart evaluation and training categories change. Existing statistics remain credited to your career.</p><div class="line"><span>Current position</span><strong>'+e(game.pos)+'</strong></div><label>New position <select id="positionChangePick">'+Object.keys(POSITION_FAMILIES).map(p=>'<option value="'+p+'" '+(p===game.pos?'selected':'')+'>'+p+'</option>').join('')+'</select></label><button onclick="requestPositionChange(document.getElementById(\'positionChangePick\').value)">Request position change</button>');}
function schoolTransferScreen(){
 if(game.stage==='college'||game.stage==='recruiting')return '';
 const offseason=[1,2,3,4].includes(game.phase);const prepEligible=game.grade>=10&&rating(game.attrs,game.pos)>=62&&game.gpa>=2.7;
 const schoolList=schools.map((x,i)=>({x,i})).filter(({x})=>x.id!==game.school.id);
 const group=Number(game.transferClass||game.school.classif);
 const options=schoolList.filter(({x})=>!x.prep&&x.classif===group);
 const preps=schoolList.filter(({x})=>x.prep);
 const select='<div class="buttons">'+[1,2,3,4,5,6].map(n=>'<button class="'+(n===group?'':'alt')+'" onclick="setSchoolTransferClass('+n+')">'+n+'A</button>').join('')+'</div>';
 const rows=options.map(({x,i})=>'<div class="line"><span>'+e(x.name)+' · '+e(x.scheme)+' · coach '+x.coaching+' · facilities '+x.facilities+'</span><button class="alt" onclick="requestHighSchoolTransfer('+i+')" '+(!offseason?'disabled':'')+'>Transfer</button></div>').join('');
 const prepRows=preps.map(({x,i})=>'<div class="line"><span>'+e(x.name)+' · prestigious prep program · coach '+x.coaching+'</span><button class="alt" onclick="requestHighSchoolTransfer('+i+')" '+(!offseason||!prepEligible?'disabled':'')+'>Apply</button></div>').join('');
 return panel('High school transfers','<div class="line"><span>Current school</span><strong>'+e(game.school.name)+'</strong></div><div class="line"><span>Transfer period</span><strong>'+(offseason?'Open':'Closed during fall season')+'</strong></div><p class="muted">Transfers take place outside the fall season; choose a classification, then a school. Your previous stats and honors remain in your record. Placement at your new school is reevaluated.</p><h3>Regular schools</h3>'+select+rows+'<h3>National preparatory programs</h3><p class="muted">By application only: grade 10+, 62+ OVR and 2.70+ GPA. Selective prep programs offer stronger competition but do not guarantee playing time or college offers.</p>'+prepRows);
}
function setSchoolTransferClass(n){game.transferClass=n;render()}
function requestHighSchoolTransfer(index){
 if(!game||game.stage==='college'||game.stage==='recruiting'||game.phase===0){feedback='Transfers are available during the offseason only.';render();return}
 const target=schools[index];if(!target||target.id===game.school.id)return;
 if(target.prep&&(game.grade<10||rating(game.attrs,game.pos)<62||game.gpa<2.7)){feedback='Prep application unavailable: sophomore or older, at least 62 OVR and 2.70 GPA required.';render();return}
 const old=game.school.name;game.school=target;game.schools=schools;game.team=createRoster(target,game.pos);game.placement=null;game.squadPreference='Auto';game.dualSquad=false;game.schedule=createSchedule();
 game.schoolTransfers=game.schoolTransfers||[];game.schoolTransfers.push({year:game.year,grade:game.grade,from:old,to:target.name,prep:!!target.prep});
 if(typeof profileMilestone==='function')profileMilestone('school-transfer','Transferred high schools',old+' → '+target.name+'.',{snapshot:true});
 note('Transferred from '+old+' to '+target.name+'. New roster assignments will be evaluated.');feedback='Transfer accepted: '+target.name+'. Your previous game history remains intact.';persist();render();
}
function draftHeight(){
  const ft=Number(document.getElementById('heightFeet').value);
  const inches=Number(document.getElementById('heightInches').value);
  if(!Number.isInteger(ft)||!Number.isInteger(inches)||inches<0||inches>11)return NaN;
  return ft*12+inches;
}
function draftCost(attributeValues){
  return ATTRS.reduce((sum,k)=>sum+Math.max(0,Number(attributeValues[k])-38),0)+
    Math.max(0,Number(attributeValues.iq)-50)+Math.max(0,Number(attributeValues.behavior)-50);
}
function readCreationAttributes(){
  const values={};for(const k of [...ATTRS,'iq','behavior'])values[k]=Number(document.getElementById('a_'+k).value);
  return values;
}
function showBudget(changed){
  // Sliders have a real shared 100-point budget: moving one cannot spend
  // another slider's points. Players free points by lowering a stat first.
  const values=readCreationAttributes();
  if(changed&&changed.id?.startsWith('a_')){
    const key=changed.id.slice(2),base=key==='iq'||key==='behavior'?50:38;
    const others={...values,[key]:base};
    const available=Math.max(0,100-draftCost(others));
    const maxAllowed=base+available;
    if(values[key]>maxAllowed){changed.value=String(maxAllowed);values[key]=maxAllowed;}
  }
  const cost=draftCost(values),spent=document.getElementById('spent');
  spent.textContent=cost+' / 100';
  spent.style.color=cost===100?'#77dfaf':'#f3c771';
  const remaining=document.getElementById('remaining-points');
  if(remaining)remaining.textContent=(100-cost)+' points available';
  const budgetBar=document.querySelector?.('.signup-budget i');if(budgetBar)budgetBar.style.width=cl(cost,0,100)+'%';
  for(const k of [...ATTRS,'iq','behavior'])document.getElementById('v_'+k).textContent=values[k];
  draft.points=Object.fromEntries(ATTRS.map(k=>[k,values[k]]));
  draft.intelligence=values.iq;draft.behavior=values.behavior;
  return cost;
}
function setupScreen(){
  let feet=Math.floor(draft.height/12),inches=draft.height%12;
  const ftOptions=[4,5,6].map(f=>'<option value="'+f+'"'+(f===feet?' selected':'')+'>'+f+' ft</option>').join('');
  const inOptions=Array.from({length:12},(_,i)=>'<option value="'+i+'"'+(i===inches?' selected':'')+'>'+i+' in</option>').join('');
  const jersey=draft.jersey??7,hand=draft.hand||'Right';
  const identity='<div class="signup-section-head"><span class="signup-section-number">01</span><div><strong>STUDENT INFORMATION</strong><small>Player identification / equipment sizing</small></div></div>'+
    '<label>Student athlete full name<input id="name" type="text" maxlength="30" autocomplete="off" value="'+e(draft.name)+'" placeholder="First and last name"></label>'+
    '<div class="signup-grid"><label>Hometown / home area<input id="hometown" type="text" maxlength="48" value="'+e(draft.hometown||'')+'" placeholder="Optional"></label>'+
    '<label>Preferred jersey number<input id="jersey" type="number" min="0" max="99" value="'+e(jersey)+'"></label></div>'+
    '<div class="signup-grid"><label>Primary position<select id="position" onchange="setDraftPos(this.value)">'+Object.keys(GROUPS).map(x=>'<option '+(x===draft.position?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
    '<label>Dominant / throwing hand<select id="hand"><option'+(hand==='Right'?' selected':'')+'>Right</option><option'+(hand==='Left'?' selected':'')+'>Left</option></select></label></div>'+
    '<div class="signup-grid"><div><label>Height</label><div class="height-inputs"><label>Feet<select id="heightFeet" aria-label="Height feet">'+ftOptions+'</select></label><label>Inches<select id="heightInches" aria-label="Height inches">'+inOptions+'</select></label></div><small>Allowed: 4 ft 10 in to 6 ft 8 in</small></div>'+
    '<label>Weight (lbs)<input type="number" id="weight" min="110" max="280" value="'+draft.weight+'"></label></div>'+
    '<div class="signup-section-head"><span class="signup-section-number">02</span><div><strong>HOUSEHOLD & SCHOOL</strong><small>Program registration and family context</small></div></div>'+
    '<label>Family / household background<select id="bg">'+BG.map(x=>'<option value="'+x[0]+'" '+(x[0]===draft.bg?'selected':'')+'>'+x[1]+'</option>').join('')+'</select></label>'+
    schoolChoiceRow();
  const attributeInputs=[...ATTRS,'iq','behavior'].map(k=>{
    const baseline=k==='iq'||k==='behavior'?50:38;
    const value=k==='iq'?draft.intelligence:k==='behavior'?draft.behavior:draft.points[k]??38;
    return '<label class="line"><span>'+e(k==='iq'?'Academic intelligence':k==='behavior'?'Behavior / Coachability':k.replace(/\b\w/g,c=>c.toUpperCase()))+'</span><strong id="v_'+k+'">'+value+'</strong></label>'+
      '<input aria-label="'+e(k)+' creation attribute" type="range" id="a_'+k+'" min="'+(baseline===50?35:28)+'" max="'+(baseline===50?85:70)+'" value="'+value+'" oninput="showBudget(this)">';
  }).join('');
  return '<div class="bar"><div class="logo">GRIDIRON LIFE</div><span class="chip">v0.5 Part 8.9 · Registration</span></div>'+
    '<div class="signup-masthead"><div class="signup-overline">INTERSCHOLASTIC ATHLETICS · INTAKE DOCUMENT</div><h1>Create your freshman</h1><p>High School Football Registration</p><div class="signup-stamp">FORM GL–09 · NEW STUDENT · ACADEMIC YEAR 1</div></div>'+
    '<section class="panel signup-sheet">'+identity+'</section>'+
    panel('03 · School profile & program evaluation','<p class="muted">Review the program you are registering for. School choice affects football opportunities and resources.</p><div id="school-profile">'+selectedSchoolStats()+'</div>')+
    '<section class="panel signup-sheet"><div class="signup-section-head"><span class="signup-section-number">04</span><div><strong>INITIAL ATHLETIC EVALUATION</strong><small>Budget: 100 development points at registration</small></div></div>'+
      '<div class="line"><strong>Creation points used</strong><strong id="spent">0 / 100</strong></div><div class="meter signup-budget"><i style="width:0"></i></div><p id="remaining-points" class="muted">100 points available</p>'+attributeInputs+
      '<p class="muted">Each point above the baseline costs one. Lowering below baseline does not create extra points. You can keep developing after registration.</p></section>'+
    '<section class="panel signup-confirm"><div class="signup-section-head"><span class="signup-section-number">05</span><div><strong>REGISTRATION ACKNOWLEDGMENT</strong><small>Student athlete sign-up</small></div></div>'+
    '<p>Submitting creates your freshman career at the selected school. A permanent registration record becomes the first entry in your evolving player biography.</p>'+
    '<button id="start-career" onclick="start()">Submit Registration & Begin Career</button></section>';
}

function commonHeader(){let d=depth(),ph=PHASES[game.phase];return '<div class="bar"><div><div class="logo">GRIDIRON LIFE</div><small>v0.5 Part 8.9 · '+e(ph.name)+' · Year '+game.year+' · Week '+game.week+'</small></div><span class="chip">'+game.grade+'th grade · '+d.level+' '+d.role+'</span></div><h1>'+e(game.name)+' <span class="muted">· '+game.pos+'</span></h1><div class="stats">'+stat('OVR',rating(game.attrs,game.pos))+stat('Morale',Math.round(game.morale))+stat('Fatigue',Math.round(game.fatigue)+'%')+stat('Career wear',healthState().wear.toFixed(1)+'%')+stat('GPA',game.gpa.toFixed(2))+'</div><div class="tabs">'+[['home','Home'],['career','Career'],['profile','Player Profile'],['team','Team'],['develop','Development'],['life','Life'],['summer','Offseason'],['recruiting','Recruiting'],['history','History']].map(t=>'<button class="'+(tab===t[0]?'active':'')+'" onclick="tab=\''+t[0]+'\';render()">'+t[1]+'</button>').join('')+'</div>'+(feedback?'<div class="notice">'+e(feedback)+'</div>':'')}

function healthPanel(compact=false){
  const h=healthState(),last=h.weekReports[0];
  const wearLabel=h.wear>=65?'High wear · longer injury recovery':h.wear>=35?'Elevated wear · injury recovery can lengthen':h.wear>=10?'Accumulating wear':'Low wear';
  const metrics='<div class="grid">'+[['Short-term fatigue',Math.round(game.fatigue)+'%'],['Career wear',h.wear.toFixed(1)+'%'],['Durability',Math.round(h.durability)+'/99'],['Current injury',game.injury?game.injury.name+' · '+game.injury.weeks+' week(s)':'None']].map(x=>'<div class="tile"><small>'+e(x[0])+'</small><div class="num">'+e(x[1])+'</div></div>').join('')+'</div>';
  const report=last?'<p><strong>Last weekly breakdown: '+e(last.phase)+' W'+last.week+'</strong> · starting '+last.before.toFixed(1)+'% · pre-recovery peak '+(Number.isFinite(last.peak)?last.peak:last.before).toFixed(1)+'% · ending '+last.after.toFixed(1)+'%</p><div class="grid">'+[
    ['Team practice','+'+last.team],['Individual training','+'+last.extra],['Games / contact','+'+last.game],['7v7 / camps','+'+(last.field??0)],['Physical work','+'+last.work],['Natural recovery','−'+last.natural],['Dedicated recovery','−'+last.dedicated]
  ].map(x=>'<div class="line"><span>'+e(x[0])+'</span><strong>'+e(x[1])+'</strong></div>').join('')+'</div><p class="muted">Game contact: '+last.contacts.toFixed(1)+' equivalent contacts. Career wear: '+last.wearBefore.toFixed(2)+' → '+last.wearAfter.toFixed(2)+'%. Actual changes can be rounded and clamped at zero.</p>':
    '<p class="muted">No weekly health report yet. Your first report appears after a simulated week.</p>';
  const wearDetail=last?'<p class="muted">Last wear change: contact +'+(last.contactWear??0).toFixed(3)+' · excess fatigue +'+(last.overloadWear??0).toFixed(3)+' · injuries +'+(last.injuryWear??0).toFixed(3)+' · weekly healing −'+(last.wearRecovery??0).toFixed(3)+' points. Older weekly reports may show zero breakdown because the detail was not stored yet.</p>':'';
  const injuries=h.injuryHistory.length?'<details><summary>Injury history ('+h.injuryHistory.length+')</summary>'+h.injuryHistory.slice(0,12).map(i=>'<div class="log">'+e(i.name)+' · Year '+i.year+' '+e(i.phase)+' Week '+i.week+' · '+i.weeks+'-week absence</div>').join('')+'</details>':'';
  return panel('Physical health',metrics+'<p><strong>'+e(wearLabel)+'</strong> · Career wear is a long-term 0–100 scale; higher is worse. Contact and injuries add wear; seasonal healing can reduce it. It does NOT reset when fatigue reaches zero.</p><p class="muted">At 35 wear, serious injuries may take longer to heal; at 65, longer still. Durability influences injury odds, not your endurance or OVR.</p>'+report+wearDetail+(compact?'':injuries));
}

function scoutReport(match){
 if(!match)return '<p class="muted">No upcoming football game is scheduled.</p>';
 return '<div class="story"><h3>'+(match.playoff?e(match.round)+' · ':'')+e(match.opponentName)+'</h3><p>'+e(String(match.opponentClass))+'A · '+(match.home?'Home':'Away')+' · '+(match.district?'District game':match.playoff?'Playoff elimination game':'Non-district game')+'</p><div class="grid">'+[
  ['Team strength',match.opponentStrength],['Offense',match.opponentOffense??match.opponentStrength],['Defense',match.opponentDefense??match.opponentStrength],['Run defense',match.opponentRunDefense??match.opponentStrength],['Pass defense',match.opponentPassDefense??match.opponentStrength]
 ].map(x=>'<div class="tile"><small>'+e(x[0])+'</small><strong>'+Math.round(x[1])+'/99</strong></div>').join('')+'</div><p class="muted">Defensive ratings affect rushing lanes and pass success; offensive strength influences opponent scoring.</p></div>';
}
function competitionPanels(){
 const c=competitionState(),status=seasonStatusText(),ranked=districtTable(),p=c.postseason;
 const standings='<table><thead><tr><th>Rank</th><th>School</th><th>District</th><th>Overall</th><th>STR</th></tr></thead><tbody>'+ranked.map((x,i)=>'<tr'+(x.id==='school'?' style="color:#f3c86e;font-weight:800"':'')+'><td>'+(i+1)+'</td><td>'+e(x.name)+(i<4?' · Playoff position':'')+'</td><td>'+x.districtRecord.join('–')+'</td><td>'+x.record.join('–')+'</td><td>'+x.strength+'</td></tr>').join('')+'</tbody></table>';
 const sched=c.fixtures.map(m=>{
  const g=(game.games||[]).find(x=>x.year===game.year&&x.week===m.week&&!x.playoff);
  const value=g?(g.win?'W ':'L ')+g.score+'–'+g.opp:'Upcoming';
  return '<div class="line"><span>W'+m.week+' · '+e(m.opponentName)+' <small>('+e(m.district?'District':'Non-district')+')</small></span><strong>'+e(value)+'</strong></div>';
 }).join('');
 let bracket='<p class="muted">The bracket will be published after the final regular-season game.</p>';
 if(p){bracket='<p><strong>'+e(status.description)+'</strong> · District place '+ordinal(p.districtPlace)+'</p>'+
  (p.championId?'<p>State bracket champion: <strong>'+e(findBracketTeam(p,p.championId)?.name||'Unknown')+'</strong></p>':'')+
  p.rounds.map((rd,i)=>'<details '+(i===p.roundIndex?'open':'')+'><summary>'+e(rd.name)+' · '+rd.matches.length+' matchups</summary>'+rd.matches.map(m=>{
   const a=findBracketTeam(p,m.aId),b=findBracketTeam(p,m.bId);
   return '<div class="line'+(m.aId==='school'||m.bId==='school'?' accent':'')+'"><span>'+e(a?.name||'TBD')+' vs '+e(b?.name||'TBD')+'</span><strong>'+ (m.winnerId?m.scoreA+'–'+m.scoreB:'Not played')+'</strong></div>';
  }).join('')+'</details>').join('');}
 return panel('District standings · '+game.school.classif+'A',
  '<p><strong>Playoff status: '+e(status.description)+'</strong></p><p class="muted">Fictional 8-school district. Top four qualify. Standings prioritize district wins and head-to-head results, then point difference. The postseason uses a fictional 64-team, six-round state bracket.</p>'+standings)
  +panel('Schedule · '+c.regularWeeks+' games',sched)
  +panel('State playoffs & bracket',bracket);
}
function homeScreen(){
 const d=depth(),ph=PHASES[game.phase],match=currentMatchup(),record=currentRecord(),last=game.games?.[0],inj=game.injury;
 const opponent=match?.name||match?.opponentName||match?.opponent?.name||'Next opponent pending';
 const next=game.gamePending?'Play Game':'Advance Week';
 const action=game.gamePending?'simulateGame()':'nextWeek()';
 return panel('This week',
 '<div class="grid">'+stat('Season',ph.name+' W'+game.week)+stat('Squad',d.level)+stat('Team record',record.join('–'))+stat('GPA',game.gpa.toFixed(2))+'</div>')+
 panel('Game day', '<div class="hub-match"><strong>'+e(game.school.name)+'</strong><span>VS</span><strong>'+e(opponent)+'</strong></div>'+(match?'<div class="grid">'+stat('Strength',match.opponentStrength??match.strength??'—')+stat('Offense',match.opponentOffense??'—')+stat('Defense',match.opponentDefense??'—')+stat('Pass defense',match.opponentPassDefense??'—')+'</div>':'')+'<div class="buttons"><button onclick="'+action+'">'+next+'</button><button class="alt" onclick="openSection(&#39;career&#39;,&#39;Game day & career&#39;)">Game details</button></div>')+
 panel('Needs attention', (inj?'<div class="notice">Injury: '+e(inj.name)+' · '+inj.weeks+' weeks remaining</div>':'')+(game.scheduledEvent?'<div class="notice">Decision: '+e(game.scheduledEvent.title)+'</div>':'')+(!inj&&!game.scheduledEvent?'<p class="muted compact-label">No urgent alerts</p>':'')+
 '<div class="hub-shortcuts"><button class="alt" onclick="openSection(&#39;develop&#39;,&#39;Weekly availability&#39;)">Training</button><button class="alt" onclick="openSection(&#39;profile&#39;,&#39;Living player biography&#39;)">Player bio</button><button class="alt" onclick="openSection(&#39;recruiting&#39;)">Recruiting</button><button class="alt" onclick="openSection(&#39;team&#39;)">Team</button></div>')+
 panel('Recent result',last?'<strong>'+e(last.opponentName||'Opponent')+'</strong> · '+(last.win?'Win':'Loss')+' '+last.score+'–'+last.opp+'<div class="buttons"><button class="alt" onclick="openSection(&#39;career&#39;,&#39;Last game&#39;)">Game report</button></div>':'<p class="muted compact-label">No recorded games yet.</p>');
}
function openSection(destination,heading){tab=destination;render();if(heading){const buttons=[...document.querySelectorAll('.subtab')];const match=buttons.find(b=>b.textContent.toLowerCase().includes(heading.toLowerCase()));if(match)match.click();}}
function careerScreen(){
  let d=depth(),ph=PHASES[game.phase],record=currentRecord(),match=currentMatchup();
  let event=game.scheduledEvent?panel('Important decision','<div class="story"><h3>'+e(game.scheduledEvent.title)+'</h3><p>'+e(game.scheduledEvent.body)+'</p></div>'+game.scheduledEvent.choices.map((c,i)=>'<button class="choice" onclick="chooseEvent('+i+')">'+e(c[0])+'</button>').join('')):'';
  let preview=''; // Opponent strengths live on Home, not repeated in Career.
  let gp=game.finished?'<p><strong>High school career completed.</strong> Your history is preserved.</p>':game.gamePending?panel('Game Day · Week '+game.week,preview+'<p><strong>'+e(game.school.name)+'</strong> · '+e(d.level)+' · '+e(d.role)+(d.dressLevel?' · Also dresses '+e(d.dressLevel):'')+'</p><p>Coach '+e(game.school.coach)+' runs a '+e(game.school.scheme)+' offense ('+Math.round(game.school.runRate*100)+'% run). Current fatigue '+Math.round(game.fatigue)+'%.</p><button onclick="simulateGame()">Simulate This Game</button>'):preview+'<div class="buttons"><button onclick="nextWeek()">'+(game.phase===0?'Advance to Game Day':'Simulate Next Week')+'</button></div>';
  let last=game.games[0];
  return event+panel('Game day & career','<p>'+e(game.school.name)+' · '+game.school.classif+'A · '+e(ph.name)+' · '+ph.capacity+' discretionary hours/week</p><div class="grid"><div class="tile"><strong>Depth chart: #'+d.rank+'</strong><br><small>'+e(d.role)+' on '+e(d.level)+'</small></div><div class="tile"><strong>'+e(d.level)+' season: '+record[0]+'–'+record[1]+'</strong><br><small>Coach trust '+Math.round(game.coachTrust)+'/100 · Other squads: Team tab</small></div></div><p class="muted">'+(game.injury?'Injured: '+game.injury.name+' ('+game.injury.weeks+' week(s) remaining)':'You are medically available.')+'</p>'+gp)

  +careerAwardSpotlight()
  +(last?panel('Last game · Year '+last.year+' Week '+last.week,'<h3>'+e(last.opponentName||'Opponent')+' · '+(last.win?'Win':'Loss')+' '+last.score+'–'+last.opp+'</h3><p>'+last.role+' · '+last.level+(last.upperDress?' · Dressed '+last.upperDress+' as backup':'')+' · '+gameStatsDescription(last,game.pos)+'</p>'+(last.honors?.length?'<p class="accent">'+last.honors.map(x=>e(x.title)).join(' · ')+'</p>':'')+'<details><summary>View your actual play log ('+last.plays.length+' events)</summary>'+(last.plays.length?last.plays.map(x=>'<div class="log">'+e(x)+'</div>').join(''):'<p>No recorded player involvement this week.</p>')+'</details>'):'')
  +panel('Latest career activity',game.history.slice(0,7).map(h=>'<div class="log"><strong>'+e(h.title)+'</strong><br>'+e(h.text)+'</div>').join(''));
}


function squadChoicesPanel(){
 const d=depth(),selected=game.squadPreference||'Auto',available=d.levels;
 const options=[['Auto','Coach decides'],['Freshman','Request freshman'],['JV','Request JV'],['Varsity','Request varsity']].filter(x=>x[0]==='Auto'||available.includes(x[0]));
 const buttons=options.map(([v,label])=>'<button '+(selected===v?'class="active"':'class="alt"')+' onclick="setSquadPreference(\''+v+'\')">'+e(label)+'</button>').join('');
 const teammate=d.all.find(x=>x.id!=='you');
 const summary='<div class="grid"><div class="tile"><small>Primary game team</small><div class="num">'+e(d.level)+'</div><small>'+e(d.role)+' · position rank #'+d.rank+'</small></div><div class="tile"><small>Higher-team backup duty</small><div class="num">'+e(d.dressLevel||'None')+'</div><small>'+(d.dressLevel?'You can dress above your primary squad, but keep your normal primary-squad games.':'Not assigned to a second team')+'</small></div></div>';
 return panel('Squad placement',
  summary+'<details class="inline-explanation"><summary aria-label="Why this squad assignment?" title="Coach decision details">? <span class="sr-only">Coach decision</span></summary><p>'+e(d.decision)+'</p><p>Choose a preferred squad; coaches decide the role. Grade and school size affect eligibility. Seniors play varsity.</p></details>'+
  '<div class="buttons">'+buttons+'</div>'+
  '<label style="display:block;margin-top:12px"><input type="checkbox" style="width:auto" '+(game.dualSquad?'checked':'')+' onchange="setDualSquad(this.checked)"> Request to dress for the next higher squad as a backup while still playing for my primary squad</label>'+

  (teammate?'<p class="muted">Closest '+e(d.level)+' competition: '+e(teammate.name)+' · '+teammate.ovr+' OVR. Coach trust may settle close evaluations, but your character gets no automatic starter priority.</p>':''));
}
function teamScreen(){
  let d=depth(),s=game.school,levels=levelsForSchool(s),rows=levels.map(l=>{let record=game.squadRecords?.[l]||[0,0];return '<div class="tile"><strong>'+l+'</strong><div class="num">'+record[0]+'–'+record[1]+'</div><small>'+d.squads[l].length+' players at '+game.pos+'</small></div>'}).join('');
  let starts=game.positionStarts||{};
  let charts=levels.slice().reverse().map(l=>'<h3>'+l+' · '+(d.level===l?'YOUR PRIMARY SQUAD':'')+'</h3><table><thead><tr><th>#</th><th>Player</th><th>Grade</th><th>OVR</th><th>Starts*</th></tr></thead><tbody>'+d.squads[l].map((x,i)=>'<tr'+(x.id==='you'?' style="color:#f3c86e;font-weight:800"':'')+'><td>'+(i+1)+'</td><td>'+e(x.name)+(x.id==='you'?' (YOU)':'')+(i===0?' · Starter':'')+'</td><td>'+x.grade+'</td><td>'+x.ovr+'</td><td>'+((starts[x.id]||{})[l]||0)+'</td></tr>').join('')+'</tbody></table>'+
    (d.dressed[l]?.length?'<p><strong>Dressing for '+l+' as backups while playing for a lower squad:</strong> '+d.dressed[l].map(id=>{const x=d.allPlayers.find(x=>x.id===id);return e(x?.name||id)+(id==='you'?' (YOU)':'')}).join(' · ')+'</p>':'')) .join('');
  let match=currentMatchup();
  return panel('Your school','<h3>'+e(s.name)+' · '+s.classif+'A</h3><p>'+e(s.coach)+' · '+e(s.scheme)+' offense · '+e(s.defense)+' defense</p><div class="grid">'+[['Prestige',s.prestige],['Coaching',s.coaching],['Facilities',s.facilities],['Run rate',Math.round(s.runRate*100)+'%'],['Star reliance',s.star+'%'],['Expectations',s.expectations]].map(v=>'<div class="tile"><small>'+v[0]+'</small><div class="num">'+v[1]+'</div></div>').join('')+'</div>')
    +panel('Squad records · Year '+game.year,'<p class="muted">Records reset each fall season and are preserved in History. Squads compete separately.</p><div class="grid">'+rows+'</div>')

    +competitionPanels()
    +positionRoomPanel()+positionChangeScreen()+twoWayPanel()
    +panel('Position depth charts','<p class="muted">Primary placement aims to give younger backups meaningful lower-team opportunities. Upper-squad dressed reserves remain on their primary team. Seniors play varsity only; available levels depend on school classification. *Starts are recorded from Part 7 onward; previous seasons cannot be reconstructed. This roster covers your position group, not full 22-player lineups.</p>'+charts)
    +squadChoicesPanel()
    +panel('Program alumni','<strong>'+game.alumni.length+' graduated players</strong><p class="muted">Graduates are removed from active rosters and kept in school history.</p>'+(game.alumni.length?game.alumni.slice(-12).reverse().map(x=>'<div class="log">'+e(x.name)+' · '+e(x.pos)+' · '+x.ovr+' OVR · Finished Year '+x.graduatedAfterYear+'</div>').join(''):'No graduating class yet.'))+schoolTransferScreen();
}

function developScreen(){let ph=PHASES[game.phase];return panel('Weekly availability','<p>Everyone has the same '+ph.capacity+' discretionary hours in '+e(ph.name)+'. Commitments use those hours; morale changes efficiency, not the number of hours.</p><div class="line"><strong>'+allHours()+' / '+hoursCap()+' hours allocated</strong><span class="accent">'+(hoursCap()-allHours())+'h free</span></div>'+Object.entries({training:'Extra training',study:'Studying',work:'Flexible gigs / work',social:'Socializing',recovery:'Dedicated recovery'}).map(([k,label])=>rang(label,game.plan[k],0,hoursCap(),'alloc(\''+k+'\',+this.value)','h')).join('')+(game.job?'<p class="muted">Recurring employment automatically reserves '+game.job.hours+' additional hours weekly.</p>':'')+(sevensWeeklyHours()?'<p class="muted">Seven-on-seven reserves another 4 hours every week while this circuit is active.</p>':'') )+panel('Team practice','<p>Mandatory '+ph.teamHours+' hours/week. '+e(game.school.coach)+' chooses the drills; you choose your effort.</p>'+rang('Team practice intensity',game.teamIntensity,0,4,'setIntensity(\'teamIntensity\',+this.value)')+'<small>0 Coasting · 1 Light · 2 Standard · 3 High · 4 Maximum</small>')+panel('Individual training · '+game.plan.training+' hours','<p>Allocate your training-hours pool across skills. You can work on multiple skills every week.</p><div class="line"><strong>'+focusTotal()+' / '+game.plan.training+' assigned</strong><small>Unused hours provide no extra training</small></div>'+GROUPS[game.pos].map(g=>rang(g[1]+' ('+g[2].join(', ')+')',game.focus[g[0]],0,game.plan.training,'setFocus(\''+g[0]+'\',+this.value)','h')).join('')+'<hr>'+rang('Extra training intensity',game.extraIntensity,0,4,'setIntensity(\'extraIntensity\',+this.value)')+'<small>0 Minimal · 1 Light · 2 Moderate · 3 High · 4 Extreme</small><p class="muted">School coaching, morale, intelligence, accumulated fatigue and recovery affect efficiency. Development is applied automatically each simulated week; there are no skill points.</p>')+panel('Player attributes','<div class="grid">'+ATTRS.map(k=>'<div class="tile"><small>'+e(k)+'</small><div class="line"><strong>'+game.attrs[k]+'</strong><small>'+Math.round((game.progress[k]||0)/12*100)+'% to next</small></div><div class="meter"><i style="width:'+Math.min(100,(game.progress[k]||0)/12*100)+'%"></i></div></div>').join('')+'</div>')+healthPanel();}

function equipmentEffectsPanel(){
 const owned=Boolean(game.gearProtection||game.purchases?.gear);
 return panel('Equipment & active effects',
  '<div class="line"><span>Properly fitted cleats & protective gear</span><strong>'+(owned?'Equipped':'Not owned')+'</strong></div>'+
  '<div class="line"><span>Calculated weekly injury chance</span><strong>'+(owned?'25% lower':'No equipment reduction')+'</strong></div>'+
  '<div class="line"><span>Attribute / OVR boost</span><strong>None</strong></div>'+
  '<p class="muted">The gear reduces the injury probability after the game, training, fatigue, durability and career-wear factors are calculated. Example: a 4% weekly injury chance becomes 3%. It does not guarantee safety or improve passing, rushing, or speed. Purchasing also gives +2 morale once.</p>');
}
function stressPanel(){
 const p=stressBreakdown(), last=(game.stressReports||[])[0];
 const signed=n=>(n>=0?'+':'−')+Math.abs(n).toFixed(2);
 const rows=[['Weekly baseline',p.baseline],['Struggling courses',p.academic],['Practice intensity',p.intensity],['Extra-training overload',p.extraTraining],['Job commitment',p.job],['Family expectations',p.family],['Social time',-p.social],['Dedicated recovery',-p.recovery]];
 const projected=cl(game.stress+p.total,0,100);
 return panel('Stress · how to manage it',
   '<div class="grid"><div class="tile"><small>Current stress</small><div class="num">'+Math.round(game.stress)+'/100</div></div><div class="tile"><small>Projected next weekly stress</small><div class="num">'+projected.toFixed(1)+'/100</div></div></div>'+
   '<p><strong>With your current schedule:</strong> '+signed(p.total)+' stress per week before the 0–100 limit, random events, and one-time purchases. This is an estimate, not a promise.</p>'+
   rows.map(([name,num])=>'<div class="line"><span>'+e(name)+'</span><strong>'+signed(num)+'</strong></div>').join('')+
   '<p class="muted">To lower stress: allocate more Socializing or Dedicated recovery hours, reduce extreme practice intensity or excessive extra training, address failing courses, or reduce job hours. A Weekend outing reduces stress by 3 immediately for $30 and 2 available hours. Regular sleep is already assumed.</p>'+
   (last?'<details><summary>Last simulated week · '+e(last.phase)+' W'+last.week+'</summary><p>Stress: '+last.before.toFixed(1)+' → '+last.after.toFixed(1)+'; weekly scheduled change '+signed(last.total)+'. Direct story events and purchases can alter stress separately.</p></details>':'<p class="muted">A weekly stress record appears after the next simulated week.</p>'));
}
function moneyScreen(){
  const p=game.purchases||{},a=academicState();
  const store=MARKET.map(item=>{
    const owned=Boolean(item.once&&p[item.id]),unavailable=item.id==='clinic'&&game.phase===0;
    return '<div class="tile store"><div><strong>'+e(item.name)+'</strong><p class="muted">'+e(item.description)+'</p><small>'+(item.hours?item.hours+' free hours · ':'')+'$'+item.price+'</small></div><button class="alt" '+(owned||unavailable?'disabled':'')+' onclick="buyItem(\''+item.id+'\')">'+(owned?'Owned':unavailable?'Offseason only':'Buy · $'+item.price)+'</button></div>';
  }).join('');
  const history=(game.ledger||[]).slice(0,10).map(x=>'<div class="line"><span>'+e(x.reason)+' <small>· Year '+x.year+', '+e(x.phase)+' W'+x.week+'</small></span><strong class="'+(x.type==='income'?'accent':'')+'">'+(x.type==='income'?'+':'−')+'$'+x.amount+'</strong></div>').join('');
  return equipmentEffectsPanel()+panel('Money & choices','<p>You have <strong>$'+game.money+'</strong>. Money provides options; it cannot directly buy an OVR increase. Free family or school support remains possible.</p><div class="store-grid">'+store+'</div>')+
    panel('Recent transactions',history||'<p class="muted">No purchases or paychecks yet.</p>');
}
function lifeScreen(){
  const a=academicState(),relations=socialState();
  const grades=COURSES.map(course=>'<div class="line"><span>'+e(course)+(a.tutoring?.active&&a.tutoring.course===course?' · Tutoring':'')+'</span><strong class="'+(a.courses[course]<70?'bad':'')+'">'+a.courses[course].toFixed(1)+'%</strong></div>').join('');
  const jobText=game.job?'Currently employed: '+e(game.job.title)+' · '+game.job.hours+' hrs/week · $'+game.job.rate+'/hour.':'No recurring employer. Temporary gigs are optional.';
  const tutorText=a.tutoring?.active?'<p><strong>'+e(a.tutoring.course)+' tutoring with '+e(a.tutoring.teacher)+'</strong> · '+a.tutoring.sessions+' sessions attended. Uses 2 of your normal study hours when you study at least 2 hours/week.</p><button class="outline" onclick="endTutoring()">End tutoring</button>':'<p>No tutoring currently scheduled. Tutoring addresses the lowest course grade, not cumulative GPA directly.</p><button class="alt" onclick="scheduleTutoring()">Arrange tutoring</button>';
  return panel('Your life','<div class="grid">'+[['Money','$'+game.money],['Stress',Math.round(game.stress)+'/100'],['Morale',Math.round(game.morale)+'/100'],['Academic IQ',game.iq],['Behavior',Math.round(game.behavior)+'/99'],['Family expectations',Math.round(game.familyExpect)+'/100']].map(x=>'<div class="tile"><small>'+x[0]+'</small><div class="num">'+x[1]+'</div></div>').join('')+'</div><p class="muted">Stress responds to training intensity, family demands, academics, work, social time, and recovery. Low practice effort can reduce coach trust.</p>')
  +stressPanel()
  +panel('People in your life','<div class="grid">'+Object.entries({family:'Family',teacher:'Ms. Rivera · Teacher',teammate:'Marcus · Teammate',coach:e(game.school.coach)}).map(([id,label])=>'<div class="tile"><small>'+label+'</small><div class="num">'+Math.round(relations[id]??50)+'/100</div></div>').join('')+'</div>')
  +panel('Academics & tutoring','<p><strong>Cumulative GPA: '+game.gpa.toFixed(2)+'</strong> · Posted only after fall and spring semesters. Current grades change gradually during school; summer break freezes regular coursework.</p><div class="line"><span>Preparedness</span><strong>'+Math.round(a.preparedness)+'/100</strong></div>'+grades+'<hr>'+tutorText+(a.termReports.length?'<p class="muted">Latest semester: '+e(a.termReports[a.termReports.length-1].semester)+' · '+a.termReports[a.termReports.length-1].gpa.toFixed(2)+' term GPA.</p>':''))
  +panel('Work & time','<p>'+jobText+'</p><p class="muted">This week: '+(game.gigHoursThisWeek||0)+' hours on gigs, '+(game.activityHoursThisWeek||0)+' hours on purchases/activities. '+(hoursCap()-allHours())+' hours available.</p><div class="buttons"><button class="alt" onclick="gig()">Neighborhood gig · 3h</button>'+(!game.job?'<button class="alt" onclick="offerJob(0)">Grocery clerk · 12h/wk</button><button class="alt" onclick="offerJob(1)">Restaurant · 10h/wk</button><button class="alt" onclick="offerJob(2)">Yardwork · 8h/wk</button>':'<button class="outline" onclick="leaveJob()">Quit job</button>')+'</div><p class="muted">Recurring jobs pay weekly and reserve hours; physically demanding work adds fatigue.</p>')
  +panel('Offseason football','<p>Seven-on-seven, skill camps, and combines have their own <strong>Offseason</strong> tab. Choose your activities there and track results in History.</p><button class="alt" onclick="tab=&quot;summer&quot;;render()">View offseason opportunities</button>')
  +moneyScreen();
}
function summerScreen(){return panel('Offseason football & exposure','<p>Choose optional events. Seven-on-seven reserves weekly time; camps and combines cost time and sometimes money. Offseason exposure contributes to recruiting evaluation; colleges consider production, skill, awards and academics too.</p>')+sevenOnSevenPanel()+summerCampPanel();}
// Compact, category-switchable career tables. All data is read from saved games.
let statsView='Receiving';
function setStatsView(x){statsView=x;render();}
function statGrid(games,groupByYear=false){
 const categories={Passing:[['passComp','CMP'],['passAtt','ATT'],['passYards','YDS'],['passTD','TD'],['interceptions','INT']],Rushing:[['carries','CAR'],['rushYards','YDS'],['rushTD','TD']],Receiving:[['receptions','REC'],['recYards','YDS'],['recTD','TD']],Defense:[['tackles','TKL'],['tfl','TFL'],['sacks','SACK'],['passDef','PD'],['defInt','INT']],Blocking:[['offSnaps','SNAP'],['blocks','BLK'],['pressures','PRESS']],Special:[['fgMade','FGM'],['fgAtt','FGA'],['xpMade','XPM'],['punts','PUNT'],['puntYards','YDS'],['longSnaps','LS']]};
 const choices=Object.keys(categories),fields=categories[statsView]||categories.Receiving;
 const rows=groupByYear?[...new Set(games.map(g=>g.year))].sort((a,b)=>b-a).map(y=>({label:'Year '+y,stats:profileStats(games.filter(g=>g.year===y))})):games.slice().reverse().map(g=>({label:'Y'+g.year+' W'+g.week+' · '+(g.opponentName||'Opponent'),stats:g.stats||{},result:(g.win?'W':'L')+' '+g.score+'–'+g.opp}));
 return '<div class="stat-category-tabs">'+choices.map(c=>'<button class="'+(c===statsView?'active':'alt')+'" onclick="setStatsView(\''+c+'\')">'+c+'</button>').join('')+'</div><div class="stat-table-wrap"><table class="stat-table"><thead><tr><th>'+(groupByYear?'SEASON':'GAME')+'</th>'+(!groupByYear?'<th>RESULT</th>':'')+fields.map(([,n])=>'<th>'+n+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr><td>'+e(r.label)+'</td>'+(!groupByYear?'<td>'+e(r.result||'')+'</td>':'')+fields.map(([key])=>'<td>'+(r.stats[key]||0)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'+(rows.length?'':'<p>No games recorded yet.</p>');
}
function seasonStatsScreen(){return panel('Season-by-season statistics',statGrid(game.games||[],true))+panel('Individual game log',statGrid(game.games||[],false));}
function historyScreen(){
  const seasons=(game.seasonHistory||[]).map(s=>'<div class="log"><strong>Year '+s.year+' · Grade '+s.grade+'</strong><br>'+Object.entries(s.records||{}).map(([level,record])=>level+': '+record[0]+'–'+record[1]).join(' · ')+(s.postseason?' · Playoffs: '+e(s.postseason.status)+(s.postseason.champion?' · Champion: '+e(s.postseason.champion):''):'')+'</div>').join('');
  const games=game.games.length?game.games.map(x=>'<details><summary>Year '+x.year+' Week '+x.week+' · '+e(x.opponentName||'Unknown opponent')+' · '+(x.win?'W':'L')+' '+x.score+'-'+x.opp+' · '+x.level+'</summary><p>'+(x.upperDress?'Also dressed as '+e(x.upperDress)+' backup; no upper-squad snaps counted. ':'')+gameStatsDescription(x,game.pos)+'</p>'+(x.opponentStrength?'<p>Opponent strength: '+x.opponentStrength+'/99 · Run defense: '+(x.opponentRunDefense??'?')+'/99</p>':'')+x.plays.map(t=>'<div class="log">'+e(t)+'</div>').join('')+'</details><hr>').join(''):'<p>No games played yet.</p>';
  return panel('Player biography archive','<p>Registration, milestones, and career snapshots are available in the Player Profile tab.</p><button class="alt" onclick="tab=&#39;profile&#39;;render()">View player profile and archive</button>')+awardsHistoryPanel()+summerHistoryPanel()+positionRoomHistory()+panel('Season records',seasons||'<p>Your completed school years will appear here.</p>')
    +seasonStatsScreen()+panel('Play-by-play details',games)
    +panel('Career journal',game.history.map(x=>'<div class="log"><strong>'+e(x.title)+'</strong><br>'+e(x.text)+'</div>').join(''))
    +panel('Save and backup','<p>Autosave for v0.5 Part 8.9 uses a separate browser save slot from v0.4. Your original v0.4 save stays untouched for rollback. Export regularly before updating GitHub Pages.</p><div class="buttons"><button onclick="exportSave()">Export Save JSON</button><label style="max-width:240px">Import saved JSON<input type="file" accept="application/json" onchange="importSave(this)"></label><button class="alt" onclick="resetV5()">New Career</button></div>');
}

function recruitmentHomeScreen(){return panel('College signing', '<p>High school is complete. Review offers and choose your next school.</p><button onclick="tab=\'recruiting\';render()">Review college offers</button>')+panel('Your career', '<button class="alt" onclick="tab=\'profile\';render()">Player profile</button>');}
function collegeHomeScreen(){const c=collegeState();return panel('College dashboard','<div class="grid">'+stat('College year',c.year)+stat('Position',game.pos)+stat('OVR',rating(game.attrs,game.pos))+stat('Fatigue',Math.round(game.fatigue)+'%')+'</div>')+panel('Your program','<button onclick="tab=\'college\';render()">Open college football</button>')+panel('Career','<button class="alt" onclick="tab=\'profile\';render()">Player profile</button>');}
// College uses the same major sections as high school; sport/level content differs.
function collegeDevelopmentScreen(){
 const c=collegeState();if(!c)return '';
 const attributes=ATTRS.map(k=>'<div class="tile"><small>'+e(k)+'</small><div class="line"><strong>'+game.attrs[k]+'</strong><small>'+Math.round((game.progress[k]||0)/12*100)+'% next</small></div></div>').join('');
 const hourControls=['training','study','recovery'].map(k=>'<div class="line"><strong>'+e(k[0].toUpperCase()+k.slice(1))+'</strong><span>'+c.weeklyPlan[k]+' hours</span></div><input aria-label="College '+e(k)+' hours" type="range" min="0" max="20" value="'+c.weeklyPlan[k]+'" oninput="collegeSetPlan(\''+k+'\',this.value)">').join('');
 const groupTotal=GROUPS[game.pos].length;
 const focus=GROUPS[game.pos].map(g=>'<div class="line"><span>'+e(g[1])+' · '+e(g[2].join(', '))+'</span><strong>'+Number(game.focus[g[0]]||0)+'h</strong></div>').join('');
 return panel('Player attributes · '+rating(game.attrs,game.pos)+' OVR','<p>These are your continuing high school attributes—not a separate college rating system.</p><div class="grid">'+attributes+'</div>')+
 panel('College weekly availability','<p>'+Object.values(c.weeklyPlan).reduce((a,b)=>a+b,0)+' / 40 discretionary hours allocated. Your next college game applies these commitments.</p>'+hourControls+'<p class="muted">College coaching and facilities affect development. Fatigue, injury and recovery still matter.</p>')+
 panel('Training focus','<p>Existing training focus carries into college. Change the allocation with the controls below.</p>'+GROUPS[game.pos].map(g=>'<div class="line"><label>'+e(g[1])+'</label><strong>'+Number(game.focus[g[0]]||0)+'h</strong></div><input aria-label="'+e(g[1])+' focus" type="range" min="0" max="20" value="'+Number(game.focus[g[0]]||0)+'" oninput="collegeSetFocus(\''+g[0]+'\',this.value)">').join('')+'<p class="muted">Training focus hours are distributed within your college training allocation.</p>')+
 panel('Condition and recovery','<div class="grid">'+stat('Fatigue',Math.round(game.fatigue)+'/100')+stat('Long-term wear',Math.round(healthState().wear)+'/100')+stat('Stress',Math.round(game.stress)+'/100')+stat('Injury',game.injury?game.injury.name:'None')+'</div>');
}
function collegeLifeScreen(){
 const c=collegeState();if(!c)return '';
 return panel('College academics & eligibility','<div class="grid">'+stat('College GPA',c.gpa.toFixed(2))+stat('Academic IQ',game.iq)+stat('Seasons used',c.eligibilityUsed+'/4')+stat('Scholarship',c.scholarship+'%')+'</div><p>'+e(collegeEligibility())+'</p>')+
 panel('Money and NIL','<div class="grid">'+stat('Balance','$'+Math.round(game.money))+stat('NIL earned','$'+c.nilEarned)+'</div><p>Local NIL appearance · +$'+collegeNilOffer().value+' and +2 stress.</p><button '+(c.nilDeals.some(x=>x.year===c.year)||c.phase==='complete'||c.phase==='postseason'?'disabled':'')+' onclick="collegeAcceptNil()">Accept NIL Appearance</button>')+
 panel('Personal health','<p>Fatigue '+Math.round(game.fatigue)+' / 100 · Wear '+Math.round(healthState().wear)+' / 100 · Stress '+Math.round(game.stress)+' / 100.</p><p>'+e(game.injury?.name||'No current injury')+'</p>');
}
function collegeProfileScreen(){
 const c=collegeState(),stats=collegePlayerRecord();if(!c)return '';
 return collegeProfilePanel()+panel('College scouting and attributes','<p>'+e(game.pos)+' · '+rating(game.attrs,game.pos)+' overall · '+e(c.program.name)+' · College Year '+c.year+'</p><div class="grid">'+ATTRS.map(k=>'<div class="tile"><small>'+e(k)+'</small><strong>'+game.attrs[k]+'</strong></div>').join('')+'</div>')+
 panel('College game statistics','<p>'+e(profileStatLine(stats,game.pos))+'</p>'+c.games.slice(0,16).map(g=>'<div class="line"><span>Year '+g.year+' · W'+g.week+' · '+e(g.opponentName)+'</span><strong>'+(g.win?'W':'L')+' '+g.score+'–'+g.opp+'</strong></div>').join(''))+
 panel('High school career archive','<p>Previously attended '+e(game.school.name)+'. High school results remain accessible in History, without replacing your college identity.</p><button class="alt" onclick="tab=\'history\';render()">View high school history</button>');
}
function collegeSetFocus(key,val){
 const c=collegeState();if(!c||!GROUPS[game.pos].some(g=>g[0]===key))return;
 const current=game.focus[key]||0,requested=cl(Math.round(+val||0),0,20);
 const spent=GROUPS[game.pos].reduce((a,g)=>a+(g[0]===key?0:Number(game.focus[g[0]]||0)),0);
 game.focus[key]=Math.min(requested,Math.max(0,c.weeklyPlan.training-spent));
 if(requested!==game.focus[key])feedback='Reduce other training focuses before adding more hours.';
 persist();render();
}
function render(){
 let el=document.getElementById('app');if(!game){el.innerHTML=setupScreen();showBudget();return}
 const footer='<footer>Gridiron Life v0.5 Part 8.9 · Offline, fictional football universe · Saved locally · College simulation and eligibility are simplified.</footer>';
 if(game.stage==='recruiting'){
   const nav='<div class="tabs"><button class="'+(tab==='home'?'active':'alt')+'" onclick="tab=\'home\';render()">Home</button><button class="'+(tab==='recruiting'?'active':'alt')+'" onclick="tab=\'recruiting\';render()">Recruiting & Signing</button><button class="alt" onclick="tab=\'profile\';render()">High School Profile</button><button class="alt" onclick="tab=\'history\';render()">History & Save</button></div>';
   el.innerHTML='<div class="bar"><div class="logo">GRIDIRON LIFE</div><span class="chip">v0.5 Part 8.9 · Graduate</span></div><h1>'+e(game.name)+' · College recruitment</h1>'+nav+(tab==='home'?recruitmentHomeScreen():tab==='profile'?profileScreen():tab==='history'?historyScreen():recruitingScreen())+footer;return;
 }
 if(game.stage==='college'||game.stage==='collegeComplete'){
   const c=collegeState();
   const pages=[['home','Home'],['team','Team'],['develop','Development'],['life','Life'],['profile','Player Profile'],['college','College Football'],['history','History / Save']];
   if(!pages.some(x=>x[0]===tab))tab='home';
   const nav='<div class="tabs">'+pages.map(([id,title])=>'<button class="'+(tab===id?'active':'alt')+'" onclick="tab=\''+id+'\';render()">'+title+'</button>').join('')+'</div>';
   const views={home:collegeHomeScreen,team:collegeScreen,develop:collegeDevelopmentScreen,life:collegeLifeScreen,profile:collegeProfileScreen,college:collegeScreen,history:historyScreen};
   el.innerHTML='<div class="bar"><div class="logo">GRIDIRON LIFE</div><span class="chip">v0.5 Part 8.9 · College Year '+c.year+'</span></div><h1>'+e(game.name)+' · '+e(game.pos)+' · '+e(c.program.name)+'</h1>'+nav+(feedback?'<p class="notice">'+e(feedback)+'</p>':'')+views[tab]()+footer;return;
 }
 let content={home:homeScreen,career:careerScreen,profile:profileScreen,team:teamScreen,develop:developScreen,life:lifeScreen,summer:summerScreen,recruiting:recruitingScreen,history:historyScreen};
 el.innerHTML=commonHeader()+content[tab]()+footer;
}

function twoWayPanel(){
  const d=twoWayDecision(),pos=game.secondaryPosition||'';
  return panel('Two-way / Ironman football',
    '<div class="line"><span>Primary position</span><strong>'+e(game.pos)+'</strong></div>'+
    '<div class="line"><span>Secondary assignment</span><strong>'+e(pos||'None')+'</strong></div>'+
    '<div class="line"><span>Coach evaluation</span><strong>'+e(d.reason)+'</strong></div>'+
    '<label>Defensive position <select id="secondaryPos"><option value="">None</option>'+
    DEFENSIVE_POSITIONS.map(p=>'<option value="'+p+'" '+(p===pos?'selected':'')+'>'+p+'</option>').join('')+'</select></label>'+
    '<button onclick="requestTwoWay(document.getElementById(\'secondaryPos\').value,true)">Request two-way duty</button> '+
    '<button class="alt" onclick="requestTwoWay(null,false)">Offense only</button>'+
    '<details><summary>?</summary><p>1A and 2A schools allow more ironman assignments. At larger schools coaches require stronger primary and secondary evaluations. Playing both ways adds defensive snaps, game statistics and physical workload without doubling training gains.</p></details>');
}
