/* v0.5 Part 1: persistent same-position cohorts and level-specific depth charts.
   Full 22-player lineups for every school are a later football-simulation update. */
function schoolGen(){return NAMES.map((name,i)=>{let scheme=pick(SCHEMES),classif=R(1,6),prestige=R(25,90);return {id:i,name,classif,prestige,coaching:cl(prestige+R(-21,20),20,95),facilities:cl(prestige+R(-25,23),18,96),scheme:scheme[0],runRate:scheme[1],star:R(20,95),defense:pick(['4-3','3-4','4-2-5','3-3-5','4-4']),coach:pick(['Coach Mason','Coach Brooks','Coach Williams','Coach Rivera','Coach Thompson']),expectations:R(35,90)}})}

function rating(a,p){let keys=GROUPS[p].flatMap(g=>g[2]);return Math.round(keys.reduce((v,k)=>v+(a[k]||35),0)/keys.length)}

function levelsForSchool(school){return school.classif>=4?['Freshman','JV','Varsity']:school.classif>=2?['JV','Varsity']:['Varsity']}

function newNpc(school,pos,grade,id){let attrs={};ATTRS.forEach(k=>{let base=R(30,54)+Math.round((school.prestige-50)/9)+(grade-9)*R(2,4);attrs[k]=cl(base,25,91)});return {id,name:pick(FN)+' '+pick(LN),grade,pos,attrs,ovr:rating(attrs,pos),joinedYear:game?.year||1}}

function createRoster(school,pos){let people=[];for(let grade=9;grade<=12;grade++)for(let i=0;i<5;i++)people.push(newNpc(school,pos,grade,'npc-'+(grade*10+i)));return people}

function initialDraft(){let p={};ATTRS.forEach(k=>p[k]=38);return p}

function makeFreshmen(count=5){let added=[];for(let i=0;i<count;i++){game.nextNpcId=(game.nextNpcId||1000)+1;added.push(newNpc(game.school,game.pos,9,'npc-'+game.nextNpcId))}return added}

function annualRosterTurnover(){
  let departing=game.team.filter(x=>x.grade>=12);
  game.alumni=game.alumni||[];
  game.alumni.push(...departing.map(x=>({...x,graduatedAfterYear:game.year,ovr:rating(x.attrs,x.pos)})));
  let staying=game.team.filter(x=>x.grade<12);
  for(let x of staying){x.grade++;for(let k of ATTRS)x.attrs[k]=cl(x.attrs[k]+R(0,3),20,95);x.ovr=rating(x.attrs,x.pos)}
  game.team=[...staying,...makeFreshmen(5)];
  return {graduates:departing.length,entrants:5,names:departing.map(x=>x.name)};
}

/* Part 7: program-wide position management.  One *primary* squad per athlete,
   plus optional upper-squad dress duty.  Being an upper-squad reserve never
   automatically removes a lower-squad starter's game opportunities.
   Placement is reviewed at the start of each school year and in Fall W6. */
const SQUAD_ORDER=['Freshman','JV','Varsity'];
function placementScore(x){
  // Coach trust is a small, transparent tiebreaker, not a human-player bonus.
  let trust=x.id==='you'?(cl(game.coachTrust,0,100)-50)/50*1.5:0;
  return x.ovr+(x.grade-9)*.35+trust;
}
function squadStamp(){return game.year+'-'+((game.phase===0&&game.week>=6)||game.phase===1||game.phase===2?'midseason':'opening')}
function squadPrefs(){
  if(!game.squadPreference)game.squadPreference='Auto';
  if(typeof game.dualSquad!=='boolean')game.dualSquad=false;
}
function eligibleSquad(level,x,levels){
  return levels.includes(level)&&(level==='Varsity'||(level==='JV'&&x.grade<=11)||(level==='Freshman'&&x.grade===9));
}
function computePlacement(){
  squadPrefs();
  const levels=levelsForSchool(game.school);
  const roster=[{id:'you',name:game.name,grade:game.grade,pos:game.pos,attrs:game.attrs,ovr:rating(game.attrs,game.pos)},...game.team.map(x=>({...x,ovr:rating(x.attrs,x.pos)}))];
  const score=x=>placementScore(x),ranked=roster.slice().sort((a,b)=>score(b)-score(a)||String(a.id).localeCompare(String(b.id)));
  const you=roster[0],desired=game.squadPreference,primary={},starter={};
  // Normal homes: grade 12 varsity; grades 10–11 JV; grade 9 freshman.
  const home=x=>x.grade===12||levels.length===1?'Varsity':x.grade===9&&levels.includes('Freshman')?'Freshman':levels.includes('JV')?'JV':'Varsity';
  roster.forEach(x=>primary[x.id]=home(x));
  let accepted=desired==='Auto'?'Automatic coach placement':desired+' requested';
  if(desired!=='Auto'){
    if(!eligibleSquad(desired,you,levels)){
      accepted=desired+' request unavailable for your grade and school classification';
    }else if(desired==='Varsity'&&game.grade<12){
      const varsityCandidates=ranked.filter(x=>x.grade>=10||x.ovr>=ranked.find(r=>r.grade===12)?.ovr+6);
      const top=varsityCandidates[0]||ranked[0];
      if(score(you)<score(top)-12){accepted='Varsity request declined: below the readiness range';}
      else{primary.you='Varsity';accepted='Varsity request accepted: compete for the depth chart';}
    }else if(desired==='JV'&&game.grade===9){
      let typical=ranked.find(x=>x.grade===10)||ranked[0];
      if(score(you)<score(typical)-10)accepted='JV request declined: coach recommends freshman development';
      else {primary.you='JV';accepted='JV request accepted: compete for the depth chart';}
    }else{primary.you=desired;accepted=desired+' request accepted';}
  }
  // Higher-squad starters are chosen on football evaluation, not by who is
  // player-controlled.  A request to stay lower removes that athlete from
  // upper-squad STARTER selection; he can still dress as a reserve.
  const seekingLower=x=>x.id==='you'&&desired!=='Auto'&&primary.you!== 'Varsity';
  const vCandidates=ranked.filter(x=>!seekingLower(x)&&
     (x.grade>=10||(!levels.includes('JV')&&!levels.includes('Freshman'))||
      (x.grade===9&&score(x)>=score(ranked.find(y=>y.grade===12)||x)+6)));
  const vStarter=vCandidates[0]||ranked[0];
  primary[vStarter.id]='Varsity';starter.Varsity=vStarter.id;
  if(levels.includes('JV')){
    let jCandidates=ranked.filter(x=>x.id!==vStarter.id&&x.grade<=11&&
      !(x.id==='you'&&((desired==='Freshman'&&primary.you==='Freshman')||(desired==='Varsity'&&primary.you==='Varsity')))&&
      (x.grade>=10||primary[x.id]==='JV'||
         (x.grade===9&&score(x)>score(ranked.find(y=>y.grade===10)||x)+5)));
    const jStarter=jCandidates[0];
    if(jStarter){primary[jStarter.id]='JV';starter.JV=jStarter.id;}
  }
  if(levels.includes('Freshman')){
    const fStarter=ranked.find(x=>x.grade===9&&primary[x.id]==='Freshman');
    if(fStarter)starter.Freshman=fStarter.id;
  }
  // A requested upper-squad role doesn't guarantee starting. Keep a senior
  // on Varsity even if the program has a much better younger starter.
  const squads={Freshman:[],JV:[],Varsity:[]};
  for(const x of roster)squads[primary[x.id]].push(x);
  for(const l of SQUAD_ORDER)squads[l].sort((a,b)=>
    (a.id===starter[l]?-1:0)-(b.id===starter[l]?-1:0)||score(b)-score(a));
  const dressed={Freshman:[],JV:[],Varsity:[]};
  for(let i=1;i<levels.length;i++){
    const upper=levels[i],lower=levels[i-1];
    const options=squads[lower].filter(x=>eligibleSquad(upper,x,levels)&&
      (x.id!=='you'||game.dualSquad));
    // Best lower-squad players can cover higher-squad depth without losing
    // their actual lower-squad starts. A player must opt into their own dual duty.
    dressed[upper]=options.sort((a,b)=>score(b)-score(a)).slice(0,2).map(x=>x.id);
  }
  if(levels.includes('Varsity')&&levels.includes('Freshman')){
    // Exceptional freshman JV starter can be a varsity emergency backup only
    // with explicit opt-in; no hidden triple-duty assignment.
    dressed.Varsity=dressed.Varsity.filter(id=>!dressed.JV.includes(id));
  }
  const myLevel=primary.you;
  let myRank=squads[myLevel].findIndex(x=>x.id==='you')+1;
  const vAbove=squads.Varsity[0];
  const explanation=myLevel==='Varsity'&&myRank>1?
    'Coach rates '+vAbove.name+' ('+vAbove.ovr+' OVR) above you for Varsity starter. Coach trust can only break close evaluations.':
    myRank===1?'You currently lead the '+myLevel+' depth chart on evaluated ability and coach trust.':
    'Your '+myLevel+' role is based on the current position evaluation; a higher OVR can outrank you.';
  return {year:game.year,stamp:squadStamp(),primary,starter,dressed,decision:accepted,explanation,reviewWeek:game.week};
}
function squadState(){
  if(!game)return null;
  if(!game.placement||game.placement.stamp!==squadStamp()||game.placement.year!==game.year){
    const previous=game.placement;
    game.placement=computePlacement();
    if(previous&&previous.year===game.year&&previous.stamp!==game.placement.stamp){
      game.history=game.history||[];
      game.history.unshift({title:'Year '+game.year+' · Midseason depth-chart review',text:'Coaches reassessed starters and upper-squad backup roles across the program. Check Team for your placement.'});
    }
  }
  return game.placement;
}
function depth(){
  let p=squadState(),levels=levelsForSchool(game.school);
  const rows=[{id:'you',name:game.name,grade:game.grade,pos:game.pos,ovr:rating(game.attrs,game.pos)},...game.team.map(x=>({...x,ovr:rating(x.attrs,x.pos)}))];
  const squads={Freshman:[],JV:[],Varsity:[]};
  for(const x of rows)squads[p.primary[x.id]||'Varsity'].push(x);
  for(const l of SQUAD_ORDER)squads[l].sort((a,b)=>
    (a.id===p.starter[l]?-1:0)-(b.id===p.starter[l]?-1:0)||placementScore(b)-placementScore(a));
  const level=p.primary.you||'Varsity',all=squads[level],rank=all.findIndex(x=>x.id==='you')+1;
  const role=rank===1?'Starter':rank===2?'Rotation':rank<=4?'Backup':'Reserve';
  let dressLevel=levels.find(l=>p.dressed[l]?.includes('you'))||null;
  return {all,rank,level,role,squads,levels,allPlayers:rows.slice().sort((a,b)=>placementScore(b)-placementScore(a)),
    starters:p.starter,dressed:p.dressed,dressLevel,decision:p.decision,explanation:p.explanation};
}
function setSquadPreference(level){
  if(!game||game.gamePending){feedback='Finish the pending game before changing your squad request.';render();return}
  if(!['Auto','Freshman','JV','Varsity'].includes(level))return;
  game.squadPreference=level;game.placement=null;
  const d=depth();note('Squad preference updated: '+level+'. '+d.decision+'. Current assignment: '+d.level+' '+d.role+'.');persist();render();
}
function setDualSquad(enabled){
  if(!game||game.gamePending){feedback='Finish the pending game before changing dual-squad duty.';render();return}
  game.dualSquad=Boolean(enabled);game.placement=null;
  const d=depth();note('Higher-squad backup duty '+(game.dualSquad?'requested':'declined')+'. '+(d.dressLevel?'Approved to dress for '+d.dressLevel+' while playing for '+d.level+'.':'No qualifying higher-squad backup opening currently.'));
  persist();render();
}

let schools=schoolGen();
draft.points=initialDraft();
