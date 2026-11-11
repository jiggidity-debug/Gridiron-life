/* Gridiron Life v0.6 — player systems and persistent professional league.
   Extends v0.591; preserves existing HS/college simulation and records. */
'use strict';
const V6_PRO_TEAMS=['Arlington Outlaws','Atlanta Firebirds','Baltimore Admirals','Boston Minutemen','Buffalo Blizzard','Carolina Copperheads','Chicago Forge','Cincinnati Kings','Cleveland Bulldogs','Dallas Wranglers','Denver Peaks','Detroit Motors','Green Bay Guardians','Houston Apollos','Indianapolis Racers','Jacksonville Sharks','Kansas City Monarchs','Las Vegas Aces','Los Angeles Comets','Los Angeles Royals','Miami Tides','Minnesota Northmen','Nashville Sound','New Orleans Voodoo','New York Empire','New York Sentinels','Philadelphia Liberty','Pittsburgh Iron','San Francisco Gold','Seattle Storm','Tampa Bay Pirates','Washington Federals'];
const V6_LABELS={speed:'Speed',accel:'Acceleration',agility:'Agility',strength:'Strength',jumping:'Jumping',stamina:'Stamina',catching:'Catching',elusiveness:'Elusiveness',breakTackle:'Break Tackle',carrying:'Ball Security',routes:'Route Running',release:'Release',runBlocking:'Run Blocking',passBlocking:'Pass Blocking',vision:'Ball Carrier Vision',decisionMaking:'Decision Making',playRecognition:'Play Recognition',blockRecognition:'Blocking Recognition',throwPower:'Throw Power',shortAccuracy:'Short Accuracy',deepAccuracy:'Deep Accuracy',pocketPresence:'Pocket Presence',manCoverage:'Man Coverage',pressCoverage:'Press Coverage',ballSkills:'Ball Skills',tackling:'Tackling',passRush:'Pass Rush',blockShedding:'Block Shedding',runDefense:'Run Defense',kickPower:'Kick Power',kickAccuracy:'Kick Accuracy',puntTechnique:'Punt Technique'};
const V6_TRAITS=['Discipline','Work Ethic','Sociability','Playfulness','Competitiveness','Curiosity','Coachability'];
const V6_SCHEMES=['Power Run','Inside Zone','Outside Zone','Spread','West Coast','Air Raid','Pro Style','Wishbone'];
const V6_TREES={
 RB:{Carrier:[['Stiff Arm','breakTackle'],['Truck','breakTackle'],['Juke','elusiveness'],['Spin','agility'],['Ball Security','carrying']],Receiving:[['Flat','routes'],['Swing','routes'],['Angle','routes'],['Wheel','routes'],['Screen','catching'],['Option','routes']],Blocking:[['Blitz Pickup','passBlocking'],['Chip Block','runBlocking'],['Lead Block','runBlocking']]},
 QB:{Passing:[['Quick Release','release'],['Deep Ball','deepAccuracy'],['Touch Pass','shortAccuracy'],['Throw On Run','agility']],Pocket:[['Step Up','pocketPresence'],['Escape','agility'],['Read Pressure','pocketPresence']],Knowledge:[['Coverage Read','playRecognition'],['Audible','decisionMaking']]},
 WR:{Receiving:[['Slant','routes'],['Out','routes'],['Post','routes'],['Go','routes'],['Curl','routes'],['Corner','routes'],['Wheel','routes'],['Option','routes']],Release:[['Press Release','release'],['Stem','routes'],['Double Move','routes']],Blocking:[['Stalk Block','runBlocking'],['Crack Block','runBlocking']]},
 OL:{Blocking:[['Drive Block','runBlocking'],['Reach Block','runBlocking'],['Pull','runBlocking'],['Pass Set','passBlocking'],['Anchor','strength']]},
 DL:{Rush:[['Bull Rush','passRush'],['Swim','passRush'],['Rip','passRush'],['Spin Rush','passRush']],Run:[['Gap Control','runDefense'],['Shed','blockShedding']]},
 LB:{Tackling:[['Wrap Up','tackling'],['Pursuit','speed']],Coverage:[['Flats','zoneCoverage'],['Hook','zoneCoverage'],['Curl','zoneCoverage'],['Man','manCoverage']],Rush:[['Blitz','passRush']]},
 DB:{Coverage:[['Press','pressCoverage'],['Mirror','manCoverage'],['Backpedal','agility'],['Bail','manCoverage'],['Trail','manCoverage'],['Recovery','speed']],Zones:[['Flats','zoneCoverage'],['Hook','zoneCoverage'],['Curl','zoneCoverage'],['Deep Halves','zoneCoverage'],['Deep Thirds','zoneCoverage'],['Quarters','zoneCoverage'],['Robber','zoneCoverage']],Ball:[['High Point','ballSkills'],['Break on Ball','playRecognition']]},
 ST:{Specialist:[['Placement','kickAccuracy'],['Power','kickPower'],['Directional Punt','puntTechnique'],['Hang Time','puntTechnique']]}
};
function v6Family(){return POSITION_FAMILIES[game.pos]||'RB'}
function v6Tree(){const f=v6Family();return V6_TREES[f]||V6_TREES.RB}
function v6Base(attr){return cl(Math.round(skillValue(attr)||35),0,99)}
function v6State(){
 if(!game)return null;
 if(!game.v6){const b=Number(game.behavior??50),s=Number(game.socialSkills??50),c=Number(game.coachTrust??50);
  game.v6={schema:1,mentalFatigue:cl(Math.round(Number(game.stress||12)*.35),0,100),personality:{Discipline:b,'Work Ethic':cl(45+Math.round(c*.20),0,99),Sociability:s,Playfulness:60,Competitiveness:70,Curiosity:60,Coachability:cl(35+Math.round(c*.35),0,99)},techniques:{},schemeKnowledge:{},teamPlaybooks:{},filmChoice:'Pay Attention',trainingFocus:null,lastFilmKey:'',theme:{mode:'team',custom:'blue'},warningAcknowledged:'',reputation:{coach:c,teammates:cl(Number(game.relationship||50),0,99),scouts:40},events:[],careerMode:'Player'};
 }
 const v=game.v6;
 v.personality=v.personality||{};v.techniques=v.techniques||{};v.schemeKnowledge=v.schemeKnowledge||{};v.teamPlaybooks=v.teamPlaybooks||{};v.theme=v.theme||{mode:'team',custom:'blue'};v.reputation=v.reputation||{coach:50,teammates:50,scouts:40};v.events=v.events||[];v.mentalFatigue=cl(Number(v.mentalFatigue)||0,0,100);
 for(const t of V6_TRAITS)if(!Number.isFinite(v.personality[t]))v.personality[t]=50;
 return v;
}
function v6TechniqueId(group,name){return group+'::'+name}
function v6Technique(group,name,attr){const v=v6State(),id=v6TechniqueId(group,name);if(!Number.isFinite(v.techniques[id]))v.techniques[id]=cl(Math.round(v6Base(attr)*.55),0,99);return v.techniques[id]}
function v6Badge(level){return level>=90?'Gold':level>=75?'Silver':level>=60?'Bronze':''}
function v6TeamName(){return game.stage==='nfl'||game.stage==='nflEntry'?game.v6?.nfl?.team?.name||'Free Agent':game.stage==='college'||game.stage==='collegeComplete'?game.college?.program?.name||'College':game.school?.name||'School'}
function v6LearnedScheme(scheme){const v=v6State();const s=scheme||'Pro Style';if(!Number.isFinite(v.schemeKnowledge[s]))v.schemeKnowledge[s]=s===v6CurrentScheme()?30:5;return v.schemeKnowledge[s]}
function v6CurrentScheme(){return game.stage==='nfl'?game.v6?.nfl?.team?.scheme||'Pro Style':game.stage==='college'||game.stage==='collegeComplete'?game.college?.program?.scheme||'Spread':game.school?.scheme||'Power Run'}
function v6Playbook(){const v=v6State(),key=v6TeamName();if(!v.teamPlaybooks[key])v.teamPlaybooks[key]={name:key,knowledge:8};return v.teamPlaybooks[key]}
function v6SchemeFit(scheme){const family=v6Family(),a=v6Base,sp=a('speed'),ag=a('agility'),st=a('strength'),bt=a('breakTackle'),route=a('routes'),vis=a('vision');let fit;
 if(family==='RB')fit=/Outside Zone/.test(scheme)?sp*.38+ag*.32+vis*.30:/Power|Wishbone/.test(scheme)?st*.34+bt*.39+vis*.27:/Spread|Air Raid|West Coast/.test(scheme)?sp*.2+route*.43+a('catching')*.37:vis*.40+ag*.27+bt*.33;
 else if(family==='WR')fit=sp*.35+route*.45+a('catching')*.20;
 else if(family==='QB')fit=a('decisionMaking')*.35+a('shortAccuracy')*.35+a('throwPower')*.30;
 else fit=rating(game.attrs,game.pos);
 return cl(Math.round(fit),0,99);
}
function v6WeekId(){return game.stage==='nfl'?'NFL-'+game.v6.nfl.year+'-'+game.v6.nfl.phase+'-'+game.v6.nfl.week:game.stage==='college'?'C-'+game.college.year+'-'+game.college.week+'-'+game.college.phase:'HS-'+game.year+'-'+game.phase+'-'+game.week}
function v6Film(choice){const v=v6State();if(!['Goof Off','Sleep','Pay Attention','Take Notes'].includes(choice))return;
 const key=v6WeekId();if(v.lastFilmKey===key){feedback='Film session already completed this week.';render();return}
 const impact={'Goof Off':-4,Sleep:-12,'Pay Attention':5,'Take Notes':9}[choice];
 v.mentalFatigue=cl(Math.round(v.mentalFatigue+(choice==='Take Notes'?4:choice==='Pay Attention'?2:-8)),0,100);
 if(impact>0){const s=v6CurrentScheme();v.schemeKnowledge[s]=cl(v6LearnedScheme(s)+Math.max(1,Math.round(impact*(1-v.mentalFatigue/180)*(v.personality.Coachability/100+.45))),0,99);v6Playbook().knowledge=cl(v6Playbook().knowledge+Math.max(1,Math.round(impact*.65)),0,99)}
 if(choice==='Goof Off')v.reputation.coach=cl(v.reputation.coach-2,0,99);
 v.filmChoice=choice;v.lastFilmKey=key;v.events.unshift('Film session: '+choice+' ('+key+').');v.events=v.events.slice(0,50);feedback='Film completed: '+choice+'.';persist();render();
}
function v6TrainFocus(group,name){const v=v6State();v.trainingFocus={group,name};feedback='Individual technique focus set: '+name+'. Progress applies during football weeks.';persist();render()}
function v6ApplyGrowth(n=1){const v=v6State(),focus=v.trainingFocus,mental=v.mentalFatigue;let amount=cl((.9+v.personality['Work Ethic']/120+v.personality.Coachability/180-mental/160)*n,.15,3.4);
 if(focus){const node=(v6Tree()[focus.group]||[]).find(x=>x[0]===focus.name);if(node){const id=v6TechniqueId(focus.group,focus.name);v.techniques[id]=cl(v6Technique(...[focus.group,...node])+amount*(1+Number(game.extraIntensity||2)*.3),0,99);}}
 const s=v6CurrentScheme(),p=v6Playbook();v.schemeKnowledge[s]=cl(v6LearnedScheme(s)+amount*.65,0,99);p.knowledge=cl(p.knowledge+amount,0,99);
}
function v6LoadChange(isCollege){const v=v6State(),plan=isCollege?game.college?.weeklyPlan:game.plan;
 const training=Number(plan?.training||0),study=Number(plan?.study||0),recovery=Number(plan?.recovery||0),ext=Number(game.extraIntensity||2);
 const load=training*(.12+ext*.07)+study*.12+(Number(game.fatigue||0)>55?3:0);
 v.mentalFatigue=cl(Math.round((v.mentalFatigue+load-recovery*.65-4)*10)/10,0,100);
 v.reputation.coach=cl(Math.round(Number(game.coachTrust||v.reputation.coach)),0,99);
 v6ApplyGrowth(isCollege?1.4:1);
}
const v6OldCollegeAdvance=collegeAdvancePlayerWeek;
collegeAdvancePlayerWeek=function(result,role){v6OldCollegeAdvance(result,role);if(game)v6LoadChange(true)};
// Fictional professional world; names/ratings persist in each career save.
function v6League(){const v=v6State();if(!v.nfl)v.nfl={status:'unentered',year:1,phase:'entry',week:0,offers:[],team:null,rosterStatus:'Unsigned',positionRank:0,record:[0,0],schedule:[],games:[],history:[],news:[],seasonHistory:[],contracts:[],salary:0,contractYears:0,playerAge:22,proTeams:V6_PRO_TEAMS.map((name,id)=>({id,name,scheme:V6_SCHEMES[(id*7+3)%V6_SCHEMES.length],strength:cl(68+(id*13)%19,60,94),record:[0,0]})),campPerformance:0,tryoutUsed:false,playoffRound:0,gamePlan:'Balanced'};return v.nfl}
// Draft prospect grade: current ratings plus college production, level, scouting showcases and season honors.
function v6DraftGrade(){const c=game.college,games=c?.games||[],starts=games.filter(g=>g.role==='Starter').length,production=Math.min(14,Math.floor(starts/4));
 const best=Array.isArray(c?.showcases)?Math.max(0,...c.showcases.map(x=>Number(x.scoutingBoost||0))):0;
 const honors=Array.isArray(c?.honors)?c.honors.filter(h=>h.kind==='season'&&(/All-American|Player of the Year| of the Year/.test(h.title))).length:0;
 return cl(Math.round(rating(game.attrs,game.pos)+production+(c?.program?.tier==='FBS'?2:0)-(game.health?.injuryHistory?.length||0)*.6)+best+Math.min(3,honors),30,99)}
// Professional rating: current ratings plus a small bonus for proven NFL starts.
function v6ProRating(){const n=v6League(),starts=(n.games||[]).filter(g=>g.role==='Starter').length;return cl(rating(game.attrs,game.pos)+Math.min(4,Math.floor(starts/16)),30,99)}
/* ---------- Professional lifecycle: one implementation ---------- */
// Contract values are derived from player rating; rookies use the draft-slot scale.
function v6MarketValue(mr){const family=v6Family(),base=mr<60?750000:750000+Math.pow(mr-60,2)*9000;return Math.max(750000,Math.round(base*(family==='ST'?.35:1)/5000)*5000)}
function v6ContractYears(mr){const age=Number(v6League().playerAge||25);return Math.min(mr>=82?4:mr>=74?3:mr>=66?2:1,age>=32?2:4)}
function v6MarketRating(){return rating(game.attrs,game.pos)+(v6League().positionRank===1?2:0)}
// Seven rounds across the grade range. Specialists are drafted late regardless of grade.
function v6DraftRound(grade){let r=grade>=91?1:grade>=87?2:grade>=83?3:grade>=79?4:grade>=75?5:grade>=71?6:grade>=67?7:0;
 const floor={K:5,P:5,LS:6}[game.pos]||0;return r&&floor?Math.max(r,floor):r}
const V6_ROOKIE_SCALE=[0,5000000,2600000,1700000,1350000,1100000,950000,850000];
function v6RookieDeal(round){return round?{type:'Draft rights',yearly:V6_ROOKIE_SCALE[round],years:4}:{type:'Undrafted free-agent camp',yearly:750000,years:1}}
function v6NFLDeclare(){if(!game?.college||!['collegeComplete','college'].includes(game.stage))return;
 const c=game.college;if(game.stage==='college'&& !(c.phase==='offseason'&&c.eligibilityUsed>=3)){feedback='NFL entry requires college completion or an eligible late-college offseason.';render();return}
 if(game.stage==='college'&&!confirm('Declare for the pro draft? Remaining college eligibility will end.'))return;
 const n=v6League();if(n.status!=='unentered')return;
 const grade=v6DraftGrade(),round=v6DraftRound(grade),deal=v6RookieDeal(round);n.draftGrade=grade;n.draftRound=round;n.playerAge=cl(18+Number(c.year||4),20,25);
 const available=n.proTeams.map(p=>({teamId:p.id,fit:cl(Math.round(60-Math.abs(v6SchemeFit(p.scheme)-grade)*.4+(p.strength-grade)*.15),20,90)})).sort((a,b)=>b.fit-a.fit);
 n.offers=available.slice(0,round?2:4).map((o,i)=>({...o,type:deal.type,yearly:Math.round(deal.yearly*(1+i*.02)),years:deal.years}));
 n.status='entry';n.phase='entry';n.news.unshift({title:round?'Draft projection: Round '+round:'Undrafted free-agent pathway',body:'Evaluation based on existing player ratings, college starts, level and available medical history.'});game.stage='nflEntry';feedback='Professional entry offers available. Choose a club to start training camp.';persist();render();
}
function v6NFLSign(id){const n=v6League(),offer=(n.offers||[]).find(o=>o.teamId===Number(id));if(!offer||!['entry','freeAgency','released'].includes(n.status))return;
 const team=n.proTeams.find(x=>x.id===offer.teamId),inOffseason=n.phase==='offseason';
 n.team=team;n.salary=offer.yearly;n.contractYears=offer.years;n.offers=[];
 if(inOffseason){n.status='offseason';n.rosterStatus='Signed'}else{n.status='camp';n.phase='camp';n.week=1;n.campPerformance=0;n.rosterStatus='Camp'}
 n.contracts.push({year:n.year,age:n.playerAge,team:team.name,salary:n.salary,years:n.contractYears,type:offer.type});n.history.unshift('Signed with '+team.name+' ('+offer.type+').');n.news.unshift({title:game.name+' joins '+team.name,body:offer.type+' · $'+n.salary.toLocaleString()+' yearly · '+n.contractYears+' year(s).'});game.stage='nfl';persist();render();
}
// kind: 'market' (contract expired; the incumbent club may re-sign) or 'tryout' (released). Returns false when no club is interested.
function v6NFLOffers(kind){const n=v6League(),mr=v6MarketRating(),inc=kind==='market'?n.team:null;
 if(mr<55){n.offers=[];return false}
 const fit=p=>cl(Math.round(75-Math.abs(mr-p.strength)*.7+R(-9,9)+(inc&&p.id===inc.id?8:0)),20,98);
 const teams=n.proTeams.filter(p=>!(inc&&p.id===inc.id)||kind==='market').map(p=>({teamId:p.id,fit:fit(p)})).sort((a,b)=>b.fit-a.fit);
 const top=teams.slice(0,3);if(kind==='market'&&inc&&!top.some(o=>o.teamId===inc.id)){const mine=teams.find(o=>o.teamId===inc.id);if(mine)top[2]=mine}
 const tryout=kind==='tryout'||mr<68,years=tryout?1:v6ContractYears(mr),value=v6MarketValue(mr);
 n.offers=top.map(o=>({...o,type:tryout?'Free-agent tryout':inc&&o.teamId===inc.id?'Re-sign':'Free-agent contract',yearly:tryout?750000:Math.round(value*cl(1+(o.fit-60)/300,.9,1.15)/5000)*5000,years}));
 n.status='freeAgency';if(n.phase!=='offseason'){n.phase='freeAgency';n.team=null;n.rosterStatus='Unsigned'}
 n.history.unshift(kind==='market'?'Free agency opened.':'Open tryouts available.');return true;
}
function v6NFLEnd(reason){const n=v6League();n.phase='retired';n.status='retired';n.offers=[];n.retireReason=reason;n.history.unshift(reason+' ('+n.year+' professional calendar year(s), age '+n.playerAge+').');n.news.unshift({title:'Career over',body:reason});persist();render()}
// Cut from camp: the club is gone for the rest of the calendar year. Interest is re-evaluated from the player's rating when free agency opens.
function v6RecordUnsignedSeason(){
 const n=v6League();
 // A year can be released from camp, remain unsigned, then be processed at
 // year-end. Record that year once, never the following year prematurely.
 if(!n.seasonHistory.some(s=>s.year===n.year))n.seasonHistory.push({year:n.year,team:'Unsigned',record:[0,0],status:'Unsigned',games:0});
}
function v6NFLCut(){const n=v6League();n.team=null;n.contractYears=0;n.salary=0;n.rosterStatus='Released';n.positionRank=0;n.offers=[];
 n.news.unshift({title:'Roster cut',body:'Did not survive camp. Free-agent interest is reviewed when free agency opens.'});
 v6RecordUnsignedSeason();
 n.status='unsigned';n.phase='offseason';n.week=0;n.offseasonWeeks=0;n.history.unshift('Released in camp: unsigned for the rest of year '+n.year+'.');
}
function v6NFLAdvance(){const n=v6League();if(game.stage!=='nfl')return;
 if(n.phase==='camp'){
  let effort=Number(game.teamIntensity||2),load=Number(game.extraIntensity||2),mental=v6State().mentalFatigue;
  const performance=cl(Math.round(v6ProRating()-n.team.strength+15+effort*1.4-mental*.07-game.fatigue*.08+R(-7,7)),0,50);
  n.campPerformance+=performance;n.week++;game.fatigue=cl(game.fatigue+3+load*2-Number(game.plan?.recovery||6)*.3,0,100);v6LoadChange(false);developWeek();
  n.history.unshift('Camp evaluation '+(n.week-1)+': '+performance+' points.');
  if(n.week>4){const score=n.campPerformance/4-4.5+v6ProRating()-n.team.strength+(n.year===1&&n.draftRound?Math.max(0,(6-n.draftRound)*4):0);
   n.rosterStatus=score>=-3?'Active roster':score>=-9?'Practice squad':'Released';n.positionRank=n.rosterStatus==='Active roster'?(score>=5?1:2):n.rosterStatus==='Practice squad'?4:9;
   if(n.rosterStatus==='Released')v6NFLCut();
   else{n.history.unshift('Final cuts: '+n.rosterStatus+'.');n.news.unshift({title:'Final roster decision',body:game.name+' secured '+n.rosterStatus.toLowerCase()+' status with '+n.team.name+'.'});v6NFLStartSeason()}
  }
  persist();render();return;
 }
 if(n.phase==='regular'||n.phase==='playoffs')v6NFLGame();
 else if(n.phase==='offseason')v6NFLOffseasonWeek();
}
function v6NFLFinishSeason(){const n=v6League();n.seasonHistory.push({year:n.year,team:n.team?.name||'Free Agent',record:n.record.slice(),status:n.rosterStatus,games:n.games.filter(g=>g.year===n.year).length});
 n.phase='offseason';n.status='offseason';n.week=0;n.offseasonWeeks=0;n.contractYears=Math.max(0,n.contractYears-1);
 n.history.unshift('NFL Year '+n.year+' complete: '+n.record.join('–')+'. The full offseason calendar is available for preparation.');
 if(n.contractYears===0)n.news.unshift({title:'Contract expired',body:'Free agency will open during the offseason calendar.'});
 persist();
}
function v6NFLOffseasonWeek(){const n=v6League();if(game.stage!=='nfl'||n.phase!=='offseason')return;
 n.offseasonWeeks=Number(n.offseasonWeeks||0);
 if(n.offseasonWeeks>=careerOffseasonWeeks('nfl')){feedback='NFL offseason complete. Continue to camp or free agency.';render();return}
 const prev=game.fatigue,rest=Number(game.plan?.recovery||0),train=Number(game.plan?.training||0);
 developWeek();
 game.fatigue=cl(Math.round((game.fatigue+train*(.11+.06*Number(game.extraIntensity||2))-5.5-rest*.82)*10)/10,0,100);
 const health=healthState();
 health.wear=cl(Math.round((health.wear-Math.max(.35,.95+rest*.16-train*.045))*100)/100,0,100);
 game.stress=cl(game.stress+.4+train*.04-rest*.13-Number(game.plan?.social||0)*.09,0,100);
 game.morale=cl(game.morale+Number(game.plan?.social||0)*.18+rest*.03,0,100);
 if(game.injury){game.injury.weeks=Math.max(0,game.injury.weeks-1);if(!game.injury.weeks)game.injury=null}
 n.offseasonWeeks++;n.week=n.offseasonWeeks;
 if(n.offseasonWeeks===8&&n.contractYears===0&&['offseason','unsigned'].includes(n.status)){
  const kind=n.status==='unsigned'?'tryout':'market';
  if(v6NFLOffers(kind))n.news.unshift({title:'Free agency opens',body:'Review contract offers during the offseason, then continue weekly preparation.'});
  else{n.status='unsigned';n.team=null;n.news.unshift({title:'No offers',body:'No club showed interest this offseason. Keep training and re-enter the market next year.'})}
 }
 if(n.offseasonWeeks===12)n.news.unshift({title:'NFL Draft',body:'The annual rookie draft has concluded; clubs continue offseason roster evaluations.'});
 if(n.offseasonWeeks===19)n.news.unshift({title:'Organized team activities',body:'Teams hold practices and prepare their playbooks before training camp.'});
 n.history.unshift(careerCalendarPeriod('nfl',n.week)+' W'+n.week+': fatigue '+prev.toFixed(0)+' → '+game.fatigue.toFixed(0)+'; training completed.');
 n.history=n.history.slice(0,250);
 v603OffseasonNotice('NFL',n.week);persist();render();
}
// Retirement: players leave when age and rating no longer support a roster spot.
function v6NFLRetireReason(){
 const n=v6League(),ovr=rating(game.attrs,game.pos),age=n.playerAge;
 const wearPenalty=physicalAgePenalty(),limit=34+agingOffset();
 const effectiveAge=age+wearPenalty;
 // Repeatedly unsigned players can leave the game earlier, without treating
 // one camp cut as a career-ending event.
 const unsignedYears=n.seasonHistory.filter(s=>s.status==='Unsigned').length;
 if(effectiveAge>=limit+4)return 'Retired at age '+age+' after a long career.';
 if(effectiveAge>=limit&&ovr<75)return 'Retired at age '+age+' as skills declined.';
 if(effectiveAge>=limit-3&&ovr<60&&unsignedYears>=2)return 'Retired at age '+age+' after extended time without a roster spot.';
 return null;
}
function v6NFLNextYear(){const n=v6League();if(n.phase!=='offseason')return;
 if(Number(n.offseasonWeeks||0)<careerOffseasonWeeks('nfl')){feedback='Complete '+(careerOffseasonWeeks('nfl')-Number(n.offseasonWeeks||0))+' more NFL offseason weeks.';render();return}
 if(n.status==='freeAgency'&&n.offers?.length){feedback='Sign a contract to enter the next training camp.';render();return}
 const signed=n.team&&n.contractYears>0;
 if(!signed)v6RecordUnsignedSeason();
 n.year++;n.playerAge++;n.offseasonWeeks=0;n.campPerformance=0;
 const notes=applyAging();if(notes.length)n.history.unshift('Aging: '+notes.join(', ')+'.');
 const why=v6NFLRetireReason();if(why)return v6NFLEnd(why);
 if(!signed){
  n.team=null;n.status='unsigned';n.offers=[];n.week=0;n.rosterStatus='Unsigned';
  // The expired year has finished. The next unsigned year is recorded only
  // after the player actually spends that year unsigned.
  n.history.unshift('Unsigned for professional year '+n.year+'.');persist();render();return;
 }
 n.phase='camp';n.status='camp';n.week=1;n.rosterStatus='Camp';n.history.unshift('Preparing for professional year '+n.year+'.');persist();render();
}
function v6NFLRetire(){if(!confirm('Retire from professional football? This ends on-field play, but keeps your career history.'))return;v6NFLEnd('Chose to retire')}

function v6NFLStartSeason(){const n=v6League();n.phase='regular';n.status='season';n.week=1;n.record=[0,0];n.playoffRound=0;n.schedule=Array.from({length:17},(_,i)=>{const idx=(n.team.id+i*5+7)%32;return {week:i+1,opponentId:idx===n.team.id?(idx+1)%32:idx}});for(const team of n.proTeams)team.record=[0,0];n.history.unshift('NFL season '+n.year+' begins.');persist();render()}
function v6Recover(kind){const v=v6State(),key=v6WeekId();if(v.recoveryKey===key){feedback='Recovery activity already used this week.';render();return}
 if(!['Sleep','Relax','Rehab'].includes(kind))return;
 const plan=game.stage==='college'?game.college?.weeklyPlan:game.plan;
 if(Number(plan?.recovery||0)<3){feedback='Allocate at least 3 weekly recovery hours first.';render();return}
 if(kind==='Rehab'&&!game.injury){feedback='No medical rehabilitation required.';render();return}
 v.recoveryKey=key;
 if(kind==='Sleep'){game.fatigue=cl(game.fatigue-8,0,100);v.mentalFatigue=cl(v.mentalFatigue-12,0,100)}
 else if(kind==='Relax'){game.fatigue=cl(game.fatigue-3,0,100);v.mentalFatigue=cl(v.mentalFatigue-10,0,100);game.morale=cl(game.morale+2,0,100)}
 else{game.injury.weeks=Math.max(0,game.injury.weeks-1);game.fatigue=cl(game.fatigue-5,0,100);if(!game.injury.weeks){game.injury=null;v.events.unshift('Rehabilitation completed; medically available after recovery.')}}
 v.events.unshift(kind+' recovery ('+key+').');v.events=v.events.slice(0,50);feedback=kind+' recovery completed.';persist();render();
}
function v6NFLStatLine(s){return typeof profileStatLine==='function'?profileStatLine({games:1,starts:1,...s},game.pos):'Game completed'}
function v6NFLGame(){const n=v6League();if(!['regular','playoffs'].includes(n.phase)||!n.team)return;
 const isPlayoff=n.phase==='playoffs';const match=isPlayoff?n.playoffOpponent:n.schedule[n.week-1];if(!match){n.phase='offseason';persist();render();return}
 const opp=n.proTeams.find(x=>x.id===match.opponentId),ovr=rating(game.attrs,game.pos),role=game.injury?'Out (Medical)':n.rosterStatus==='Practice squad'?'Practice squad':n.positionRank===1?'Starter':'Rotation';
 const active=role==='Starter'||role==='Rotation',share=active?(n.positionRank===1?1:.48):0;
 const fit=v6SchemeFit(n.team.scheme),knowledge=v6LearnedScheme(n.team.scheme),mental=v6State().mentalFatigue;
 const modifier=cl((n.team.strength-opp.strength)*.15+(active?(ovr-opp.strength)*.17+(fit-60)*.06+(knowledge-50)*.03-mental*.035-game.fatigue*.028:0),-13,13);
 const score=cl(Math.round(R(13,34)+modifier+(n.gamePlan==='Aggressive'?3:n.gamePlan==='Conservative'?-2:0)),0,56);
 let against=cl(Math.round(R(13,34)+(opp.strength-n.team.strength)*.25),0,56);if(score===against)against++;
 const stats={carries:0,rushYards:0,rushTD:0,receptions:0,recYards:0,recTD:0,passAtt:0,passComp:0,passYards:0,passTD:0,interceptions:0,tackles:0,tfl:0,sacks:0,passDef:0,defInt:0,offSnaps:0,defSnaps:0,blocks:0,pressures:0,fgAtt:0,fgMade:0,xpAtt:0,xpMade:0,punts:0,puntYards:0,longSnaps:0};
 if(active){const fam=v6Family(),pace=cl((ovr-65)/120+.5,.25,.79);
  if(fam==='RB'){stats.carries=Math.round(R(9,23)*share);stats.rushYards=Math.max(-6,Math.round(stats.carries*(R(24,55)/10+modifier*.12)));stats.rushTD=Math.min(3,Math.floor(stats.rushYards/65)+Number(Math.random()<.22));stats.receptions=Math.round(R(1,6)*share);stats.recYards=stats.receptions*R(4,13);stats.recTD=Number(stats.recYards>55&&Math.random()<.3)}
  else if(fam==='QB'){stats.passAtt=Math.round(R(22,40)*share);stats.passComp=Math.round(stats.passAtt*cl(pace+.05,.35,.80));stats.passYards=Math.round(stats.passComp*(R(7,14)));stats.passTD=Math.min(5,Math.floor(stats.passYards/115));stats.interceptions=R(0,Number(stats.passAtt>20?2:1))}
  else if(fam==='WR'||game.pos==='TE'){stats.receptions=Math.round(R(2,10)*share);stats.recYards=stats.receptions*R(7,18);stats.recTD=Math.min(3,Math.floor(stats.recYards/65))}
  else if(fam==='DB'||fam==='LB'||fam==='DL'){stats.defSnaps=Math.round(R(29,64)*share);stats.tackles=Math.round(R(2,9)*share);stats.tfl=Number(Math.random()<pace);stats.sacks=fam==='DB'?0:Math.floor(Math.random()*3*pace);stats.defInt=fam==='DB'?Number(Math.random()<pace*.45):0;stats.passDef=fam==='DB'?R(0,2):0}
  else if(fam==='OL'){stats.offSnaps=Math.round(R(35,72)*share);stats.blocks=Math.round(stats.offSnaps*cl(pace,.25,.82));stats.pressures=R(0,3)}
  else if(fam==='ST'){if(game.pos==='K'){stats.fgAtt=R(1,4);stats.fgMade=Math.round(stats.fgAtt*pace);stats.xpAtt=R(1,4);stats.xpMade=Math.round(stats.xpAtt*pace)}else if(game.pos==='P'){stats.punts=R(2,6);stats.puntYards=stats.punts*R(36,52)}else stats.longSnaps=R(3,10)}
 }
 const result={year:n.year,week:n.week,phase:n.phase,opponentName:opp.name,teamName:n.team.name,score,opp:against,win:score>against,role,level:'NFL',stats,plays:[role+' · '+v6NFLStatLine(stats)],playoff:isPlayoff};
 n.games.unshift(result);n.games=n.games.slice(0,350);if(result.win)n.record[0]++;else n.record[1]++;
 n.team.record[n.team.record? (result.win?0:1):0]++;opp.record[result.win?1:0]++;
 n.news.unshift({title:(result.win?'Win':'Loss')+' vs '+opp.name,body:score+'–'+against+' · '+role+' · '+v6NFLStatLine(stats)});n.news=n.news.slice(0,70);
 const salaryPerWeek=n.rosterStatus==='Practice squad'?n.salary/48:n.salary/20;game.money=Math.round((Number(game.money||0)+salaryPerWeek)*100)/100;
 if(game.injury){game.injury.weeks--;if(game.injury.weeks<=0)game.injury=null}
 else if(active&&Math.random()<.009+game.fatigue*.0001){const weeks=R(1,5),name=pick(['Ankle sprain','Shoulder strain','Knee sprain','Hamstring strain']);game.injury={name,weeks,severity:weeks>=4?2:1};healthState().injuryHistory.unshift({name,year:'NFL '+n.year,phase:'NFL',week:n.week,weeks});n.news.unshift({title:'Injury report',body:name+' · medical clearance pending for '+weeks+' week(s).'});}
 game.fatigue=cl(Math.round(game.fatigue+R(3,9)+Number(game.extraIntensity||2)*1.5-Number(game.plan?.recovery||6)*.55),0,100);v6LoadChange(false);developWeek();
 if(active&&n.phase==='regular'&&n.week%4===0){const recent=n.games.filter(g=>g.year===n.year&&g.role!=='Practice squad').slice(0,4);const impact=recent.reduce((a,g)=>a+Number(g.stats.rushYards||0)+Number(g.stats.recYards||0)+Number(g.stats.passYards||0)*.4+Number(g.stats.tackles||0)*9+Number(g.stats.blocks||0)*2,0)/Math.max(1,recent.length);if(n.positionRank===2&&impact>72&&v6Playbook().knowledge>=15){n.positionRank=1;n.news.unshift({title:'Promoted to starter',body:'Your recent game production and playbook knowledge earned a bigger role.'})}else if(n.positionRank===1&&impact<7){n.positionRank=2;n.news.unshift({title:'Moved to rotation',body:'Coaches are reevaluating the position room after limited recent production.'})}}
 if(n.rosterStatus==='Practice squad'&&n.week%4===0&&Math.random()<cl(.20+(v6ProRating()-n.team.strength)*.03,.02,.65)){n.rosterStatus='Active roster';n.positionRank=2;n.news.unshift({title:'Practice squad promotion',body:'Promoted to the active roster after development and strong evaluations.'});}
 if(n.phase==='regular'){n.week++;if(n.week>17){if(n.record[0]>=10){n.phase='playoffs';n.week=1;n.playoffRound=1;n.playoffOpponent={opponentId:(n.team.id+R(1,31))%32};n.news.unshift({title:'Playoff berth',body:n.team.name+' qualifies for a fictional three-round postseason.'})}else v6NFLFinishSeason()}}
 else {if(!result.win){n.news.unshift({title:'Eliminated from the playoffs',body:n.team.name+' finishes its postseason run.'});v6NFLFinishSeason()}else if(n.playoffRound>=3){n.news.unshift({title:'League champion',body:n.team.name+' wins the professional championship.'});v6NFLFinishSeason()}else{n.playoffRound++;n.week++;n.playoffOpponent={opponentId:(n.team.id+R(1,31))%32}}}
 persist();render();
}
function v6NFLSetGamePlan(value){const n=v6League();if(!['Balanced','Aggressive','Conservative'].includes(value))return;n.gamePlan=value;persist();render()}
// Player-trained specialties contribute modestly to actual play resolution.
function v6GameplayRunBonus(){if(!game)return 0;const family=v6Family(),scheme=v6CurrentScheme();if(family!=='RB')return 0;
 const nodes=[['Stiff Arm','breakTackle'],['Truck','breakTackle'],['Juke','elusiveness'],['Spin','agility']];const prof=Math.max(...nodes.map(([name,attr])=>v6Technique('Carrier',name,attr)));
 return cl(Math.round((prof-35)/23+(v6LearnedScheme(scheme)-30)/40+(v6SchemeFit(scheme)-45)/40),0,4);
}
function v6GameplayCatchBonus(){if(!game||!['RB','WR'].includes(v6Family()))return 0;const group=v6Family()==='RB'?'Receiving':'Receiving';
 const route=v6Technique(group,v6Family()==='RB'?'Swing':'Slant','routes');return cl((route-35)/480+(v6LearnedScheme(v6CurrentScheme())-30)/1350,0,.13);
}
function v6GameplayKnowledgeBonus(){const s=v6CurrentScheme();return cl((v6LearnedScheme(s)-30)/750+(v6Playbook().knowledge-10)/1400,0,.12)}
const v6PriorChooseEvent=chooseEvent;
chooseEvent=function(i){const before=game?Number(game.behavior||0):0,prior=v6State()?.personality;v6PriorChooseEvent(i);if(!game||!prior)return;
 const delta=Number(game.behavior||0)-before;prior.Discipline=cl(prior.Discipline+delta,0,99);prior.Coachability=cl(prior.Coachability+Math.sign(delta),0,99);prior.Competitiveness=cl(prior.Competitiveness+Math.sign(delta)*.4,0,99);
 v6State().reputation.coach=cl(Number(game.coachTrust||50),0,99);persist();
};
const v6PriorSetIntensity=setIntensity;
setIntensity=function(k,v){const next=+v;if(next>=3&&(game?.fatigue>=65||v6State()?.mentalFatigue>=65)&&!confirm('High-intensity activity while fatigued raises injury risk. Continue?'))return;return v6PriorSetIntensity(k,v)};
