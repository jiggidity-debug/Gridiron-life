/* v0.5 Part 2: v4 -> v5 save migration. Original v4 localStorage remains untouched. */
function persist(){if(game){game.version=6;localStorage.setItem(KEY,JSON.stringify(game))}}
function note(t){if(game){game.history.unshift({title:'Year '+game.year+' · '+PHASES[game.phase].name+' W'+game.week,text:t});game.history=game.history.slice(0,150)}feedback=t}
function upgradeFromV4(old){
  game=old;
  game.version=6;
  game.history=game.history||[];game.games=game.games||[];
  game.school=game.school||schools[0];game.schools=game.schools||schools;
  schools=game.schools;
  game.plan=game.plan||{training:7,study:6,work:0,social:4,recovery:6};
  game.team=game.team||createRoster(game.school,game.pos);
  repairSeasonData();
  academicState();socialState();healthState();awardsState();summerState();squadPrefs();profileState();
  // In legacy v4 the next grade was applied at the END of preseason, not spring.
  if(game.phase===3||game.phase===4){archiveFootballSeason();startNextSchoolYear();}
  // No previous student roster histories exist in v4; we cannot know which grade-12
  // students were formerly 11th graders. They will rotate out at the next rollover.
  game.history.unshift({title:'v0.5 migration',text:'Imported v0.4 save. The previous browser save remains intact. Current-season record reconstructed from available game logs; earlier unsaved squad results cannot be recovered.'});
  persist();
}
function migrate(){
  if(game)return;
  const raw5=localStorage.getItem('gridiron-life-v5');
  if(raw5&&!localStorage.getItem('gridiron-life-v6-migrated')){try{const old=JSON.parse(raw5);if(old&&[5,6].includes(old.version)&&old.attrs){game=old;game.version=6;schools=old.schools||schools;localStorage.setItem('gridiron-life-v6-migrated','1');persist();return}}catch(err){console.warn('v0.591 import failed',err)}}
  const raw4=localStorage.getItem(PREVIOUS);
  if(raw4){try{const g=JSON.parse(raw4);if(g?.version===4&&g.attrs){upgradeFromV4(g);return}}catch(err){console.warn('v4 migration failed',err)}}
  const rawOld=localStorage.getItem(OLD);
  if(!rawOld)return;
  try{
    const o=JSON.parse(rawOld);if(!o||!o.attrs)return;
    let a={};ATTRS.forEach(k=>a[k]=cl(Math.round(o.attrs[k]??o.attrs.speed??38),20,90));
    let si=0,school=schools[si],pos=GROUPS[o.pos]?o.pos:'RB';
    game={version:6,name:o.name||'Jordan Carter',pos,bg:o.bg||'working',school,schools,grade:o.grade||9,phase:0,week:cl(o.week||1,1,12),day:0,year:1,attrs:a,progress:Object.fromEntries(ATTRS.map(k=>[k,0])),iq:o.intelligence||50,behavior:o.discipline||50,height:69,weight:165,physicalType:pick(['early','average','late']),money:o.money||60,familyExpect:10,morale:o.morale||70,stress:12,fatigue:cl(o.fatigue||3,0,100),gpa:o.gpa||3,coachTrust:o.coachTrust||40,relationship:o.friendship||50,team:createRoster(school,pos),plan:{training:7,study:6,work:0,social:4,recovery:6},focus:Object.fromEntries(GROUPS[pos].map(g=>[g[0],0])),teamIntensity:2,extraIntensity:2,job:null,injury:null,gamePending:false,scheduledEvent:null,record:[0,0],squadRecords:emptySquadRecords(),programRecord:[0,0],seasonHistory:[],alumni:[],nextNpcId:1000,schedule:[],games:[],history:[{title:'Legacy career imported',text:'Older season game details may not map perfectly to the new simulation.'}],eventLog:[],yearWeeks:0,saveBackups:[],eventCount:0};
    game.focus[GROUPS[pos][0][0]]=7;game.schedule=createSchedule();note('Imported older career and created a new school football roster.');persist();
  }catch(err){console.warn(err)}
}
function exportSave(){let blob=new Blob([JSON.stringify(game,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='gridiron-life-v060-save.json';a.click();URL.revokeObjectURL(a.href)}
function importSave(el){let file=el.files?.[0];if(!file)return;let r=new FileReader();r.onload=()=>{try{let g=JSON.parse(r.result);if(![4,5,6].includes(g.version)||!g.attrs||!g.plan)throw Error('Unsupported save');if(g.version===4)upgradeFromV4(g);else{game=g;schools=g.schools||schools;if(!game.squadRecords||!game.schedule)repairSeasonData();healthState();competitionState();awardsState();summerState();squadPrefs();profileState();persist()}render()}catch(err){alert('Could not import: '+err.message)}};r.readAsText(file)}

function resetV5(){if(confirm('Reset this v0.5 career? Export your save first.')){localStorage.removeItem(KEY);game=null;render()}}
