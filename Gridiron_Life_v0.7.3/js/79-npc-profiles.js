/* v0.601: persistent NPC academics and read-only teammate profiles.
   Scouting details outside the player's team remain outside this system. */
'use strict';
const v601NpcProfileState={id:null,tab:'Attributes'};
function v601Academic(npc){
 if(!npc.academics){
  const p=npc.personality||{},discipline=Number(p.discipline??50),work=Number(p.workEthic??50);
  npc.academics={gpa:cl(Math.round((2.35+(discipline-50)*.008+(work-50)*.005+R(-75,75)/100)*100)/100,.6,4),weeks:0,history:[]};
 }
 return npc.academics;
}
function v601UpdateAcademics(){
 if(!game?.team?.length||['college','collegeComplete','nfl','nflEntry'].includes(game.stage))return;
 for(const npc of game.team){
  const a=v601Academic(npc),p=npc.personality||{};
  const work=Number(p.workEthic??50),discipline=Number(p.discipline??50);
  // Academics are distinct from football dedication. Steady effort matters,
  // but random setbacks and recovery prevent GPA from being predetermined.
  const drift=(discipline-50)*.00013+(work-50)*.00007+(Math.random()-.5)*.065;
  a.gpa=cl(Math.round((a.gpa+drift)*100)/100,0,4);
  a.weeks=(a.weeks||0)+1;
 }
}
function v601OpenPlayer(id){
 if(!game)return;
 if(id==='you'){v6Change('Player');return;}
 const player=(game.team||[]).find(n=>String(n.id)===String(id));
 if(!player)return;
 v601Academic(player);
 v601NpcProfileState.id=String(id);v601NpcProfileState.tab='Attributes';
 v6UI.page='Team';v6UI.view='NPC Profile';v6UI.legacy=null;render();
}
function v601NpcLink(n){return '<button type="button" class="npc-name-link" onclick="v601OpenPlayer('+JSON.stringify(String(n.id)).replace(/"/g,'&quot;')+')">'+e(n.name)+'</button>'}
function v601Roster(){
 const d=depth();const levels=levelsForSchool(game.school).slice().reverse();
 return '<div class="v6-detail"><div class="v6-detailhead">'+v6Button('‹ Back',"v6Detail('Overview')",'v6-text')+'<strong>Team Roster</strong><span></span></div>'+
 '<p class="v6-note">Tap any name to inspect that player. The roster covers your position group, not the full team.</p><div class="v601-roster">'+levels.map(level=>{
  const items=d.squads[level]||[];
  return '<div class="v6-surface"><h3>'+e(level)+'</h3>'+items.map((n,i)=>'<div class="v601-roster-row"><span><small>#'+(i+1)+' · '+e(n.grade)+'th</small>'+v601NpcLink(n)+'</span><strong>'+n.ovr+' OVR</strong></div>').join('')+'</div>';
 }).join('')+'</div></div>';
}
function v601NpcProfile(){
 const npc=(game.team||[]).find(n=>String(n.id)===v601NpcProfileState.id);
 if(!npc)return '<div class="v6-detail">'+v6Button('‹ Roster',"v6Detail('Roster')",'v6-text')+'<p>Player no longer on this roster.</p></div>';
 const a=v601Academic(npc),p=npc.personality||{},values=npc.attrs||{};
 const personLabels=[['Discipline','discipline'],['Work Ethic','workEthic'],['Sociability','sociability'],['Playfulness','playfulness'],['Competitiveness','competitiveness'],['Curiosity','curiosity'],['Coachability','coachability']];
 const groups=[['Athletic',[['SPD','speed'],['ACC','accel'],['AGI','agility'],['PWR','power'],['END','endurance']]],['Football Skills',GROUPS[npc.pos].flatMap(g=>g[2]).filter((x,i,arr)=>arr.indexOf(x)===i).map(k=>[k.slice(0,3).toUpperCase(),k])]];
 const tabs=['Attributes','Skills','Personality','Academics','Development'];
 const tab=v601NpcProfileState.tab;
 const tabsHtml='<div class="v601-tabs">'+tabs.map(t=>'<button class="'+(tab===t?'active':'')+'" onclick="v601NpcTab(\''+t+'\')">'+t+'</button>').join('')+'</div>';
 let body='';
 if(tab==='Attributes')body=groups.map(([name,fields])=>'<div class="v6-statgroup"><h3>'+e(name)+'</h3><div class="v6-attrgrid">'+fields.map(([short,k])=>'<span title="'+e(k)+'"><small>'+e(short)+'</small><strong>'+Math.round(Number(values[k]??0))+'</strong></span>').join('')+'</div></div>').join('');
 else if(tab==='Skills'){
  const roleGroups=npc.pos==='RB'?[['Ball Carrier',['elusiveness','vision','carrying','power']],['Receiving',['catching','blocking','agility']],['Blocking',['blocking','power','endurance']]]:[['Position Skills',GROUPS[npc.pos].flatMap(g=>g[2])]];
  body=roleGroups.map(([name,keys])=>'<div class="v6-statgroup"><h3>'+e(name)+'</h3><div class="v6-attrgrid">'+keys.map(k=>'<span><small>'+e(k.slice(0,3).toUpperCase())+'</small><strong>'+Math.round(Number(values[k]??0))+'</strong></span>').join('')+'</div></div>').join('')+'<p class="v6-note">These are observable position attributes. Individual technique mastery, badges, and detailed scheme knowledge are not yet simulated for NPCs.</p>';
 }
 else if(tab==='Personality')body='<div class="v6-personality-grid">'+personLabels.map(([name,key])=>'<div><small>'+e(name)+'</small><strong>'+Math.round(Number(p[key]??50))+'</strong></div>').join('')+'</div><p class="v6-note">Personality describes tendencies, not a fixed potential ceiling.</p>';
 else if(tab==='Academics')body='<div class="v6-surface"><div class="v6-triplet"><div><small>Current GPA</small><strong>'+a.gpa.toFixed(2)+'</strong></div><div><small>Division I core GPA*</small><strong>2.30</strong></div><div><small>Division II core GPA*</small><strong>2.20</strong></div></div><p class="v6-note">'+(a.gpa<2.2?'Academic risk — grade improvement needed.':a.gpa<2.3?'Below D1 GPA threshold; other pathways may remain open.':'GPA is on track, subject to coursework and admission rules.')+'</p><small>*Displayed GPA is overall school GPA. NCAA qualification also depends on approved core-course GPA and coursework; this is a preliminary game estimate, not certification.</small></div>'+(a.history?.length?'<div class="v6-surface"><strong>Previous years</strong>'+a.history.map(h=>'<p>Grade '+h.grade+': '+h.gpa.toFixed(2)+'</p>').join('')+'</div>':'');
 else {const d=npc.development||{};body='<div class="v6-surface"><div class="v6-triplet"><div><small>Current OVR</small><strong>'+rating(values,npc.pos)+'</strong></div><div><small>Team sessions</small><strong>'+Math.round(d.mandatorySessions||0)+'</strong></div><div><small>Extra sessions</small><strong>'+Math.round(d.extraSessions||0)+'</strong></div></div><p>Football background: '+e(npc.experience||'Not recorded')+'</p><p class="v6-note">Team training and physical maturation contribute to development. Extra work is voluntary. Future ability is not a guaranteed ceiling.</p></div>'}
 return '<div class="v6-detail"><div class="v6-detailhead">'+v6Button('‹ Roster',"v6Detail('Roster')",'v6-text')+'<strong>Player Profile</strong><span></span></div><div class="v601-npc-head"><strong>'+e(npc.name)+'</strong><span>'+e(npc.pos)+' · Grade '+npc.grade+' · '+rating(values,npc.pos)+' OVR</span></div>'+tabsHtml+body+'</div>';
}
function v601NpcTab(t){v601NpcProfileState.tab=t;render()}
const v601PriorTeam=v6Team;
v6Team=function(){
 if(v6UI.view==='Roster')return v601Roster();
 if(v6UI.view==='NPC Profile')return v601NpcProfile();
 const source=v601PriorTeam();
 if(!game.team?.length||['nfl','nflEntry','college','collegeComplete'].includes(game.stage))return source;
 const d=depth();const row=d.squads[d.level]||[];
 const teaser='<div class="v6-surface"><strong>Your Position Room</strong>'+row.slice(0,5).map(n=>'<div class="v601-roster-row"><span>'+v601NpcLink(n)+'</span><strong>'+n.ovr+' OVR</strong></div>').join('')+v6Button('View Full Roster',"v6Detail('Roster')",'v6-stroked')+'</div>';
 const end=source.lastIndexOf('</div>');return end>=0?source.slice(0,end)+teaser+source.slice(end):source+teaser;
};
