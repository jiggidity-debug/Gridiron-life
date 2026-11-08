/* v0.603 history repair: stage-specific stats and archive across the full career.
   Reads existing stored games; never migrates or overwrites historical statistics. */
'use strict';
let v603HistoryStage='All';
function v603HistorySetStage(stage){if(!['All','High School','College','NFL'].includes(stage))return;v603HistoryStage=stage;render();}
function v603HistorySources(){
 const c=game?.college||{},n=game?.v6?.nfl||{};
 return [
  {name:'High School',games:Array.isArray(game?.games)?game.games:[],years:Array.isArray(game?.seasonHistory)?game.seasonHistory:[]},
  {name:'College',games:Array.isArray(c.games)?c.games:[],years:Array.isArray(c.yearHistory)?c.yearHistory:[]},
  {name:'NFL',games:Array.isArray(n.games)?n.games:[],years:Array.isArray(n.seasonHistory)?n.seasonHistory:[]}
 ];
}
function v603HistorySeasonSummary(source){
 const years=source.years.slice().sort((a,b)=>Number(b.year)-Number(a.year));
 if(!years.length)return '<p>No completed seasons in this stage.</p>';
 return years.map(s=>{
  const label=source.name==='High School'?'Grade '+s.grade:source.name==='College'?(s.program||'College program'):(s.team||'NFL team');
  const record=Array.isArray(s.record)?s.record.join('–'):source.name==='High School'?Object.entries(s.records||{}).map(([k,v])=>k+': '+v.join('–')).join(' · '):'Record unavailable';
  const postseason=source.name==='High School'?(s.postseason?.status||''):source.name==='College'?(s.postseason||''):(s.status||'');
  return '<div class="log"><strong>'+e(source.name+' · Year '+s.year+' · '+label)+'</strong><br>'+e(record)+(postseason?' · '+e(String(postseason)):'')+'</div>';
 }).join('');
}
function v603HistoryGameLog(source){
 if(!source.games.length)return '<p>No games recorded in this stage.</p>';
 return source.games.slice().reverse().map(g=>{
  const result=(g.win?'W':'L')+' '+(g.score??'?')+'–'+(g.opp??'?');
  const label=source.name+' · Year '+g.year+' Week '+g.week+' · '+(g.opponentName||'Opponent')+' · '+result;
  const desc=typeof gameStatsDescription==='function'?gameStatsDescription(g,game.pos):'';
  const plays=(Array.isArray(g.plays)?g.plays:[]).map(t=>'<div class="log">'+e(String(t))+'</div>').join('');
  return '<details><summary>'+e(label)+'</summary><p>'+desc+'</p>'+(g.role?'<p>Role: '+e(g.role)+'</p>':'')+plays+'</details><hr>';
 }).join('');
}
function seasonStatsScreen(){
 const sources=v603HistorySources().filter(s=>v603HistoryStage==='All'||v603HistoryStage===s.name);
 return sources.map(s=>panel(s.name+' · Season-by-season statistics',statGrid(s.games,true))).join('');
}
function historyScreen(){
 const sources=v603HistorySources().filter(s=>v603HistoryStage==='All'||v603HistoryStage===s.name);
 const selector='<div class="stat-category-tabs">'+['All','High School','College','NFL'].map(s=>'<button class="'+(s===v603HistoryStage?'active':'alt')+'" onclick="v603HistorySetStage(\''+s+'\')">'+s+'</button>').join('')+'</div>';
 const summary=sources.map(s=>panel(s.name+' · Season records',v603HistorySeasonSummary(s))).join('');
 const games=sources.map(s=>panel(s.name+' · Individual game log',statGrid(s.games,false))+panel(s.name+' · Play-by-play',v603HistoryGameLog(s))).join('');
 const c=game.college||{},n=game.v6?.nfl||{};
 const logs=[...(Array.isArray(game.history)?game.history.map(x=>({title:x.title||'High School',text:x.text||''})):[]),
  ...(Array.isArray(c.history)?c.history.map(x=>({title:'College',text:typeof x==='string'?x:JSON.stringify(x)})):[]),
  ...(Array.isArray(n.history)?n.history.map(x=>({title:'NFL',text:typeof x==='string'?x:JSON.stringify(x)})):[])];
 const journal=logs.slice(0,200).map(x=>'<div class="log"><strong>'+e(x.title)+'</strong><br>'+e(x.text)+'</div>').join('');
 const extras=(v603HistoryStage==='All'||v603HistoryStage==='High School')?awardsHistoryPanel()+summerHistoryPanel()+positionRoomHistory():'';
 const collegeHonors=(v603HistoryStage==='All'||v603HistoryStage==='College')&&typeof v603CollegeHonorsPanel==='function'?v603CollegeHonorsPanel():'';
 return panel('Career history · Level',selector)+panel('Player biography archive','<p>Career records are separated by level. Select a level to view its season statistics and game logs.</p>')+extras+collegeHonors+summary+seasonStatsScreen()+games+panel('Career journal',journal||'<p>No career events recorded yet.</p>')+panel('Save and backup','<p>Export your career before making changes.</p><div class="buttons"><button onclick="exportSave()">Export Save JSON</button><label style="max-width:240px">Import saved JSON<input type="file" accept="application/json" onchange="importSave(this)"></label><button class="alt" onclick="resetV5()">New Career</button></div>');
}
