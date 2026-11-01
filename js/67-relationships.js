/* Part 7: lightweight, persistent position-room relationships.
   NPC interaction results are logged once, with real time costs; they do not
   magically change OVR or guarantee depth chart promotion. */
function teammateMemory(id){
  game.teammateMemories=game.teammateMemories||{};
  if(!game.teammateMemories[id])game.teammateMemories[id]={rapport:50,competitiveness:0,meetings:0,notes:[],lastWeek:null};
  return game.teammateMemories[id];
}
function rememberTeammate(id,text,rapport=0,rival=0){
  const person=game.team.find(x=>x.id===id);if(!person)return;
  const m=teammateMemory(id);
  m.rapport=cl(m.rapport+rapport,0,100);
  m.competitiveness=cl(m.competitiveness+rival,0,100);
  m.meetings++;m.lastWeek=game.year+'-'+game.phase+'-'+game.week;
  m.notes.unshift({year:game.year,phase:PHASES[game.phase].name,week:game.week,detail:text});
  m.notes=m.notes.slice(0,20);
}
function positionRival(){
  if(!game||!game.team.length)return null;
  const all=depth().allPlayers.filter(x=>x.id!=='you');
  return all[0]||null;
}
function teamInteraction(id,kind){
  if(game.gamePending||game.scheduledEvent){feedback='Complete your game or story decision before visiting teammates.';render();return;}
  const person=game.team.find(x=>x.id===id);if(!person)return;
  const options={film:{hours:2,rapport:4,rival:0,detail:'Reviewed film and exchanged notes',trust:1},
    competition:{hours:2,rapport:-1,rival:5,detail:'Competed in optional position drills',trust:1},
    encouragement:{hours:1,rapport:5,rival:0,detail:'Checked in and offered encouragement',trust:0}};
  const o=options[kind];if(!o)return;
  const m=teammateMemory(id),stamp=game.year+'-'+game.phase+'-'+game.week;
  if(m.lastWeek===stamp){feedback='You have already spent extra time with '+person.name+' this week.';render();return;}
  if(allHours()+o.hours>hoursCap()){feedback='Not enough available time for this visit. Free up '+o.hours+' hours.';render();return;}
  game.activityHoursThisWeek=(game.activityHoursThisWeek||0)+o.hours;
  rememberTeammate(id,o.detail,o.rapport,o.rival);
  game.coachTrust=cl(game.coachTrust+o.trust,0,100);
  if(kind==='film')academicState().preparedness=cl(academicState().preparedness+1,0,100);
  if(kind==='encouragement')game.stress=cl(game.stress-1,0,100);
  if(kind==='competition')game.stress=cl(game.stress+1,0,100);
  note(person.name+': '+o.detail+'. Rapport '+(o.rapport>=0?'+':'')+o.rapport+'; coach trust '+(o.trust?'+1':'unchanged')+'; '+o.hours+' discretionary hour(s) used.');
  persist();render();
}
function positionRoomPanel(){
  const teammates=depth().allPlayers.filter(x=>x.id!=='you').slice(0,5);
  const rows=teammates.map(x=>{
    const m=teammateMemory(x.id);const loc=depth();
    const level=loc.levels.find(level=>loc.squads[level].some(n=>n.id===x.id))||'Varsity';
    return '<div class="tile"><strong>'+e(x.name)+'</strong> · grade '+x.grade+' · '+x.ovr+' OVR · '+e(level)+
      '<p class="muted">Rapport '+m.rapport+'/100 · Competitive edge '+m.competitiveness+'/100 · '+m.meetings+' interactions'+
      (m.notes.length?' · Last: '+e(m.notes[0].detail):'')+'</p>'+
      '<div class="buttons"><button class="alt" onclick="teamInteraction(\''+e(x.id)+'\',\'film\')">Review film · 2h</button>'+
      '<button class="alt" onclick="teamInteraction(\''+e(x.id)+'\',\'competition\')">Compete · 2h</button>'+
      '<button class="alt" onclick="teamInteraction(\''+e(x.id)+'\',\'encouragement\')">Encourage · 1h</button></div></div>';
  }).join('');
  return panel('Your position room · lasting relationships',
    '<p class="muted">Spend available weekly hours with named teammates. Interactions carry across seasons and are remembered even after graduation. Film and competition can modestly affect coach trust; they do not override ratings or force a start. One visit per player each week.</p>'+
    '<div class="store-grid">'+rows+'</div>');
}
function positionRoomHistory(){
  const mem=game.teammateMemories||{};
  const entries=Object.entries(mem).filter(([,m])=>m.notes?.length).slice(0,30).map(([id,m])=>{
    const n=game.team.find(x=>x.id===id)||game.alumni?.find(x=>x.id===id);
    return '<details><summary>'+e(n?.name||id)+' · rapport '+m.rapport+' · '+m.meetings+' interactions</summary>'+m.notes.slice(0,8).map(z=>'<div class="log">Year '+z.year+' · '+e(z.phase)+' W'+z.week+' · '+e(z.detail)+'</div>').join('')+'</details>';
  }).join('');
  return panel('Position-room memories',entries||'<p class="muted">Your teammate relationships will be recorded here after an interaction.</p>');
}
