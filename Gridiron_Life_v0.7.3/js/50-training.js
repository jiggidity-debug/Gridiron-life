/* Gridiron Life — 50-training.js
   The player's skill model and the ONE weekly development routine used by high school,
   college and the NFL.

   Three separate stores, never merged:
     • physical attributes  → game.athleticAttributes   (PHYSICAL_ATTRIBUTES)
     • technical skills     → game.technicalAttributes  (TECHNICAL_SKILLS)
     • scheme knowledge     → game.v6.schemeKnowledge / playbooks / techniques (75-v060-systems.js)
   Position OVR (10-roster.js) is computed from the first two. Training groups below name the
   real physical attributes and technical skills each position's OVR is built from, so every
   attribute that counts toward a position's OVR can be trained at every level.
   game.attrs (the old 15-key vocabulary) is only a derived view for the football simulators.
*/

/* ---------- Position training groups (five per position; ids match saved game.focus) ---------- */
const POSITION_TRAINING={
 QB:[['passing','Accuracy & Arm',['shortAccuracy','throwPower','deepAccuracy']],['reads','Reads & Pocket Presence',['decisionMaking','pocketPresence']],['mobility','Mobility',['speed','agility']],['pocket','Ball Handling & Strength',['ballHandling','strength']],['fitness','Burst & Stamina',['accel','stamina']]],
 RB:[['speed','Speed & Acceleration',['speed','accel']],['agility','Agility & Elusiveness',['agility','elusiveness']],['vision','Vision & Ball Security',['vision','carrying','ballHandling']],['power','Power & Break Tackle',['breakTackle','strength','stamina']],['receiving','Catching & Leaping',['catching','jumping']]],
 FB:[['speed','Burst & Speed',['accel','speed']],['agility','Agility & Vision',['vision','agility']],['vision','Ball Security & Break Tackle',['carrying','breakTackle']],['power','Strength & Stamina',['strength','stamina','jumping']],['receiving','Lead Blocking & Hands',['runBlocking','blockTechnique','catching']]],
 WR:[['speed','Speed & Acceleration',['speed','accel']],['routes','Routes & Release',['routes','release']],['hands','Catching & Security',['catching','carrying','ballHandling']],['agility','Agility & Leaping',['agility','jumping']],['strength','Strength & Stamina',['strength','stamina']]],
 TE:[['hands','Catching & Routes',['catching','routes','release']],['blocking','Blocking',['runBlocking','passBlocking','blockTechnique']],['speed','Speed & Acceleration',['speed','accel']],['agility','Agility & Leaping',['agility','jumping']],['fitness','Strength & Stamina',['strength','stamina']]],
 LT:null,LG:null,C:null,RG:null,RT:null,
 DE:[['rush','Pass Rush',['passRush','accel']],['edge','Disengage & Pursuit',['blockShedding','speed','agility']],['run','Run Defense & Tackling',['runDefense','tackling']],['tech','Power & Leverage',['strength']],['motor','Stamina Conditioning',['stamina','jumping']]],
 DT:[['rush','Pass Rush & Burst',['passRush','accel','speed']],['edge','Disengage & Quickness',['blockShedding','agility']],['run','Run Defense & Tackling',['runDefense','tackling']],['tech','Power & Leverage',['strength']],['motor','Stamina Conditioning',['stamina']]],
 NT:null,
 OLB:[['tackle','Tackling & Force',['tackling','strength']],['pursuit','Pursuit',['speed','accel']],['coverage','Coverage',['manCoverage','zoneCoverage','agility']],['reads','Recognition & Run Defense',['playRecognition','runDefense']],['motor','Pass Rush & Stamina',['passRush','stamina','jumping']]],
 ILB:[['tackle','Tackling & Force',['tackling','strength']],['pursuit','Pursuit',['accel','speed']],['coverage','Zone Coverage',['zoneCoverage','agility']],['reads','Recognition & Run Defense',['playRecognition','runDefense']],['motor','Block Shedding & Stamina',['blockShedding','stamina']]],
 MLB:null,
 CB:[['coverage','Man & Press Coverage',['manCoverage','pressCoverage','agility']],['range','Recovery Speed',['speed','accel']],['ball','Ball Skills',['ballSkills','catching','jumping']],['tackle','Strength & Stamina',['strength','stamina']],['reads','Zone & Recognition',['zoneCoverage','playRecognition']]],
 FS:[['coverage','Zone & Man Coverage',['zoneCoverage','manCoverage','agility']],['range','Range & Recovery',['speed','accel']],['ball','Ball Skills',['ballSkills','catching','jumping']],['tackle','Tackling & Strength',['tackling','strength']],['reads','Recognition & Stamina',['playRecognition','stamina']]],
 SS:[['coverage','Zone & Man Coverage',['zoneCoverage','manCoverage','agility']],['range','Range & Recovery',['speed','accel']],['ball','Ball Skills',['ballSkills','jumping']],['tackle','Tackling & Run Support',['tackling','runDefense','strength']],['reads','Recognition & Stamina',['playRecognition','stamina']]],
 K:[['leg','Power & Accuracy',['kickAccuracy','kickPower']],['timing','Timing & Footwork',['agility','accel']],['focus','Composure',['decisionMaking']],['speed','Leg Strength',['strength']],['motor','Consistency',['stamina']]],
 P:[['leg','Punting Technique',['puntTechnique','kickPower']],['timing','Timing & Footwork',['agility','accel']],['focus','Directional Accuracy',['kickAccuracy']],['speed','Leg Strength',['strength']],['motor','Consistency',['stamina']]],
 LS:[['leg','Snap Mechanics',['ballHandling','blockTechnique']],['timing','Footwork',['agility','accel']],['focus','Protection Reads',['blockRecognition','passBlocking']],['speed','Strength',['strength']],['motor','Consistency',['stamina']]]
};
// Positions that share a group layout.
(function(){
 const ol=[['anchor','Anchor & Strength',['strength','passBlocking']],['feet','Footwork',['agility','accel']],['reads','Line Calls & Reads',['blockRecognition']],['hands','Hand Placement & Drive',['blockTechnique','runBlocking']],['finish','Stamina Conditioning',['stamina','jumping']]];
 for(const p of ['LT','LG','C','RG','RT'])POSITION_TRAINING[p]=ol;
 POSITION_TRAINING.NT=POSITION_TRAINING.DT;
 POSITION_TRAINING.MLB=POSITION_TRAINING.ILB;
})();
function trainingGroups(pos){return POSITION_TRAINING[pos||(game&&game.pos)]||POSITION_TRAINING.RB}
function trainingSkillKeys(pos){return [...new Set(trainingGroups(pos).flatMap(g=>g[2]))]}

/* ---------- Skill access ---------- */
function isPhysicalKey(key){return PHYSICAL_ATTRIBUTES.includes(key)}
function skillValue(key){const store=isPhysicalKey(key)?game.athleticAttributes:game.technicalAttributes;const v=Number(store?.[key]);return Number.isFinite(v)?v:0}
function setSkillValue(key,value){const store=isPhysicalKey(key)?game.athleticAttributes:game.technicalAttributes;if(store)store[key]=cl(Math.round(value),0,99)}
function skillLabel(key){return (typeof V6_LABELS!=='undefined'&&V6_LABELS[key])||key}
// game.attrs is rebuilt IN PLACE (object identity matters: rating() recognises the player's own attrs).
function syncLegacyAttrs(){
 if(!game||!game.athleticAttributes||!game.technicalAttributes)return;
 game.attrs=game.attrs||{};
 for(const [legacy,modern] of Object.entries(LEGACY_PROXY))game.attrs[legacy]=skillValue(modern);
}

/* ---------- Age ---------- */
function playerAge(){
 if(!game)return 18;
 const stage=trainingStage();
 if(stage==='nfl')return Number(game.v6?.nfl?.playerAge)||22;
 if(stage==='college')return 17+Math.max(1,Number(game.college?.year)||1);
 return 13+Math.max(9,Math.min(12,Number(game.grade)||9));
}
function trainingStage(){const s=game&&game.stage;return s==='nfl'||s==='nflEntry'?'nfl':s==='college'||s==='collegeComplete'?'college':'highschool'}
// Position-specific aging offset (years): specialists and passers last longer, backs fade earlier.
const AGING_OFFSET={ST:6,QB:3,OL:1,TE:0,DL:0,LB:0,WR:-1,DB:-1,RB:-2};
function agingOffset(){return AGING_OFFSET[POSITION_FAMILIES[game.pos]||'RB']||0}
const MENTAL_SKILLS=['decisionMaking','pocketPresence','blockRecognition','playRecognition','kickAccuracy','routes','zoneCoverage'];
// Growth multiplier by age: physical development ends first; technical learning continues into the late twenties.
function ageGrowth(key){
 const age=playerAge()-agingOffset();
 if(isPhysicalKey(key))return age<=21?1:age<=24?.8:age<=27?.4:age<=29?.1:0;
 return age<=24?1:age<=27?.75:age<=30?.45:age<=33?.2:.05;
}
// Existing physical wear and prior injuries affect when age-related decline starts.
// No separate injury or damage track is created.
function physicalAgePenalty(){
 const health=typeof healthState==='function'?healthState():game.health||{};
 const wear=cl(Number(health?.wear)||0,0,100);
 const injuries=Array.isArray(health?.injuryHistory)?health.injuryHistory.length:0;
 return cl(Math.floor(wear/28)+Math.min(2,Math.floor(injuries/3)),0,5);
}
// Yearly decline applied once per professional offseason. Returns a summary list.
function applyAging(){
 const age=playerAge()-agingOffset()+physicalAgePenalty(),notes=[];
 const lose=(key,n)=>{if(n<=0)return;const v=skillValue(key);if(v<=0)return;setSkillValue(key,v-n);notes.push(skillLabel(key)+' −'+n)};
 for(const key of ['speed','accel','jumping'])lose(key,age>=33?3:age>=31?2:age>=29?1:0);
 lose('agility',age>=33?3:age>=31?2:age>=29?1:0);
 for(const key of ['strength','stamina'])lose(key,age>=35?2:age>=32?1:0);
 for(const key of TECHNICAL_SKILLS){
  if(skillValue(key)<=0)continue;
  const mental=MENTAL_SKILLS.includes(key);
  lose(key,mental?(age>=38?1:0):(age>=34?1:0));
 }
 syncLegacyAttrs();
 return notes;
}

/* ---------- Weekly development ---------- */
// Team-practice hours by level and calendar period. High school keeps PHASES[].teamHours.
const TEAM_PRACTICE_HOURS={
 college:{season:14,postseason:10,'Winter development':6,'Spring practices':15,'Summer training':4,'Fall camp preparation':25},
 nfl:{camp:30,regular:16,playoffs:16,'Winter recovery':2,'Free agency and draft':3,'Organized team activities':12,'Training camp preparation':8}
};
function trainingPlan(){return (trainingStage()==='college'?game.college?.weeklyPlan:game.plan)||{training:0}}
function teamPracticeHours(){
 const stage=trainingStage();
 if(stage==='highschool')return PHASES[game.phase]?.teamHours||0;
 if(stage==='college'){const c=game.college||{};
  if(c.phase==='offseason')return TEAM_PRACTICE_HOURS.college[careerCalendarPeriod('college',Number(c.week)||0)]??6;
  return TEAM_PRACTICE_HOURS.college[c.phase==='postseason'?'postseason':'season'];
 }
 const n=game.v6?.nfl||{};
 if(!n.team)return 0; // unsigned players have no team practices
 if(n.phase==='offseason'||n.phase==='freeAgency')return TEAM_PRACTICE_HOURS.nfl[careerCalendarPeriod('nfl',Number(n.week)||0)]??2;
 return TEAM_PRACTICE_HOURS.nfl[n.phase]??16;
}
function trainingCoachFactor(){
 const stage=trainingStage();
 if(stage==='highschool')return cl((game.school?.coaching||65)/65,.75,1.35);
 if(stage==='college'){const p=game.college?.program||{};return cl(((p.coaching||65)/65)*((p.facilities||70)/70),.75,1.35)}
 return cl((game.v6?.nfl?.team?.strength||80)/80,.85,1.15);
}
function trainingEfficiency(){
 const v=typeof v6State==='function'?v6State():null;
 const mental=Number(v?.mentalFatigue)||0;
 const personality=v?.personality?cl(.92+(Number(v.personality['Work Ethic'])-50)/500+(Number(v.personality.Coachability)-50)/700,.8,1.15):1;
 const injury=game.injury?(game.injury.severity>=2?.12:.38):1;
 const state=cl(.65+(Number(game.iq)||50)/180+(Number(game.morale)||50)/250-(Number(game.stress)||0)/380-((Number(game.fatigue)||0)+mental*.2)/370,.4,1.5);
 return injury*state*personality;
}
const PHYSICAL_PACE=.6;     // physical attributes move more slowly than learned skills
function developWeek(){
 if(!game||!game.athleticAttributes||!game.technicalAttributes)return [];
 const groups=trainingGroups(),plan=trainingPlan(),training=Math.max(1,Number(plan.training)||0);
 const team=teamPracticeHours()*.4*(.65+Number(game.teamIntensity??2)*.2)*trainingCoachFactor();
 const individual=(Number(plan.training)||0)*(.30+Number(game.extraIntensity??2)*.16);
 const efficiency=trainingEfficiency();
 const boost=(game.gymWeeks>0?.17:0)+(game.trainingEquipment?.08:0);
 game.progress=game.progress||{};
 for(const g of groups){
  const hours=Number(game.focus?.[g[0]])||0;
  const increment=(team/groups.length+individual*hours/training)*efficiency;
  g[2].forEach((key,i)=>{
   const value=skillValue(key);if(!(value<99))return;
   const pace=isPhysicalKey(key)?PHYSICAL_PACE:1;
   const easeOfGrowth=cl((105-value)/65,.25,1.35);
   // Specialist OVR depends on very few technical skills, so once they become
   // advanced, continued practice provides smaller marginal improvement.
   const specialistTechnique=(POSITION_FAMILIES[game.pos]==='ST'&&!isPhysicalKey(key)&&value>=70)
    ?cl(1-(value-70)*.014,.60,1):1;
   game.progress[key]=(Number(game.progress[key])||0)+increment*(i===0?1:.6)*pace*easeOfGrowth*specialistTechnique*ageGrowth(key)+(hours>0?boost:0);
  });
 }
 return settleProgress();
}
// Every 12 progress points become one rating point. Camps, 7-on-7 and purchases only add progress.
function awardProgress(key,amount){if(!game||!(amount>0))return;game.progress=game.progress||{};if(skillValue(key)<99)game.progress[key]=(Number(game.progress[key])||0)+amount}
function settleProgress(){
 const gains=[];
 for(const key of [...PHYSICAL_ATTRIBUTES,...TECHNICAL_SKILLS]){
  let p=Number(game.progress?.[key])||0;if(p<12)continue;
  let gained=0;while(p>=12&&skillValue(key)<99){setSkillValue(key,skillValue(key)+1);p-=12;gained++}
  game.progress[key]=Math.min(p,11.99);
  if(gained)gains.push(skillLabel(key)+' +'+gained);
 }
 syncLegacyAttrs();
 return gains;
}
// High-school weekly entry (called from applyWeek).
function development(){
 if(game.gymWeeks>0)game.gymWeeks--;
 const logs=developWeek();
 if(logs.length)note('Development: '+logs.join(', ')+'.');
 return logs;
}

/* ---------- Save compatibility ---------- */
// Old saves kept training progress under the 15 legacy keys and (very old ones) had no modern skill stores.
function migrateSkillModel(){
 if(!game||game.skillModel===2)return;
 if(!game.athleticAttributes||!game.technicalAttributes){
  const a=game.attrs||{},inverse=Object.fromEntries(Object.entries(LEGACY_PROXY).map(([l,m])=>[m,l]));
  game.athleticAttributes={};game.technicalAttributes={};
  for(const k of PHYSICAL_ATTRIBUTES)game.athleticAttributes[k]=cl(Math.round(a[inverse[k]]??a.speed??38),0,99);
  const known=TECHNICAL_SKILLS.filter(k=>inverse[k]).map(k=>a[inverse[k]]).filter(Number.isFinite);
  const fallback=known.length?Math.round(known.reduce((x,y)=>x+y,0)/known.length*.6):20;
  for(const k of TECHNICAL_SKILLS)game.technicalAttributes[k]=cl(Math.round(a[inverse[k]]??fallback),0,99);
 }
 const progress={};
 for(const [key,value] of Object.entries(game.progress||{})){const modern=LEGACY_PROXY[key]||key;if([...PHYSICAL_ATTRIBUTES,...TECHNICAL_SKILLS].includes(modern))progress[modern]=(progress[modern]||0)+(Number(value)||0)}
 game.progress=progress;
 const groups=trainingGroups();game.focus=game.focus||{};
 for(const g of groups)if(!Number.isFinite(Number(game.focus[g[0]])))game.focus[g[0]]=0;
 game.skillModel=2;
 syncLegacyAttrs();
}
