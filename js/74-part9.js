/* Gridiron Life 0.5 Part 9 — stage-one implementation. New games only for creation changes. */
(function(){
'use strict';
const ATHLETIC=PHYSICAL_ATTRIBUTES;
const TECHNICAL=TECHNICAL_SKILLS;
const PERSONAL=['behavior','academics','socialSkills'];
const LABELS={speed:'Speed',accel:'Acceleration',agility:'Agility',strength:'Strength',jumping:'Jumping',stamina:'Stamina',throwPower:'Throw Power',shortAccuracy:'Short Accuracy',deepAccuracy:'Deep Accuracy',decisionMaking:'Decision Making',pocketPresence:'Pocket Presence',ballHandling:'Ball Handling',catching:'Catching',routes:'Route Running',release:'Release',vision:'Ball Carrier Vision',elusiveness:'Elusiveness',carrying:'Ball Security',breakTackle:'Break Tackle',runBlocking:'Run Blocking',passBlocking:'Pass Blocking',blockTechnique:'Blocking Technique',blockRecognition:'Blocking Recognition',tackling:'Tackling',blockShedding:'Block Shedding',passRush:'Pass Rush',runDefense:'Run Defense',manCoverage:'Man Coverage',zoneCoverage:'Zone Coverage',pressCoverage:'Press Coverage',playRecognition:'Play Recognition',ballSkills:'Ball Skills',kickPower:'Kick Power',kickAccuracy:'Kick Accuracy',puntTechnique:'Punt Technique',behavior:'Behavior',academics:'Academics',socialSkills:'Social Skills'};
const CORE_BY_POSITION={QB:['throwPower','shortAccuracy','deepAccuracy','decisionMaking','pocketPresence','ballHandling'],RB:['vision','elusiveness','carrying','breakTackle','catching'],WR:['catching','routes','release','carrying'],TE:['catching','routes','release','runBlocking','passBlocking'],OL:['runBlocking','passBlocking','blockTechnique','blockRecognition'],DL:['blockShedding','passRush','runDefense','tackling'],LB:['tackling','runDefense','manCoverage','zoneCoverage','playRecognition'],DB:['manCoverage','zoneCoverage','pressCoverage','playRecognition','ballSkills','catching'],ST:['kickPower','kickAccuracy','puntTechnique']};
const PARENTS={};
const jobs=['Teacher','Mechanic','Nurse','Warehouse worker','Accountant','Chef','Electrician','Sales associate','Software technician','Bus driver','Fitness instructor','Carpenter','Entrepreneur','Office administrator','Community volunteer'];
const traits=['Patient','Reserved','Outgoing','Competitive','Reflective','Practical','Organized','Warm','Independent','Persistent','Adventurous','Direct','Supportive','Creative','Disciplined'];
const maleNames=['Marcus','Andre','Darius','Daniel','James','Victor','Michael','Evan','Luis','David','Omar','Chris','Anthony','Noah','Jamal'];
const femaleNames=['Danielle','Alicia','Tanya','Maria','Sophia','Camila','Erica','Jasmine','Lauren','Ashley','Nia','Grace','Maya','Renee','Monica'];
const lastNames=['Carter','Davis','Johnson','Thomas','Harris','Lopez','Williams','Clark','Rivera','King','Morris','Lee','Robinson','Taylor','Young'];
for(const sex of ['male','female']){
  PARENTS[sex]=Array.from({length:75},(_,i)=>{
    const j=i%15,v=Math.floor(i/15),height=sex==='male'?64+((j*7+v*3)%14):58+((j*5+v*4)%14);
    const iq=82+((i*13+(sex==='male'?3:11))%51),athletic=25+((i*17+v*9)%66);
    const wealthyProfiles={14:['Business owner',260000],39:['Surgeon',540000],68:['Technology executive',980000]};
    const wealthy=wealthyProfiles[i];
    return {id:(sex==='male'?'M':'F')+String(i+1).padStart(3,'0'),sex,name:(sex==='male'?maleNames[j]:femaleNames[j])+' '+lastNames[(j+v*4)%15],height,iq,athletic,behavior:24+((i*11+v*7)%72),academics:24+((i*13+j)%72),socialSkills:23+((i*19+v)%73),occupation:wealthy?wealthy[0]:jobs[(j+v*3)%15],trait:traits[(j*2+v)%15],income:wealthy?wealthy[1]:16000+((i*29+v*73)%104)*850,formerAthlete:(i*7+v)%5===0};
  });
}
const CONDITIONS=[['together','Together'],['separated','Separated / divorced'],['father-deceased','Father deceased'],['mother-deceased','Mother deceased'],['both-deceased','Both parents deceased'],['father-incarcerated','Father incarcerated'],['mother-incarcerated','Mother incarcerated'],['both-incarcerated','Both parents incarcerated'],['father-unknown','Father unknown'],['mother-unknown','Mother unknown'],['both-unknown','Both parents unknown'],['blended','Blended / guardian household']];
function chooseCondition(){const n=Math.random();if(n<.48)return 'together';if(n<.67)return 'separated';if(n<.77)return 'blended';return pick(CONDITIONS.slice(2,11))[0]}
let middleHistory={experience:'school',sports:'none',former:'none'};
let family=null,rolls=5,allocation={},creatorPosition='RB',creatorDetails={name:'Jordan Carter',school:0,bg:'working',height:69,weight:155,hometown:'',jersey:7,hand:'Right'};
const clamp99=v=>Math.max(0,Math.min(99,Math.round(Number(v)||0)));
function parentBonus(k){if(PERSONAL.includes(k)||!family)return 0;const a=family.male,b=family.female;const physical=ATHLETIC.includes(k);const academic=k==='academics';const social=k==='socialSkills';const behavior=k==='behavior';const relevant=physical?Math.round((a.athletic+b.athletic)/2):academic?Math.round((a.academics+b.academics)/2):social?Math.round((a.socialSkills+b.socialSkills)/2):behavior?Math.round((a.behavior+b.behavior)/2):Math.round((a.athletic+b.athletic)/2);
  const sportLink=TECHNICAL.includes(k)&&(a.formerAthlete||b.formerAthlete);
  // Bonuses are modest and deliberately do not predict IQ or a child's entire personality.
  return physical?Math.max(0,Math.floor((relevant-45)/9)):sportLink?3+(relevant>60?2:0):academic||social||behavior?Math.max(0,Math.floor((relevant-50)/14)):0;
}
function rollFamily(){return {male:pick(PARENTS.male),female:pick(PARENTS.female),condition:chooseCondition()}}
function familyResources(){if(!family)return 75;const c=family.condition;const both=c==='together'||c==='blended';const accessible=c==='both-deceased'||c==='both-incarcerated'||c==='both-unknown'?0:c==='father-deceased'||c==='father-incarcerated'||c==='father-unknown'?family.female.income:c==='mother-deceased'||c==='mother-incarcerated'||c==='mother-unknown'?family.male.income:both?family.male.income+family.female.income:Math.max(family.male.income,family.female.income);return cl(Math.round(accessible/(accessible>=200000?250:350)),35,3000)}
function heightSuggestion(){if(!family)return 69;return Math.round((family.male.height+family.female.height+5)/2)}
function ensureFamily(){if(!family)family=rollFamily()}
function rerollFamily(){if(rolls<=0)return;rolls--;family=rollFamily();render()}
function pointsCost(n){return Math.max(0,Math.round(Number(n)||0))}
function spent(){return Object.values(allocation).reduce((n,v)=>n+pointsCost(v),0)}
function creatorFamilyHtml(){ensureFamily();const [conditionLabel]=[CONDITIONS.find(x=>x[0]===family.condition)?.[1]||'Together'];
 const display=(parent,unknown)=>'<div class="tile"><strong>'+(unknown?'Not known to player':e(parent.name))+'</strong><p class="muted">'+(unknown?'Background undisclosed':e(parent.occupation+' · '+parent.trait))+'</p><small>Height: '+(unknown?'Unknown':Math.floor(parent.height/12)+'\' '+parent.height%12+'\"')+' · IQ: '+(unknown?'Unknown':parent.iq)+'</small><p class="muted">'+(parent.formerAthlete?'Athletic experience':'Background varies')+'</p></div>';
 return '<div class="line"><strong>Family roll · '+e(conditionLabel)+'</strong><span>'+rolls+' rerolls left</span></div><div class="grid">'+display(family.male,family.condition.includes('father-unknown')||family.condition==='both-unknown')+display(family.female,family.condition.includes('mother-unknown')||family.condition==='both-unknown')+'</div><p class="muted">Player starting funds: $'+familyResources()+' · Mid-parental height reference: '+Math.floor(heightSuggestion()/12)+' ft '+(heightSuggestion()%12)+' in (not a height ceiling).</p><p class="muted">Two profiles are generated independently from 75 male and 75 female profiles, including uncommon affluent families. Starting funds are the player\'s personal spending money, not the household\'s total wealth. Family circumstances and guardian support vary. None automatically determines behavior or long-term potential.</p><button class="alt" '+(!rolls?'disabled':'')+' onclick="part9Reroll()">Reroll entire family ('+rolls+' left)</button><p class="muted">Rerolling permanently discards the current family. No previous rolls can be recovered.</p>';
}
const HISTORY_EXPERIENCE={none:['New to football',0],recreation:['Recreational / pickup',1],school:['Middle-school team',2],veteran:['Experienced youth player',3]};
const HISTORY_SPORTS={none:'Football only / no other sports',track:'Track and field',basketball:'Basketball',wrestling:'Wrestling',baseball:'Baseball',soccer:'Soccer'};
const HISTORY_FORMS={none:'Same position or no prior position',QB:'Quarterback',RB:'Running back',WR:'Wide receiver',TE:'Tight end',OL:'Offensive line',DL:'Defensive line',LB:'Linebacker',DB:'Defensive back'};
const HISTORY_PRIORS={QB:['throwPower','shortAccuracy','decisionMaking','pocketPresence'],RB:['vision','elusiveness','carrying','breakTackle'],WR:['catching','routes','release'],TE:['catching','routes','runBlocking'],OL:['runBlocking','passBlocking','blockRecognition'],DL:['passRush','runDefense','blockShedding'],LB:['tackling','playRecognition','runDefense'],DB:['manCoverage','zoneCoverage','playRecognition']};
// Weight-sensitive starting physical ratings; size alone never grants more than 45.
const CREATION_WEIGHT_TABLE=[[0,45,10],[160,45,15],[180,45,20],[200,44,25],[220,37,32],[240,28,39],[260,18,45],[280,10,45],[300,5,45]];
function creationBodyBaseline(k){
 const weight=Number(creatorDetails.weight);
 const w=Number.isFinite(weight)?Math.max(100,Math.min(450,weight)):155;
 let row=CREATION_WEIGHT_TABLE[0];for(const entry of CREATION_WEIGHT_TABLE)if(w>=entry[0])row=entry;
 return k==='speed'?row[1]:k==='strength'?row[2]:null;
}
const creationLimit=k=>ATHLETIC.includes(k)||TECHNICAL.includes(k)?70:99;
// Athletic/Technical allocation reaches at most 70 BEFORE outside bonuses.
// Family and middle-school history are awarded afterward and can exceed 70 (up to 99).
function creationBaseline(k){
 if(PERSONAL.includes(k))return 0;
 const physical={speed:40,accel:39,agility:35,strength:29,jumping:35,stamina:36};
 const mental={decisionMaking:25,vision:23,playRecognition:20,blockRecognition:20,pocketPresence:22};
 // All non-Personal creation baselines, including weight-derived Speed/Strength,
 // are reduced by 50%. Bonuses from middle school/family remain unchanged.
 const original=creationBodyBaseline(k)??physical[k]??mental[k]??(TECHNICAL.includes(k)?12:22);
 return Math.round(original*0.5);
}
function historyBonus(k){
 if(PERSONAL.includes(k))return 0;
 const exp=HISTORY_EXPERIENCE[middleHistory.experience]?.[1]||0;
 let n=ATHLETIC.includes(k)?exp*2:TECHNICAL.includes(k)?exp*6:exp*3;
 if(k==='playRecognition'||k==='decisionMaking'||k==='blockRecognition')n+=exp*2;
 const sport={track:['speed','accel','stamina'],basketball:['agility','jumping','catching'],wrestling:['strength','breakTackle','tackling'],baseball:['throwPower','catching','ballSkills'],soccer:['stamina','agility','accel']}[middleHistory.sports]||[];
 if(sport.includes(k))n+=8;
 const old=HISTORY_PRIORS[middleHistory.former]||[];
 if(old.includes(k))n+=middleHistory.former===POSITION_FAMILIES[creatorPosition]?5:9;
 const current=CORE_BY_POSITION[POSITION_FAMILIES[creatorPosition]]||[];
 if(current.includes(k)&&exp>=2)n+=4;
 return n;
}
function allocationHeadroom(k){return Math.max(0,creationLimit(k)-creationBaseline(k))}
function normalizeCreatorAllocation(){
 for(const k of [...ATHLETIC,...TECHNICAL,...PERSONAL]){
  allocation[k]=Math.max(0,Math.min(pointsCost(allocation[k]||0),allocationHeadroom(k)));
 }
}
// Single source of truth for the stat shown in creation, OVR preview, and the saved player.
// The cap limits what points can buy; inherited/history bonuses are awarded afterward.
function creatorFinalRating(k){
 const base=creationBaseline(k);
 const bought=Math.min(allocationHeadroom(k),pointsCost(allocation[k]||0));
 return clamp99(base+bought+historyBonus(k)+parentBonus(k));
}
function getCreatorValues(){
 if(!family)ensureFamily();const result={};
 for(const k of [...ATHLETIC,...TECHNICAL,...PERSONAL])result[k]=creatorFinalRating(k);
 return result;
}
function historyCreatorHtml(){const select=(id,val,opts)=>'<label>'+id+'<select onchange="part9History(this.dataset.kind,this.value)" data-kind="'+id+'">'+Object.entries(opts).map(([key,label])=>'<option value="'+key+'" '+(val===key?'selected':'')+'>'+e(Array.isArray(label)?label[0]:label)+'</option>').join('')+'</select></label>';
 const v=getCreatorValues();
 return '<section class="panel"><h2>03 · Middle School / Player History</h2><p class="muted">Your size/position establishes a baseline (reduced 50%). Creation points are applied next (Athletic/Technical capped at 70 before bonuses), followed by middle-school and family bonuses. Sports and prior football positions can overlap.</p><div class="signup-grid">'+select('experience',middleHistory.experience,HISTORY_EXPERIENCE)+select('sports',middleHistory.sports,HISTORY_SPORTS)+select('former',middleHistory.former,HISTORY_FORMS)+'</div><div class="line"><strong>Projected freshman '+e(creatorPosition)+' OVR</strong><strong>'+playerPositionOvr(creatorPosition,v,v)+'</strong></div><p class="muted">Preview uses current history, family bonuses and allocated attributes. Physical maturity and future potential are separate from starting OVR.</p></section>';
}

function creatorStat(k){
 const bonus=parentBonus(k),base=creationBaseline(k),history=historyBonus(k),n=allocation[k]||0;
 const max=Math.max(0,Math.min(allocationHeadroom(k),300-spent()+pointsCost(n)));
 const value=creatorFinalRating(k);
 const detail=PERSONAL.includes(k)?'Allocated +'+n+' · No baseline or bonus':'Baseline '+base+' · Allocated +'+n+' (pre-bonus '+(base+n)+') · History +'+history+' · Family +'+bonus;
 return '<div class="creator-stat"><div class="line"><label for="cr_'+k+'">'+e(LABELS[k])+'</label><strong id="cv_'+k+'">'+value+'</strong></div><input id="cr_'+k+'" aria-label="'+e(LABELS[k])+'" type="range" min="0" max="'+max+'" value="'+n+'" oninput="part9SetStat(\''+k+'\',this.value)"><small class="muted">'+detail+' · Pre-bonus allocation cap '+creationLimit(k)+'</small></div>';
}
function creatorForm(){ensureFamily();normalizeCreatorAllocation();const pos=creatorPosition,keys=CORE_BY_POSITION[POSITION_FAMILIES[pos]]||CORE_BY_POSITION.RB;const secondary=TECHNICAL.filter(k=>!keys.includes(k));const v=getCreatorValues();
 const heightFeet=Math.floor(creatorDetails.height/12),heightInches=creatorDetails.height%12;
 return '<div class="bar"><div class="logo">GRIDIRON LIFE</div><span class="chip">v0.7.1 · ROSTER-CALENDAR</span></div><div class="signup-masthead"><h1>Create your freshman</h1><p>Player · Family · Attributes</p></div>'+
 '<section class="panel"><h2>01 · Student information</h2><label>Full name<input id="name" maxlength="30" value="'+e(creatorDetails.name)+'"></label><div class="signup-grid"><label>Hometown<input id="hometown" maxlength="48" value="'+e(creatorDetails.hometown)+'"></label><label>Jersey number<input id="jersey" type="number" min="0" max="99" value="'+creatorDetails.jersey+'"></label></div><div class="signup-grid"><label>Primary position<select id="position" onchange="part9ChangePosition(this.value)">'+Object.keys(GROUPS).map(p=>'<option '+(p===pos?'selected':'')+'>'+p+'</option>').join('')+'</select></label><label>Hand<select id="hand"><option '+(creatorDetails.hand==='Right'?'selected':'')+'>Right</option><option '+(creatorDetails.hand==='Left'?'selected':'')+'>Left</option></select></label></div><div class="signup-grid"><div><label>Height</label><div class="height-inputs"><label>Feet<select id="heightFeet">'+[4,5,6].map(f=>'<option value="'+f+'" '+(heightFeet===f?'selected':'')+'>'+f+'</option>').join('')+'</select></label><label>Inches<select id="heightInches">'+Array.from({length:12},(_,i)=>'<option '+(heightInches===i?'selected':'')+'>'+i+'</option>').join('')+'</select></label></div></div><label>Weight (lb)<input id="weight" type="number" min="100" max="450" value="'+creatorDetails.weight+'" onchange="part9WeightChanged()"></label></div></section>'+
 '<section class="panel"><h2>02 · Family roll</h2>'+creatorFamilyHtml()+'</section>'+historyCreatorHtml()+'<section class="panel"><h2>04 · School selection</h2><label>Family background <select id="bg">'+BG.map(x=>'<option value="'+x[0]+'" '+(x[0]===creatorDetails.bg?'selected':'')+'>'+e(x[1])+'</option>').join('')+'</select></label>'+schoolChoiceRow()+'</section>'+
 '<section class="panel"><h2>05 · Attribute allocation</h2><div class="line"><strong>Shared creation budget</strong><strong id="spent">'+spent()+' / 300</strong></div><div class="meter signup-budget"><i style="width:'+(spent()/3)+'%"></i></div><p id="remaining-points" class="muted">'+(300-spent())+' points remaining · Allocations start at 0; history bonuses apply after allocation.</p><p class="muted">Creation points are added to the size/position baseline first; Athletic and Technical allocation stops at 70 before bonuses. Middle-school history and family bonuses apply afterward and can raise the final rating to 99. Personal ratings have no baseline and are determined by allocation (up to 99). Size-based Speed and Strength baseline values are halved (their original size-derived values cap at 45 before halving). Technical skills not selected for your position remain available for multiposition development. Position OVR uses position-specific Athletic and Technical weights; detailed play simulation remains separate.</p><h3>Athletic · Universal</h3><div class="creator-stats-grid">'+ATHLETIC.map(creatorStat).join('')+'</div><h3>Technical · '+e(pos)+' priority</h3><div class="creator-stats-grid">'+keys.map(creatorStat).join('')+'</div><details><summary>Other technical skills ('+secondary.length+')</summary><div class="creator-stats-grid">'+secondary.map(creatorStat).join('')+'</div></details><h3>Personal</h3><div class="creator-stats-grid">'+PERSONAL.map(creatorStat).join('')+'</div></section>'+
 '<section class="panel"><button onclick="part9Start()">Submit registration & begin career</button></section>';
}
function snapshotCreator(){const byId=id=>document.getElementById(id);if(!byId('name'))return;creatorDetails={name:byId('name').value,school:Number(byId('school')?.value||0),bg:byId('bg').value,height:Number(byId('heightFeet').value)*12+Number(byId('heightInches').value),weight:Number(byId('weight').value),hometown:byId('hometown').value,jersey:Number(byId('jersey').value),hand:byId('hand').value}}
function setStat(k,n){if(![...ATHLETIC,...TECHNICAL,...PERSONAL].includes(k))return;n=clamp99(n);const allowed=Math.max(0,300-spent()+pointsCost(allocation[k]||0));allocation[k]=Math.max(0,Math.min(n,allowed,allocationHeadroom(k)));render()}
function startCareer(){snapshotCreator();normalizeCreatorAllocation();if(spent()>300){alert('You exceeded the 300-point budget.');return}const v=getCreatorValues(),s=creatorDetails;
 if(s.height<58||s.height>80){alert('Choose a height between 4 ft 10 in and 6 ft 8 in.');return}
 if(!Number.isInteger(s.jersey)||s.jersey<0||s.jersey>99){alert('Choose a jersey from 0 to 99.');return}
 if(!Number.isFinite(s.weight)||s.weight<100||s.weight>450){alert('Choose a valid weight from 100–450 pounds.');return}
 const attrs={};
 const school=schools[s.school]||schools[0];const bg=BG.find(x=>x[0]===s.bg)||BG[0];
 game={version:5,name:s.name.trim().slice(0,30)||'Jordan Carter',pos:creatorPosition,bg:s.bg,school,schools,hometown:s.hometown.trim().slice(0,48),jersey:s.jersey,hand:s.hand,grade:9,phase:0,week:1,day:0,year:1,attrs,skillModel:2,progress:Object.fromEntries([...PHYSICAL_ATTRIBUTES,...TECHNICAL_SKILLS].map(k=>[k,0])),iq:v.academics,behavior:v.behavior,socialSkills:v.socialSkills,athleticAttributes:Object.fromEntries(ATHLETIC.map(k=>[k,v[k]])),technicalAttributes:Object.fromEntries(TECHNICAL.map(k=>[k,v[k]])),physicalBenchmarks:false,middleSchoolHistory:{...middleHistory},creationAllocation:{...allocation},family:JSON.parse(JSON.stringify(family)),familyRerollsUsed:5-rolls,height:s.height,weight:s.weight,physicalType:pick(['early','average','late']),growth:{midParentalHeight:heightSuggestion(),estimatedAdultHeight:Math.round(heightSuggestion()+R(-4,4)),highSchoolYears:{},collegeYears:{},history:[],collegePlan:'Balanced',targetWeight:null},money:familyResources(),familyExpect:bg[3],morale:72,stress:12,fatigue:3,endurance:v.stamina,gpa:3,grades:3,coachTrust:45,relationship:50,team:createRoster(school,creatorPosition),squadPreference:'Auto',dualSquad:false,placement:null,alumni:[],seasonHistory:[],nextNpcId:1000,squadRecords:emptySquadRecords(),programRecord:[0,0],schedule:[],plan:{training:7,study:6,work:0,social:4,recovery:6},focus:Object.fromEntries(trainingGroups(creatorPosition).map(g=>[g[0],0])),teamIntensity:2,extraIntensity:2,job:null,injury:null,gamePending:false,scheduledEvent:null,record:[0,0],games:[],history:[],eventLog:[],yearWeeks:0,saveBackups:[],eventCount:0,exposure:{score:0,tier:'Unknown'},socialMedia:{followers:0,posts:0,engagement:0}};
 syncLegacyAttrs();for(const [i,g] of trainingGroups(creatorPosition).entries())if(i<3)game.focus[g[0]]=[3,2,2][i];
 game.schedule=createSchedule();academicState();socialState();healthState();summerState();profileState();profileMilestone('registration','Registration accepted','Signed football registration at '+school.name+'.',{snapshot:true});note('Freshman year begins at '+school.name+'.');persist();tab='home';render();
}
window.part9WeightChanged=()=>{snapshotCreator();normalizeCreatorAllocation();render()};window.part9History=(kind,value)=>{if(!Object.prototype.hasOwnProperty.call(middleHistory,kind))return;snapshotCreator();middleHistory[kind]=value;render()};window.part9Reroll=()=>{snapshotCreator();rerollFamily()};window.part9ChangePosition=p=>{snapshotCreator();creatorPosition=p;render()};window.part9SetStat=setStat;window.part9Start=startCareer;
// Event-choice quality uses the player's current behavior, not arbitrary index order.
function qualityWindow(behavior){return behavior<25?0:behavior<50?1:behavior<75?2:3}
const oldMaybeEvent=maybeEvent,oldChooseEvent=chooseEvent;
maybeEvent=function(){if(!game)return;
 const n=game.eventCount||0,b=game.behavior||0,interval=b<25?1:b<50?2:b<75?3:5;
 if((n+1)%interval!==0){game.eventCount=n+1;return}
 game.eventCount=(Math.floor(n/3)+1)*3-1;
 oldMaybeEvent();if(!game.scheduledEvent)return;const ev=game.scheduledEvent;
 if(ev.part9Choices)return;const start=qualityWindow(game.behavior||0);
 // Reuse existing event narratives and consequences, with ordered behavior-sensitive choices.
 const old=ev.choices.slice();const descriptors=[['Escalate the conflict','Act recklessly','Respond dismissively','Stay neutral','Respond constructively','Show leadership'],['Make a damaging choice','React defensively','Avoid responsibility','Consider the situation','Handle it responsibly','Help others resolve it']];
 const context=ev.title.toLowerCase().includes('academic')?1:0;
 const quality=[0,1,2,3,4,5];
 ev.part9Choices=true;ev.responseQuality=quality.slice(start,start+3);ev.sourceChoices=old;
 ev.choices=ev.responseQuality.map(q=>[descriptors[context][q],q<=1?'You made the situation worse.':q===2?'You handled this poorly.':q===3?'You did not make things better or worse.':q===4?'You handled the situation responsibly.':'You demonstrated leadership.',q-3,q]);
};
chooseEvent=function(i){const ev=game?.scheduledEvent;if(!ev||!ev.part9Choices)return oldChooseEvent(i);const q=ev.responseQuality?.[i];if(q==null)return;const choice=ev.choices[i];
 const delta=q===0?-5:q===1?-3:q===2?-1:q===3?0:q===4?2:4;
 game.behavior=cl((game.behavior||0)+delta,0,99);
 game.morale=cl(game.morale+(q-3),0,100);game.coachTrust=cl(game.coachTrust+(q>=4?1:q<=1?-2:0),0,100);
 note('Behavior event: '+ev.title+' — '+choice[1]+' Behavior '+(delta>=0?'+':'')+delta+'.');
 game.scheduledEvent=null;persist();render();
};
const oldApplyWeek=applyWeek;
applyWeek=function(){oldApplyWeek();if(!game)return;
 // Gentle positive reinforcement for making room for service/counseling; deliberate activities give larger gains.
 if(game.supportProgram?.weeks>0){game.supportProgram.weeks--;if(game.plan.social>=2){game.behavior=cl((game.behavior||0)+1,0,99);note('Regular support session: Behavior +1.')}if(game.supportProgram.weeks===0)game.supportProgram=null;}
 const current=game.exposure||(game.exposure={score:0,tier:'Unknown'});let increase=0;
 if(game.games?.length){const recent=game.games[0];if(recent?.year===game.year&&recent?.week>=game.week-2)increase+=(recent?.win?1:0);}
 if(game.socialMedia?.posts)increase+=Math.min(1,Math.floor(game.socialMedia.posts/5));
 current.score=cl((current.score||0)+increase,0,100);current.tier=exposureTier(current.score);
 persist();
};
function exposureTier(s){if(s>=99&&worldwideEligible())return 'Worldwide';return s>=92?'National':s>=55?'Regional':s>=15?'Local':'Unknown'}
function worldwideEligible(){if(!game)return false;const m=game.socialMedia||{},social=game.socialSkills||0;const records=[...(game.awards?.history||[]),...(game.college?.awards||[]),...(game.history||[]),...(game.eventLog||[])];const headlines=records.map(x=>(typeof x==='string'?x:JSON.stringify(x))).join(' ').toLowerCase();const elite=/(heisman|generational draft|historic draft prospect)/.test(headlines);return elite&&social>=95&&(m.engagement||0)>=95&&(m.followers||0)>=5000000}
function addExposure(points,reason){const x=game.exposure||(game.exposure={score:0,tier:'Unknown'});x.score=cl(x.score+points,0,100);x.tier=exposureTier(x.score);note('Exposure '+(points>=0?'+':'')+points+': '+reason);persist()}
function support(type){const services={counsel:{name:'School counseling',cost:0,hours:2,behavior:1,program:4},mentor:{name:'Mentorship program',cost:0,hours:2,behavior:1,program:3},therapy:{name:'Private behavioral coaching',cost:120,hours:2,behavior:2,program:5},volunteer:{name:'Volunteer locally',cost:0,hours:3,behavior:1,exposure:1},repair:{name:'Make amends and repair relationships',cost:0,hours:1,behavior:1}};const s=services[type];if(!s)return;const college=game.stage==='college';if(type==='therapy'&&game.money<s.cost){feedback='Not enough money for '+s.name;render();return}const hours=game.stage==='college'?(40-Object.values(collegeState().weeklyPlan).reduce((a,b)=>a+b,0)):hoursCap()-allHours();if(s.hours>hours){feedback='Need '+s.hours+' available weekly hours.';render();return}if(game.supportLast===game.year+':'+game.yearWeeks+':'+type){feedback='Already completed this activity this week.';render();return}game.supportLast=game.year+':'+game.yearWeeks+':'+type;game.money-=s.cost;game.activityHoursThisWeek=(game.activityHoursThisWeek||0)+s.hours;game.behavior=cl((game.behavior||0)+s.behavior,0,99);if(s.program)game.supportProgram={type,weeks:s.program};if(s.exposure)addExposure(s.exposure,s.name);if(type==='repair')adjustRelationship('family',2);note(s.name+' — Behavior +'+s.behavior+'.');persist();render()}
window.part9Support=support;
function sharePost(){if((game.plan?.social||0)<1){feedback='Allocate some social time before posting.';render();return}const m=game.socialMedia||(game.socialMedia={followers:0,posts:0,engagement:0});const week=game.year+':'+game.yearWeeks;if(m.lastPostWeek===week){feedback='You already posted this week.';render();return}m.lastPostWeek=week;const tier=game.exposure?.tier||'Unknown';const base=tier==='National'?18000:tier==='Regional'?350:tier==='Local'?35:3;const gain=R(base,base*4)+Math.floor((game.exposure?.score||0)/5);m.followers+=gain;m.posts++;m.engagement=cl((m.engagement||0)+R(0,3),0,99);if(m.posts%3===0)addExposure(1,'Social media recognition');note('Posted a public update and gained '+gain+' followers.');persist();render()}
window.part9Post=sharePost;
const oldBuyItem=buyItem;
const newProducts=[{id:'trainer',name:'Personal training session',price:65,hours:2,description:'Targeted training coaching; improves progress on your current focus skills. Still requires training time.'},{id:'gym',name:'Gym membership (8 weeks)',price:95,hours:0,description:'Improves training efficiency for eight weeks.'},{id:'equipment',name:'Home workout equipment',price:180,hours:0,description:'Reusable equipment that modestly improves training progress.',once:true},{id:'event',name:'Community or school event',price:25,hours:3,description:'Builds relationships and can generate local exposure.'},{id:'discretion',name:'Personal entertainment',price:35,hours:2,description:'Improves morale while spending time and money.'}];
MARKET.push(...newProducts);
buyItem=function(id){if(!newProducts.some(x=>x.id===id))return oldBuyItem(id);const item=newProducts.find(x=>x.id===id);game.purchases=game.purchases||{};if(item.once&&game.purchases[id]){feedback='Already owned.';render();return}if(game.money<item.price){feedback='Not enough money.';render();return}if(allHours()+item.hours>hoursCap()){feedback='Not enough free hours.';render();return}game.money-=item.price;game.activityHoursThisWeek=(game.activityHoursThisWeek||0)+item.hours;if(item.once)game.purchases[id]=true;if(id==='trainer'){for(const g of trainingGroups())if(game.focus[g[0]]>0)for(const k of g[2])awardProgress(k,1);}if(id==='gym')game.gymWeeks=8;if(id==='event'){adjustRelationship('teammate',2);addExposure(1,'Community event');}if(id==='discretion')game.morale=cl(game.morale+3,0,100);if(id==='equipment')game.trainingEquipment=true;ledgerEntry('expense',item.price,item.name);note('Spent $'+item.price+' on '+item.name+'.');persist();render()};
const oldRender=render;
let plannerOpen=false, lifeTab='Personal';
function normalizeEvent(){
 const ev=game?.scheduledEvent;if(!ev||ev.part9Choices)return;
 const q0=qualityWindow(game.behavior||0),labels=['Escalate or lash out','React aggressively','Respond dismissively','Remain neutral','Respond responsibly','Show leadership and help'];
 ev.part9Choices=true;ev.responseQuality=[q0,q0+1,q0+2];ev.sourceChoices=(ev.choices||[]).slice();
 ev.choices=ev.responseQuality.map(q=>[labels[q],q<=1?'The situation becomes worse.':q===2?'Your response was careless.':q===3?'You avoid making the situation worse.':q===4?'You act responsibly.':'You demonstrate maturity and leadership.',q-3,q]);
}
window.part9NewCareer=()=>{
 if(!confirm('Start a new career? This deletes this v0.6 save on this device. Export your career first if you want a backup.'))return;
 localStorage.removeItem(KEY);game=null;family=null;rolls=5;allocation={};creatorDetails={name:'Jordan Carter',school:0,bg:'working',height:69,weight:155,hometown:'',jersey:7,hand:'Right'};
 render();
};
function injectNavigation(){if(!game)return;const host=document.getElementById('app');const bottom=host.querySelector('.shell-bottom');if(!bottom)return;
 const stage=game.stage||'highschool';const items=[['home','Home','⌂'],['profile','Player','♙'],['team','Team','♜'],['develop','Development','↗'],['life','Life','♥'],['recruiting','Recruiting','★']];
 bottom.replaceChildren();for(const [id,label,icon] of items){const b=document.createElement('button');b.className='shell-nav-button'+(tab===id?' selected':'');b.type='button';b.innerHTML='<span class="shell-icon">'+icon+'</span><span>'+label+'</span>';b.addEventListener('click',()=>{plannerOpen=false;tab=id;render()});bottom.appendChild(b)}
 const scroller=host.querySelector('.shell-scroll');if(!scroller)return;const extras=host.querySelector('.shell-section-tabs');if(extras)extras.style.display=tab==='home'?'none':'';
 if(tab==='home')injectHome(scroller,stage);
 if(tab==='life')injectLife(scroller,stage);
 if(tab==='recruiting'){injectExposure(scroller,stage);injectDevelopment(scroller);}
 if(tab==='profile')injectProfile(scroller);
 // Team retains its existing depth chart; repeated archetype cards removed.
 // Development contains actionable training only; tested benchmarks live in Recruiting.
 const head=host.querySelector('.shell-header');
 if(head&&!head.querySelector('.part9-archetype')){const who=head.querySelector('.shell-player-name');if(who){const label=document.createElement('span');label.className='part9-archetype';label.textContent=playerArchetype();who.appendChild(label)}}
 if(head&&!head.querySelector('.part9-save-tools')){const tools=document.createElement('div');tools.className='part9-save-tools';tools.innerHTML='<button class="alt" type="button" onclick="exportSave()">Export</button><button class="alt" type="button" onclick="part9NewCareer()">New Career</button>';head.appendChild(tools)}
 if(head&&!head.querySelector('.part9-header-context')){const context=document.createElement('div');context.className='part9-header-context';const name=stage==='college'||stage==='collegeComplete'?collegeState().program.name:game.school?.name||'—';const record=stage==='college'?collegeState().record||[0,0]:currentRecord();context.textContent=name+' · '+Math.floor(game.height/12)+' ft '+(game.height%12)+' in · '+game.weight+' lb · '+game.hand+' · '+record.join('–');head.appendChild(context)}
}

function playerArchetype(){
 const t=game.technicalAttributes||{},a=game.athleticAttributes||{};
 if(['RB','FB'].includes(game.pos))return (t.elusiveness||0)>=(t.breakTackle||0)?'Elusive Back':'Power Back';
 if(game.pos==='QB')return (a.speed||0)>(t.shortAccuracy||0)?'Mobile QB':'Pocket QB';
 if(['WR','TE'].includes(game.pos))return (a.speed||0)>(t.catching||0)?'Deep Threat':'Possession Target';
 return 'Developing '+game.pos;
}
function panelElement(title,html){const sec=document.createElement('section');sec.className='panel part9-panel';sec.innerHTML='<h2>'+title+'</h2>'+html;return sec}
window.part9SimSeason=()=>{
 if(!game||game.stage==='recruiting'||game.finished)return;
 const phase=game.phase,year=game.year,phaseName=PHASES[phase]?.name||'this phase';
 if(!confirm('Simulate to the end of '+phaseName+'? Important decisions will pause the simulation.'))return;
 let steps=0,stopped=false;
 while(game&&game.year===year&&game.phase===phase&&steps++<100){
   if(game.scheduledEvent){stopped=true;break;}
   const before=game.phase+':'+game.week+':'+game.games?.length+':'+game.gamePending;
   if(game.gamePending)simulateGame();else nextWeek();
   if(game?.scheduledEvent){stopped=true;break;}
   if(game&&before===game.phase+':'+game.week+':'+game.games?.length+':'+game.gamePending){stopped=true;break;}
 }
 feedback=stopped?'Season simulation paused for an important decision or progression blocker.':'Simulation complete: '+phaseName+'.';
 persist();render();
};
function injectHome(scroller,stage){
 const last=game.games?.[0],match=stage==='college'?null:currentMatchup();
 const team=stage==='college'?collegeState().program.name:game.school.name;
 const rec=stage==='college'?(collegeState().record||[0,0]):currentRecord();
 const nextName=match?.name||match?.opponentName||match?.opponent?.name||'Next matchup pending';
 const lastResult=last?'<strong>'+e(last.opponentName||'Opponent')+'</strong><p>'+(last.win?'Win':'Loss')+' '+e(last.score)+'–'+e(last.opp)+'</p><button class="alt" onclick="tab=\'career\';render()">Game report</button>':'<p>No recorded games yet.</p>';
 const summary='<div class="part9-home-cards"><div class="tile"><strong>Next opponent</strong><p>'+e(nextName)+'</p><small>'+e(team)+' · '+rec.join('–')+'</small><button class="alt" onclick="part9Opponent()">Season averages</button>'+(match?'<p class="muted">Offense '+e(match.opponentOffense??'—')+' · Defense '+e(match.opponentDefense??'—')+'</p>':'')+'</div><div class="tile"><strong>Recent result</strong>'+lastResult+'</div></div>';
 const plan=stage==='college'?collegeState().weeklyPlan:game.plan;
 const labels=stage==='college'?[['training','Training'],['study','Studying'],['recovery','Recovery']]:[['training','Training'],['study','Studying'],['work','Work'],['social','Personal'],['recovery','Recovery']];
 const cap=stage==='college'?40:hoursCap(),sum=Object.values(plan).reduce((s,v)=>s+(+v||0),0);
 const plannerHtml='<div class="part9-alloc-grid">'+labels.map(([k,name])=>'<div class="creator-stat"><div class="line"><span>'+name+'</span><strong>'+Number(plan[k]||0)+'h</strong></div><input aria-label="'+name+' hours" type="range" min="0" max="'+cap+'" value="'+Number(plan[k]||0)+'" oninput="part9Plan(\''+k+'\',this.value)"></div>').join('')+'</div><p class="muted">'+sum+' / '+cap+' hours allocated</p><button onclick="part9Done()">Done</button>';
 const summaryHtml='<div class="line"><strong>Weekly allocation</strong><strong>'+sum+' / '+cap+'h</strong></div><div class="part9-mini-stats">'+labels.map(([k,l])=>'<span>'+l+': '+Number(plan[k]||0)+'h</span>').join('')+'</div><button class="alt" onclick="part9Expand()">Adjust</button>';
 const newer=panelElement(plannerOpen?'Weekly allocation':'Home',plannerOpen?plannerHtml:summary+'<div class="part9-alloc-summary">'+summaryHtml+'</div>');
 scroller.replaceChildren(newer);
 if(plannerOpen)return;
 if(stage==='college'){
   const continueButton=document.createElement('button');continueButton.textContent='Open college football & advance';continueButton.onclick=()=>{tab='college';render()};scroller.appendChild(continueButton);return;
 }
 if(game.scheduledEvent){const ev=game.scheduledEvent;scroller.appendChild(panelElement('Important decision','<h3>'+e(ev.title)+'</h3><p>'+e(ev.body)+'</p>'+ev.choices.map((c,i)=>'<button class="choice" onclick="chooseEvent('+i+')">'+e(c[0])+'</button>').join('')))}
 const advance=document.createElement('button');advance.textContent=game.gamePending?'Simulate this game':'Advance toward next game';advance.disabled=Boolean(game.scheduledEvent)||allHours()>hoursCap();advance.onclick=()=>{if(game.gamePending)simulateGame();else nextWeek()};scroller.appendChild(advance);const sim=document.createElement('button');sim.className='alt';sim.textContent='Sim Season';sim.disabled=Boolean(game.scheduledEvent);sim.onclick=window.part9SimSeason;scroller.appendChild(sim);
}
function showDialog(title,body){const existing=document.querySelector('.part9-dialog');if(existing)existing.remove();const shade=document.createElement('div');shade.className='part9-dialog';shade.innerHTML='<div class="part9-dialog-box" role="dialog" aria-modal="true"><div class="line"><h2>'+e(title)+'</h2><button class="alt" onclick="part9CloseDialog()">Close</button></div>'+body+'</div>';document.body.appendChild(shade)}
window.part9CloseDialog=()=>document.querySelector('.part9-dialog')?.remove();
window.part9Report=()=>{const g=game.games?.[0];if(!g)return showDialog('Recent game','No recorded games yet.');const lines=[['Opponent',g.opponentName||'Opponent'],['Result',(g.win?'Win':'Loss')+' '+g.score+'–'+g.opp],['Squad',g.level||'—'],['Role',g.role||'—'],['Your performance',typeof gameStatsDescription==='function'?gameStatsDescription(g,game.pos):'See recorded play log']];showDialog('Recorded game box score','<div>'+lines.map(([k,v])=>'<div class="line"><span>'+e(k)+'</span><strong>'+e(v)+'</strong></div>').join('')+'</div><details><summary>Saved play log</summary>'+(g.plays||[]).map(x=>'<p class="muted">'+e(x)+'</p>').join('')+'</details>')};
window.part9Opponent=()=>{const m=game.stage==='college'?null:currentMatchup();if(!m)return showDialog('Upcoming opponent','No opponent has been scheduled.');const name=m.name||m.opponentName||m.opponent?.name||'Opponent';const rows=[['Strength',m.opponentStrength??m.strength],['Offense',m.opponentOffense],['Defense',m.opponentDefense],['Pass defense',m.opponentPassDefense]].filter(x=>x[1]!=null);showDialog(name+' · scouting','<p>Existing scouting estimates for this matchup:</p>'+rows.map(([k,v])=>'<div class="line"><span>'+e(k)+'</span><strong>'+e(v)+'</strong></div>').join('')+'<p class="muted">True opponent season averages are not yet stored by this build. No values are fabricated.</p>')};
window.part9Expand=()=>{plannerOpen=true;render()};window.part9Done=()=>{plannerOpen=false;render()};
window.part9Plan=(k,v)=>{if(game.stage==='college'){if(typeof collegeSetPlan==='function')collegeSetPlan(k,v);else collegeState().weeklyPlan[k]=Number(v)}else if(typeof alloc==='function')alloc(k,Number(v));else game.plan[k]=Number(v);render()};
function injectLife(scroller,stage){
 const oldSections=[...scroller.querySelectorAll(':scope > section.panel')];
 const personal=panelElement('Personal · Behavior & social life', '<div class="line"><span>Behavior</span><strong>'+(game.behavior||0)+'/99</strong></div><div class="line"><span>Social skills</span><strong>'+(game.socialSkills||0)+'</strong></div><h3>Support & personal development</h3><div class="buttons"><button class="alt" onclick="part9Support(\'counsel\')">Counseling · free</button><button class="alt" onclick="part9Support(\'mentor\')">Mentorship · free</button><button class="alt" onclick="part9Support(\'volunteer\')">Volunteer · free</button><button class="alt" onclick="part9Support(\'repair\')">Make amends · free</button><button class="alt" onclick="part9Support(\'therapy\')">Private support · $120</button></div><h3>Social media</h3><p>'+(game.socialMedia?.followers||0)+' followers · '+(game.socialMedia?.posts||0)+' posts</p><button class="alt" onclick="part9Post()">Share an update</button>');
 const switcher=document.createElement('div');switcher.className='part9-life-tabs';
 const names=[stage==='college'?'Academics':'Academics','Finances','Personal'];
 for(const n of names){const b=document.createElement('button');b.type='button';b.className=n===lifeTab?'active':'alt';b.textContent=n;b.onclick=()=>{lifeTab=n;render()};switcher.appendChild(b)}
 if(lifeTab==='Academics'&&game.stage!=='college'){
 const a=academicState(),now=COURSES.reduce((v,k)=>v+(a.courses[k]||0),0)/COURSES.length;
 const prior=a.weekReports?.[Math.min(2,(a.weekReports?.length||1)-1)];
 const was=prior?COURSES.reduce((v,k)=>v+(prior.courses[k]||0),0)/COURSES.length:now;
 const delta=now-was,arrow=delta>2?'↑':delta>.3?'↗':delta< -2?'↓':delta< -.3?'↘':'→';
 const trend=delta>.3?'Improving':delta<-.3?'Declining':'Stable';
 scroller.prepend(panelElement('Academic trend','<div class="line"><strong>Recorded GPA '+Number(game.gpa||0).toFixed(2)+'</strong><strong class="gpa-trend">'+arrow+' '+trend+'</strong></div><small>Course performance trend; official GPA updates at term end.</small>'));
 }
 scroller.prepend(personal);scroller.prepend(switcher);
 for(const section of oldSections){const h=section.querySelector(':scope > h2')?.textContent?.toLowerCase()||'';let category=/academ|course|gpa|school|eligib|grade|major|tutor|study/.test(h)?'Academics':/money|job|work|finance|store|econom|purchas|income|expense|nil|scholar|tuition|ledger/.test(h)?'Finances':'Personal';section.classList.toggle('subtab-hidden',category!==lifeTab)}
 personal.classList.toggle('subtab-hidden',lifeTab!=='Personal');
 const extras=document.getElementById('app').querySelector('.shell-section-tabs');if(extras)extras.style.display='none';
}
function injectExposure(scroller,stage){const x=game.exposure||{score:0,tier:'Unknown'},items=stage==='college'?'Pro days, scouting visits and Combine invitations are grouped here.':'7-on-7, summer camps, showcases and scout visits belong under Exposure.';
 const panel=panelElement('Exposure', '<div class="line"><strong>'+e(x.tier)+'</strong><strong>'+x.score+'/100</strong></div><div class="meter"><i style="width:'+x.score+'%"></i></div><details class="inline-help"><summary aria-label="What is exposure?">?</summary><p>'+e(items)+'</p><p>Exposure can grow through football, academic recognition, community events and social media. National recognition does not guarantee recruiting interest.</p></details>');scroller.prepend(panel)}
function injectProfile(scroller){const v=game.athleticAttributes,t=game.technicalAttributes;if(!v||!t)return;const make=(keys,data)=>'<div class="grid">'+keys.map(k=>'<div class="tile"><small>'+e(LABELS[k])+'</small><strong>'+clamp99(data[k])+'</strong></div>').join('')+'</div>';
 scroller.prepend(panelElement('Athletic attributes',make(ATHLETIC,v)));scroller.prepend(panelElement('Technical attributes',make(TECHNICAL,t)));scroller.prepend(panelElement('Personal attributes',make(PERSONAL,{behavior:game.behavior,academics:game.iq,socialSkills:game.socialSkills}))) }
function injectCoachUsage(scroller){const scheme=(game.stage==='college'?collegeState().program:game.school)?.scheme||'Balanced';const fam=POSITION_FAMILIES[game.pos]||'RB';const strengths=(CORE_BY_POSITION[fam]||CORE_BY_POSITION.RB).map(k=>[k,game.technicalAttributes?.[k]||0]).sort((a,b)=>b[1]-a[1]).slice(0,3);const usage=game.technicalAttributes?'<p>Coach philosophy: '+e(scheme)+'</p><p>Player strengths: '+strengths.map(([k,v])=>e(LABELS[k])+' '+v).join(' · ')+'</p><p class="muted">This report describes your skill fit. Position-specific snap allocation is still being integrated into the game simulator.</p>':'<p>Current usage follows the existing position and team scheme.</p>';scroller.prepend(panelElement('Coach · Archetype Usage',usage))}
function injectDevelopment(scroller){
 const reports=game.summer?.camps?.filter(x=>x.measurements)||[];
 if(!reports.length){scroller.appendChild(panelElement('Verified physical benchmarks','<p class="muted">No verified test results yet. Attend a combine to record your 40-yard dash, shuttle and vertical jump.</p>'));return;}
 const latest=reports[0],m=latest.measurements;
 const html='<div class="line"><span>40-yard dash</span><strong>'+e(m.forty)+' sec</strong></div>'+
 '<div class="line"><span>Shuttle</span><strong>'+e(m.shuttle)+' sec</strong></div>'+
 '<div class="line"><span>Vertical jump</span><strong>'+e(m.vertical)+' in</strong></div>'+
 '<small>Tested Year '+e(latest.year)+' · '+e(latest.name)+'</small>';
 scroller.appendChild(panelElement('Verified physical benchmarks',html));
}

const oldSetup=setupScreen;
window.part9CreatorHtml=creatorForm;
setupScreen=creatorForm;
render=function(){if(!game){document.body.classList.remove('game-shell-active');const el=document.getElementById('app');el.innerHTML=creatorForm();return}normalizeEvent();oldRender();injectNavigation()};
window.GRIDIRON_PART9={PARENTS,ATHLETIC,TECHNICAL,PERSONAL,LABELS,exposureTier,qualityWindow};
})();
