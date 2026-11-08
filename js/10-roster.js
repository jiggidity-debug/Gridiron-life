/* v0.5 Part 1: persistent same-position cohorts and level-specific depth charts.
   Full 22-player lineups for every school are a later football-simulation update. */
function schoolGen(){
  const extra=['Silver Creek Falcons','Mesa Ridge Coyotes','Riverbend Wildcats','Copper Hill Bulldogs','Lone Star Stallions','Golden Prairie Buffaloes','Clearwater Mariners','Ironwood Rams','Southpoint Panthers','Cypress Bend Cardinals','Desert Springs Scorpions','Pecan Valley Bobcats','Harbor Ridge Vikings','Canyon Creek Thunder','Baywood Gators','Pioneer Valley Hornets','Willow Brook Warriors','Pine Ridge Tigers','East Mesa Mustangs','Granite Hills Hawks','River Oaks Lions','Crossroads Knights','Bluewater Dolphins','Redwood Cougars','Timberline Wolves','Lakecrest Eagles'];
  const names=[...NAMES,...extra];
  const result=names.map((name,i)=>{let scheme=pick(SCHEMES),classif=i%6+1,prestige=R(25,81);return {id:i,name,classif,prestige,coaching:cl(prestige+R(-16,18),20,92),facilities:cl(prestige+R(-18,20),18,92),scheme:scheme[0],runRate:scheme[1],star:R(20,85),defense:pick(['4-3','3-4','4-2-5','3-3-5','4-4']),coach:pick(['Coach Mason','Coach Brooks','Coach Williams','Coach Rivera','Coach Thompson']),expectations:R(35,85)}});
  const prepNames=['National Summit Prep','Atlantic Football Academy','Blue Ridge Preparatory','Frontier Elite Academy'];
  prepNames.forEach((name,i)=>{let scheme=SCHEMES[(i+2)%SCHEMES.length];result.push({id:result.length,name,classif:6,prep:true,prestige:85+i*3,coaching:88+i*2,facilities:89+i*2,scheme:scheme[0],runRate:scheme[1],star:88+i*2,defense:'4-2-5',coach:['Coach Jefferson','Coach Coleman','Coach Ramirez','Coach Taylor'][i],expectations:90+i*2});});
  return result;
}

// Position OVR for the player's modern Part 9 skill system. This affects displayed
// positional fit, depth-chart comparisons and existing OVR consumers; the detailed
// play-by-play football simulation is a separate, currently paused feature.
// Each positional profile weights physical tools differently, then combines them
// with football-specific technical ability. NPCs retain the established legacy OVR.
const POSITION_OVR_PROFILES={
 QB:{physical:{strength:1,accel:1,speed:1,agility:1,stamina:1},skills:{throwPower:3,shortAccuracy:4,deepAccuracy:2,decisionMaking:4,pocketPresence:3,ballHandling:1},physicalShare:.24},
 RB:{physical:{speed:4,accel:4,agility:3,strength:2,stamina:2,jumping:1},skills:{vision:4,elusiveness:3,carrying:3,breakTackle:3,ballHandling:2,catching:1},physicalShare:.45},
 FB:{physical:{strength:5,stamina:3,accel:2,agility:1,speed:1,jumping:1},skills:{runBlocking:4,blockTechnique:3,carrying:2,vision:2,breakTackle:2,catching:1},physicalShare:.43},
 WR:{physical:{speed:4,accel:4,agility:3,jumping:3,stamina:1,strength:1},skills:{catching:4,routes:4,release:3,ballHandling:1,carrying:1},physicalShare:.43},
 TE:{physical:{strength:3,speed:2,accel:2,jumping:2,stamina:2,agility:1},skills:{catching:3,routes:2,runBlocking:3,passBlocking:3,release:2,blockTechnique:2},physicalShare:.38},
 LT:{physical:{strength:5,agility:3,accel:2,stamina:3,jumping:1},skills:{passBlocking:5,runBlocking:3,blockTechnique:4,blockRecognition:4},physicalShare:.36},
 RT:{physical:{strength:5,agility:2,accel:2,stamina:3,jumping:1},skills:{runBlocking:4,passBlocking:4,blockTechnique:4,blockRecognition:3},physicalShare:.37},
 LG:{physical:{strength:5,accel:3,agility:2,stamina:3,jumping:1},skills:{runBlocking:5,passBlocking:3,blockTechnique:4,blockRecognition:3},physicalShare:.39},
 RG:{physical:{strength:5,accel:3,agility:2,stamina:3,jumping:1},skills:{runBlocking:5,passBlocking:3,blockTechnique:4,blockRecognition:3},physicalShare:.39},
 C:{physical:{strength:5,stamina:3,agility:2,accel:1,jumping:1},skills:{blockRecognition:5,blockTechnique:4,runBlocking:4,passBlocking:3},physicalShare:.35},
 DE:{physical:{strength:4,accel:3,speed:2,agility:2,stamina:2,jumping:1},skills:{passRush:5,blockShedding:4,runDefense:3,tackling:3},physicalShare:.43},
 DT:{physical:{strength:6,accel:2,stamina:3,agility:1,speed:1},skills:{runDefense:5,blockShedding:5,passRush:3,tackling:2},physicalShare:.45},
 NT:{physical:{strength:7,stamina:3,accel:1,agility:1},skills:{runDefense:5,blockShedding:5,tackling:3,passRush:2},physicalShare:.47},
 OLB:{physical:{speed:3,accel:3,agility:2,strength:3,stamina:2,jumping:1},skills:{tackling:3,runDefense:3,passRush:3,manCoverage:2,zoneCoverage:2,playRecognition:2},physicalShare:.43},
 ILB:{physical:{strength:4,accel:3,stamina:3,agility:2,speed:1},skills:{tackling:4,runDefense:4,playRecognition:3,zoneCoverage:2,blockShedding:2},physicalShare:.42},
 MLB:{physical:{strength:4,stamina:3,accel:3,agility:2,speed:1},skills:{tackling:4,runDefense:4,playRecognition:4,zoneCoverage:2,blockShedding:1},physicalShare:.42},
 CB:{physical:{speed:5,accel:5,agility:4,jumping:2,stamina:1,strength:1},skills:{manCoverage:5,pressCoverage:3,zoneCoverage:2,ballSkills:3,catching:2,playRecognition:2},physicalShare:.47},
 FS:{physical:{speed:4,accel:3,agility:3,jumping:3,stamina:2,strength:1},skills:{zoneCoverage:5,playRecognition:4,ballSkills:3,tackling:2,catching:2,manCoverage:1},physicalShare:.43},
 SS:{physical:{strength:3,speed:3,accel:3,agility:2,jumping:2,stamina:2},skills:{tackling:4,zoneCoverage:3,playRecognition:3,runDefense:2,ballSkills:2,manCoverage:2},physicalShare:.43},
 K:{physical:{strength:3,agility:2,stamina:2,accel:1},skills:{kickPower:5,kickAccuracy:6,decisionMaking:1},physicalShare:.27},
 P:{physical:{strength:2,agility:2,stamina:2,accel:1},skills:{kickPower:3,kickAccuracy:2,puntTechnique:7},physicalShare:.26},
 LS:{physical:{strength:3,agility:2,stamina:2,accel:1},skills:{blockTechnique:4,blockRecognition:3,passBlocking:3,ballHandling:3},physicalShare:.32}
};
function weightedAttributeMean(values,weights){
 let numerator=0,denominator=0;
 for(const [key,w] of Object.entries(weights)){numerator+=Math.max(0,Math.min(99,Number(values?.[key])||0))*w;denominator+=w}
 return denominator?numerator/denominator:0;
}
function playerPositionOvr(pos,athletic,technical){
 const profile=POSITION_OVR_PROFILES[pos]||POSITION_OVR_PROFILES.RB;
 const physical=weightedAttributeMean(athletic,profile.physical);
 const skill=weightedAttributeMean(technical,profile.skills);
 return cl(Math.round(physical*profile.physicalShare+skill*(1-profile.physicalShare)),0,99);
}
function rating(a,p){
 if(game&&a===game.attrs&&game.athleticAttributes&&game.technicalAttributes)return playerPositionOvr(p,game.athleticAttributes,game.technicalAttributes);
 const keys=GROUPS[p].flatMap(g=>g[2]);return Math.round(keys.reduce((v,k)=>v+(a[k]??35),0)/keys.length);
}

function levelsForSchool(school){return school.classif>=4?['Freshman','JV','Varsity']:school.classif>=2?['JV','Varsity']:['Varsity']}

/* v0.601 NPC generation: freshmen use the same 0-99 scale as the player.
   20-45 is the freshman POSitional OVR range, not an individual-attribute cap.
   Discretionary football work is unusual; organized team practice is universal. */
const NPC_COMMITMENT=[['casual',60],['occasional',30],['dedicated',9],['obsessed',1]];
function npcCommitmentRoll(){let r=R(1,100);for(const [kind,pct] of NPC_COMMITMENT){r-=pct;if(r<=0)return kind}return 'casual'}
function npcPersonality(kind){
 const level={casual:35,occasional:52,dedicated:78,obsessed:93}[kind]||35;
 return {discipline:cl(level+R(-22,18),5,99),workEthic:cl(level+R(-16,16),5,99),coachability:R(20,95),competitiveness:R(20,98),curiosity:R(20,95),sociability:R(20,98),playfulness:R(20,98)};
}
function npcBuildFreshman(school,pos,id){
 const commitment=npcCommitmentRoll(),personality=npcPersonality(commitment);
 // Gifted raw measurables are independent of commitment to extra training.
 const gifted=Math.random()<.13,experience=pick(['none','recreation','school','youth']);
 const base=R(22,41)+Math.round(((school?.coaching||50)-50)/35)+({none:-2,recreation:0,school:2,youth:3}[experience]||0);
 const target=cl(base+(gifted?R(1,4):0),20,45);
 const attrs={};
 const physicalKeys=['speed','accel','agility','power','endurance'];
 ATTRS.forEach(k=>{const phys=physicalKeys.includes(k);const aptitude=gifted&&phys?R(7,19):0;
   attrs[k]=cl(target+R(-10,10)+aptitude+(phys?R(-2,2):0),8,75);
 });
 // Bring the actual weighted legacy OVR into range without flattening the gifts/weaknesses.
 let current=rating(attrs,pos),iterations=0;
 while((current<20||current>45)&&iterations++<35){const delta=current<20?1:-1;
   for(const k of GROUPS[pos].flatMap(g=>g[2]))attrs[k]=cl(attrs[k]+delta,8,75);
   current=rating(attrs,pos);
 }
 return {id,name:pick(FN)+' '+pick(LN),grade:9,pos,attrs,ovr:current,joinedYear:game?.year||1,
  experience,commitment,personality,gifted,academics:{gpa:cl(Math.round((2.35+(personality.discipline-50)*.008+(personality.workEthic-50)*.005+R(-75,75)/100)*100)/100,0.6,4),weeks:0,history:[]},development:{progress:{},weeks:0,extraSessions:0,mandatorySessions:0}};
}
function newNpc(school,pos,grade,id){
 const npc=npcBuildFreshman(school,pos,id);
 // Older inaugural cohorts grew through an abbreviated modeled history, not +3/attr/year.
 for(let year=9;year<grade;year++){npcFinishYear(npc,school,true);if(npc.academics)npc.academics.history.push({grade:year,gpa:npc.academics.gpa});}
 npc.grade=grade;npc.ovr=rating(npc.attrs,npc.pos);
 return npc;
}
function npcFinishYear(npc,school,initial=false){
 if(!npc.development)npc.development={progress:{},weeks:0,extraSessions:0,mandatorySessions:0};
 // Maturation improves a limited number of physical traits, not every attribute.
 let maturity=R(0,2)+(npc.gifted&&Math.random()<.25?1:0);
 const tools=['speed','accel','agility','power','endurance'];
 for(let j=0;j<maturity;j++){
  const k=pick(tools);npc.attrs[k]=cl((npc.attrs[k]||25)+1,0,99);
 }
 if(initial){
  // Approximate past team-practice exposure in a way that keeps starting seniors credible.
  const keys=GROUPS[npc.pos].flatMap(g=>g[2]);
  const gains=npc.commitment==='obsessed'?R(3,6):npc.commitment==='dedicated'?R(2,5):npc.commitment==='occasional'?R(1,3):R(0,2);
  for(let j=0;j<gains;j++){const k=pick(keys);npc.attrs[k]=cl(npc.attrs[k]+1,0,99)}
 }
 npc.ovr=rating(npc.attrs,npc.pos);
}
function npcDevelopWeek(school){
 if(!game?.team?.length||game.stage==='college'||game.stage==='nfl')return;
 const phase=PHASES[game.phase],teamHours=phase?.teamHours||0;
 for(const npc of game.team){
  const d=npc.development||(npc.development={progress:{},weeks:0,extraSessions:0,mandatorySessions:0});
  d.weeks++;
  const traits=npc.personality||(npc.personality=npcPersonality(npc.commitment||'casual'));
  const commitment=npc.commitment||'casual';
  // More than 90% of NPCs do not train independently on a regular schedule.
  const extraChance={casual:.015,occasional:.09,dedicated:.62,obsessed:.94}[commitment]??.015;
  const extra=Math.random()<extraChance;
  if(extra)d.extraSessions++;
  if(teamHours>0)d.mandatorySessions++;
  // Most gains are incremental. Practice and reps do not guarantee a rating point.
  const coaching=cl((school?.coaching||55)/65,.65,1.35);
  const effort=cl(.65+traits.workEthic/230+traits.coachability/300,.65,1.35);
  const keys=GROUPS[npc.pos].flatMap(g=>g[2]);
  const selected=pick(keys);
  let gain=(teamHours>0?.22:0)+(extra?.90:0);
  gain*=coaching*effort*cl((105-(npc.attrs[selected]||40))/80,.12,1.25);
  d.progress[selected]=(d.progress[selected]||0)+gain;
  while(d.progress[selected]>=1&&npc.attrs[selected]<99){npc.attrs[selected]++;d.progress[selected]--}
  npc.ovr=rating(npc.attrs,npc.pos);
 }
}

function positionRoomPerGrade(school){
 const cls=Number(school?.classif)||3;
 return ({1:1,2:2,3:2,4:3,5:4,6:5})[cls]||3;
}
function createRoster(school,pos){let people=[],n=positionRoomPerGrade(school);for(let grade=9;grade<=12;grade++)for(let i=0;i<n;i++)people.push(newNpc(school,pos,grade,'npc-'+(grade*10+i)));return people}

function initialDraft(){let p={};ATTRS.forEach(k=>p[k]=38);return p}

function makeFreshmen(count=positionRoomPerGrade(game.school)){let added=[];for(let i=0;i<count;i++){game.nextNpcId=(game.nextNpcId||1000)+1;added.push(newNpc(game.school,game.pos,9,'npc-'+game.nextNpcId))}return added}

function annualRosterTurnover(){
  let departing=game.team.filter(x=>x.grade>=12);
  game.alumni=game.alumni||[];
  game.alumni.push(...departing.map(x=>({...x,graduatedAfterYear:game.year,ovr:rating(x.attrs,x.pos)})));
  let staying=game.team.filter(x=>x.grade<12);
  for(let x of staying){npcFinishYear(x,game.school);x.grade++;x.ovr=rating(x.attrs,x.pos)}
  game.team=[...staying,...makeFreshmen(positionRoomPerGrade(game.school))];
  return {graduates:departing.length,entrants:positionRoomPerGrade(game.school),names:departing.map(x=>x.name)};
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
