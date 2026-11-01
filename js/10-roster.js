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

/* Eligible grades: 12th graders play varsity, and freshman squad is only ninth graders.
   Higher-performing ninth graders may be promoted to JV or varsity. */
function depth(){
  const levels=levelsForSchool(game.school),rows=[{id:'you',name:game.name,grade:game.grade,pos:game.pos,ovr:rating(game.attrs,game.pos)},...game.team.map(x=>({...x,ovr:rating(x.attrs,x.pos)}))];
  const strength=x=>x.ovr+(x.id==='you'?game.coachTrust/100*3:0);
  const sorted=rows.slice().sort((a,b)=>strength(b)-strength(a));
  const squads={Freshman:[],JV:[],Varsity:[]},assigned=new Set();
  // Seniors must be on varsity. Reserve additional varsity slots for exceptional younger players.
  const seniors=sorted.filter(x=>x.grade===12);
  const varsityCount=Math.max(6,seniors.length+2);
  for(const x of seniors){squads.Varsity.push(x);assigned.add(x.id)}
  for(const x of sorted){if(squads.Varsity.length>=varsityCount)break;if(!assigned.has(x.id)){squads.Varsity.push(x);assigned.add(x.id)}}
  if(levels.includes('JV')){
    for(const x of sorted){if(squads.JV.length>=7)break;if(!assigned.has(x.id)&&x.grade<=11){squads.JV.push(x);assigned.add(x.id)}}
  }
  for(const x of sorted){if(assigned.has(x.id))continue;let destination=levels.includes('Freshman')&&x.grade===9?'Freshman':levels.includes('JV')&&x.grade<=11?'JV':'Varsity';squads[destination].push(x);assigned.add(x.id)}
  for(const key of Object.keys(squads))squads[key].sort((a,b)=>strength(b)-strength(a));
  const level=levels.find(l=>squads[l].some(x=>x.id==='you'))||'Varsity';
  const all=squads[level],rank=all.findIndex(x=>x.id==='you')+1;
  const role=rank===1?'Starter':rank===2?'Rotation':rank<=4?'Backup':'Reserve';
  return {all,rank,level,role,squads,levels,allPlayers:sorted};
}

let schools=schoolGen();
draft.points=initialDraft();
