/* Gridiron Life v0.5 Part 6: optional spring/summer 7-on-7, camps and combines.
   All field events are non-contact by default. No ratings cap or reset. */
const SEVENS_HOURS=4;
const CAMP_OPTIONS=[
  {id:'school-day',name:'School-sponsored skills day',cost:0,hours:5,phase:[2,3],minGrade:9,progress:2,exposure:1,description:'Free local instruction; an accessible option regardless of family income.'},
  {id:'position',name:'Position skills camp',cost:85,hours:6,phase:[1,2,3,4],minGrade:9,progress:4.5,exposure:3,description:'Technique coaching with a measurable evaluation.'},
  {id:'regional',name:'Regional prospect showcase',cost:150,hours:8,phase:[2,3],minGrade:10,progress:2.5,exposure:8,description:'Compete against stronger regional prospects; exposure depends on performance.'},
  {id:'elite',name:'Elite regional invitational',cost:260,hours:8,phase:[3],minGrade:10,progress:3.5,exposure:13,invite:true,description:'Invitation-only camp. Qualify through exposure or a strong prior evaluation.'},
  {id:'college',name:'College-hosted prospect camp',cost:220,hours:8,phase:[3],minGrade:11,progress:3,exposure:11,description:'An advanced evaluation. Attendance does not guarantee an offer.'},
  {id:'combine',name:'Regional athletic combine',cost:55,hours:5,phase:[2,3],minGrade:9,progress:0,exposure:5,description:'Timed 40-yard dash, shuttle, and vertical jump with an evaluation report.'}
];
function summerState(){
  if(!game)return null;
  let s=game.summer;
  if(!s||typeof s!=='object')s=game.summer={exposure:0,circuits:[],camps:[],focus:null,activityHistory:[],fieldWorkloadThisWeek:0};
  if(!Array.isArray(s.circuits))s.circuits=[];
  if(!Array.isArray(s.camps))s.camps=[];
  if(!Array.isArray(s.activityHistory))s.activityHistory=[];
  if(!Number.isFinite(s.exposure))s.exposure=0;
  if(!Number.isFinite(s.fieldWorkloadThisWeek))s.fieldWorkloadThisWeek=0;
  if(!GROUPS[game.pos].some(g=>g[0]===s.focus))s.focus=GROUPS[game.pos][0][0];
  return s;
}
function circuitKey(){return game.year+':'+game.phase}
function activeCircuit(){
  const s=summerState();if(!s)return null;
  const c=s.circuits.find(x=>x.key===circuitKey());
  return c&&!c.finished?c:null;
}
function sevensWeeklyHours(){return game&&activeCircuit()?SEVENS_HOURS:0}
function sevensAvailable(){return game&&!game.finished&&(game.phase===2||game.phase===3)}
function chooseCampFocus(group){
  const s=summerState();if(GROUPS[game.pos].some(g=>g[0]===group)){s.focus=group;persist();render()}
}
function addSummerHistory(message){
  const s=summerState();s.activityHistory.unshift({year:game.year,phase:PHASES[game.phase].name,week:game.week,message});
  s.activityHistory=s.activityHistory.slice(0,80);
  note(message);
}
function summerReject(message){feedback=message;render();return false}
function joinSevens(){
  if(!sevensAvailable())return summerReject('Seven-on-seven circuits run in Spring Ball and Summer Break only.');
  if(game.week>4)return summerReject('Circuit registration closed after Week 4. You can enter the next spring or summer circuit.');
  if(game.injury)return summerReject('You need medical clearance before joining the seven-on-seven circuit.');
  const s=summerState();if(s.circuits.some(x=>x.key===circuitKey()))return summerReject('You have already entered this phase’s seven-on-seven circuit.');
  if(allHours()+SEVENS_HOURS>hoursCap())return summerReject('Seven-on-seven reserves 4 hours each week. Free 4 discretionary hours first.');
  const c={key:circuitKey(),year:game.year,phase:game.phase,signupWeek:game.week,round:0,qualifyingWins:0,qualifyingLosses:0,
    wins:0,losses:0,games:[],finished:false,status:'Pool play',title:false};
  s.circuits.push(c);
  addSummerHistory('Registered for a six-week seven-on-seven circuit (4 weekly hours). Pool play leads to a regional semifinal and championship if qualified.');
  persist();render();return true;
}
function eliteInvited(){
  const s=summerState();return s.exposure>=18||s.camps.some(c=>c.evaluation>=75);
}
function checkSummerInvitation(){
  const s=summerState();if(!s.invitedElite&&eliteInvited()){
    s.invitedElite=true;addSummerHistory('A regional scout invited you to an elite summer prospect camp. The invitation makes that camp available beginning in 10th grade.');
  }
}
function addFieldLoad(load){summerState().fieldWorkloadThisWeek+=load}
function position7v7Skill(){
 const a=game.attrs;
 return game.pos==='QB'?a.accuracy*.46+a.awareness*.30+a.arm*.24:
   game.pos==='RB'?a.catching*.47+a.elusiveness*.28+a.routes*.10+a.speed*.15:
   game.pos==='TE'?a.catching*.44+a.routes*.24+a.release*.10+a.power*.22:
   a.catching*.40+a.routes*.29+a.release*.16+a.speed*.15;
}
function simulateSevenOnSevenWeek(){
  const c=activeCircuit();if(!c)return null;
  if(c.games.some(g=>g.week===game.week))return null; // no double simulation
  if(c.round>=6){c.finished=true;return null}
  const round=c.round+1,knockout=round>=5;
  if(round===5&&c.qualifyingWins<2){c.finished=true;c.status='Did not qualify for the regional semifinal';addSummerHistory('Seven-on-seven: pool record '+c.qualifyingWins+'–'+c.qualifyingLosses+'. The team missed the regional knockout rounds.');return null}
  if(round===6&&c.status!=='Regional finalist'){c.finished=true;return null}
  const opponent=pick((game.schools||schools).filter(x=>x.id!==game.school.id));
  const opponentStrength=cl(Math.round(opponent.prestige*.45+opponent.coaching*.55),20,95);
  const skill=position7v7Skill();let stats;
  if(game.injury){stats=game.pos==='QB'?{att:0,comp:0,yards:0,td:0,int:0}:{targets:0,catches:0,yards:0,td:0};}
  else if(game.pos==='QB'){
    const att=R(14,23),prob=cl(.49+(skill-opponentStrength)/290-game.fatigue/800,.30,.83),comp=Array.from({length:att}).reduce(n=>n+(Math.random()<prob?1:0),0);
    stats={att,comp,yards:comp*R(7,13),td:cl(Math.round(comp*.18+R(-1,1)),0,5),int:cl(Math.round((att-comp)*.10+R(-1,1)),0,3)};
  }else{
    const targets=R(5,11),prob=cl(.50+(skill-opponentStrength)/320-game.fatigue/850,.32,.85),catches=Array.from({length:targets}).reduce(n=>n+(Math.random()<prob?1:0),0);
    stats={targets,catches,yards:catches*R(7,13),td:cl(Math.round(catches*.18+R(-1,1)),0,3)};
  }
  const impact=game.pos==='QB'?stats.yards/16+stats.td*3-stats.int*3:stats.yards/7+stats.td*3;
  let own=cl(R(12,23)+Math.round((skill-opponentStrength)/11)+Math.round(impact/6),0,45);
  let against=cl(R(12,25)+Math.round((opponentStrength-game.school.prestige)/13),0,45);
  if(game.injury){own=Math.max(0,own-12);}
  if(own===against){if(Math.random()<.5)own++;else against++;}
  const win=own>against;
  const report={round,stage:round<=4?'Pool '+round:round===5?'Regional semifinal':'Regional final',week:game.week,opponent:opponent.name,
    opponentStrength,ours:own,theirs:against,win,injured:!!game.injury,stats};
  c.games.push(report);c.round=round;c.wins+=win?1:0;c.losses+=win?0:1;
  if(round<=4){c.qualifyingWins+=win?1:0;c.qualifyingLosses+=win?0:1;}
  if(round===5){if(win)c.status='Regional finalist';else{c.status='Eliminated in semifinal';c.finished=true}}
  if(round===6){c.status=win?'Regional champions':'Regional runner-up';c.finished=true;c.title=win;
    if(win){summerState().exposure=cl(summerState().exposure+6,0,100);if(typeof earnHonor==='function')earnHonor('7v7-champion','Seven-on-Seven Regional Champion','camp','7v7|'+c.key,'Won the regional final in seven-on-seven competition.');}}
  const gain=game.injury?0:cl(Math.round(impact/10),1,3);
  // Seven-on-seven provides specific passing/receiving skill experience, not rushing production.
  const keys=game.pos==='QB'?['accuracy','awareness']:game.pos==='RB'?['catching','elusiveness']:game.pos==='TE'?['catching','routes']:['catching','routes'];
  if(!game.injury)for(const key of keys)game.progress[key]=(game.progress[key]||0)+gain*(key===keys[0]?1:.6);
  if(!game.injury)addFieldLoad(1.5);
  const exposureGain=game.injury?0:cl(Math.round(impact/9)+(win?1:0),0,5);
  summerState().exposure=cl(summerState().exposure+exposureGain,0,100);
  if(win)game.morale=cl(game.morale+1,0,100);
  checkSummerInvitation();
  const performance=game.pos==='QB'?`${stats.comp}/${stats.att} passing, ${stats.yards} yd, ${stats.td} TD, ${stats.int} INT`:
    `${stats.catches}/${stats.targets} catches, ${stats.yards} yd, ${stats.td} TD`;
  addSummerHistory(`7v7 ${report.stage}: ${win?'W':'L'} ${own}–${against} vs ${opponent.name}. ${game.injury?'Missed the match (injury).':performance}. Exposure +${exposureGain}.`);
  persist();return report;
}
function campEvaluation(){
 const a=game.attrs,g=GROUPS[game.pos].find(x=>x[0]===summerState().focus),base=(a[g[2][0]]+a[g[2][1]])/2;
 return cl(Math.round(base*.70+position7v7Skill()*.30+R(-5,5)),0,99);
}
function combineMeasurements(){
 const a=game.attrs;
 const forty=cl(6.25-(a.speed-30)*.022-(a.accel-30)*.004+R(-7,7)/100,4.30,6.50);
 const shuttle=cl(5.70-(a.agility-30)*.017-(a.accel-30)*.004+R(-7,7)/100,3.70,6.10);
 const vertical=cl(16+(a.power-30)*.23+(a.agility-30)*.07+R(-10,10)/10,13,43);
 return {forty:Number(forty.toFixed(2)),shuttle:Number(shuttle.toFixed(2)),vertical:Number(vertical.toFixed(1))};
}
function attendCamp(id){
 const camp=CAMP_OPTIONS.find(x=>x.id===id);if(!camp)return false;
 if(game.finished||!camp.phase.includes(game.phase))return summerReject('This camp is not available during the current calendar phase.');
 if(game.grade<camp.minGrade)return summerReject(camp.name+' requires at least Grade '+camp.minGrade+'.');
 if(game.injury)return summerReject('Medical clearance is required before participating in a camp or combine.');
 const s=summerState(),key=game.year+':'+id;
 if(s.camps.some(x=>x.key===key))return summerReject('You have already attended this event this school year.');
 if(allHours()+camp.hours>hoursCap())return summerReject(camp.name+' requires '+camp.hours+' uncommitted hours this week.');
 const discount=(game.transportWeeks||0)>0&&camp.cost>0?Math.min(10,camp.cost):0;
 const cost=camp.cost-discount;
 if(game.money<cost)return summerReject('You need $'+cost+' to attend '+camp.name+'. School-sponsored skills day is free.');
 game.money-=cost;game.activityHoursThisWeek=(game.activityHoursThisWeek||0)+camp.hours;
 if(cost&&typeof ledgerEntry==='function')ledgerEntry('expense',cost,camp.name+(discount?' (transport discount)':''));
 const evaluation=campEvaluation(),measurements=id==='combine'?combineMeasurements():null;
 const focus=GROUPS[game.pos].find(x=>x[0]===s.focus);
 if(camp.progress){
   const quality=cl(.6+evaluation/140,.65,1.35),gains=focus[2].map((key,i)=>{
      const add=camp.progress*quality*(i===0?1:.65);
      game.progress[key]=(game.progress[key]||0)+add;
      return `${key} +${add.toFixed(1)} progress`;
   });
 }
 const expo=cl(Math.round(camp.exposure*(.5+evaluation/100)),1,17);
 s.exposure=cl(s.exposure+expo,0,100);
 addFieldLoad(camp.hours*.28);
 const report={key,id,name:camp.name,year:game.year,phase:game.phase,week:game.week,cost,hours:camp.hours,focus:focus[1],evaluation,exposureGain:expo,measurements};
 s.camps.unshift(report);
 const combined=measurements?` 40 yd ${measurements.forty}s, shuttle ${measurements.shuttle}s, vertical ${measurements.vertical} in.`:'';
 addSummerHistory(`${camp.name}: evaluation ${evaluation}/99; ${focus[1]}; exposure +${expo}.${combined}`);
 persist();render();return true;
}
function sevenOnSevenPanel(){
 const s=summerState(),c=s.circuits.find(x=>x.key===circuitKey()),allowed=sevensAvailable();
 const summary=c?`<p><strong>${e(c.status)}</strong> · ${c.wins}–${c.losses} · ${c.round}/6 rounds played ${!c.finished?'· 4 hours/week reserved':''}</p>`:
  '<p>No seven-on-seven circuit entered this phase.</p>';
 const results=c?.games?.slice().reverse().map(g=>'<div class="log"><strong>'+e(g.stage)+' · '+(g.win?'W':'L')+' '+g.ours+'–'+g.theirs+' vs '+e(g.opponent)+'</strong><br><small>Opponent '+g.opponentStrength+'/99 · '+(g.injured?'Missed (injury)':game.pos==='QB'?`${g.stats.comp}/${g.stats.att} passing · ${g.stats.yards} yards · ${g.stats.td} TD · ${g.stats.int} INT`:`${g.stats.catches}/${g.stats.targets} catches · ${g.stats.yards} yards · ${g.stats.td} TD`)+'</small></div>').join('')||'';
 const hint=game.pos==='QB'?'QB: passing attempts, completions, yards, touchdowns, interceptions.':'RB/WR/TE: targets, catches, receiving yards, touchdowns. No rushing attempts in seven-on-seven.';
 return panel('Seven-on-seven · Spring and Summer',
    '<p>Optional six-week passing circuit: four pool matches, then a semifinal and final if you qualify. Games simulate with the weekly calendar, against named schools. '+e(hint)+'</p>'+
    summary+results+
    (!c&&allowed?'<p class="muted">Register by Week 4. Reserves 4 discretionary hours each simulated week. No money required.</p><button class="alt" onclick="joinSevens()">Join seven-on-seven circuit · 4h/week</button>':
       !allowed?'<p class="muted">Available in Spring Ball and Summer Break.</p>':'')+
    '<p class="muted">Seven-on-seven creates skill experience and exposure. It is low contact, but still uses energy and time. A circuit can be entered once per spring or summer phase.</p>');
}
function summerCampPanel(){
 const s=summerState(),availableHours=hoursCap()-allHours();
 const focusOptions=GROUPS[game.pos].map(g=>'<option value="'+e(g[0])+'" '+(g[0]===s.focus?'selected':'')+'>'+e(g[1])+'</option>').join('');
 const cards=CAMP_OPTIONS.map(c=>{
   const attended=s.camps.some(x=>x.key===game.year+':'+c.id),validPhase=c.phase.includes(game.phase),gradeOk=game.grade>=c.minGrade,inviteOk=!c.invite||eliteInvited();
   const cost=c.cost-(game.transportWeeks>0&&c.cost>0?Math.min(10,c.cost):0);
   return '<div class="tile store"><div><strong>'+e(c.name)+'</strong><p class="muted">'+e(c.description)+'</p><small>$'+cost+' · '+c.hours+' hours · Grade '+c.minGrade+'+ · '+(c.id==='combine'?'Measured testing':'Focus '+e(GROUPS[game.pos].find(g=>g[0]===s.focus)[1]))+'</small></div><button class="alt" '+(attended||!validPhase||!gradeOk||!inviteOk||game.injury||game.finished?'disabled':'')+' onclick="attendCamp(\''+c.id+'\')">'+(attended?'Attended':!validPhase?'Unavailable this phase':!gradeOk?'Grade '+c.minGrade+' required':!inviteOk?'Invitation required':'Attend')+'</button></div>';
 }).join('');
 const latest=s.camps.slice(0,6).map(x=>'<div class="log"><strong>'+e(x.name)+'</strong><br><small>Year '+x.year+' · '+e(PHASES[x.phase].name)+' W'+x.week+' · $'+x.cost+' · '+x.hours+'h · evaluation '+x.evaluation+'/99 · exposure +'+x.exposureGain+(x.measurements?` · 40 yd ${x.measurements.forty}s · shuttle ${x.measurements.shuttle}s · vertical ${x.measurements.vertical} in`:'')+'</small></div>').join('');
 return panel('Skills camps, showcases & combines',
   '<div class="grid"><div class="tile"><small>Exposure · long-term</small><div class="num">'+Math.round(s.exposure)+'/100</div></div><div class="tile"><small>Available discretionary hours</small><div class="num">'+availableHours+'h</div></div></div>'+
   '<p class="muted">Exposure records performance at camps and seven-on-seven; college recruiting is not yet implemented. Camps train skill progress, not instant OVR. Combines measure athletic performance without adding skill points.</p>'+
   '<label for="campFocus">Camp training focus<select id="campFocus" aria-label="Camp training focus" onchange="chooseCampFocus(this.value)">'+focusOptions+'</select></label>'+
   '<div class="store-grid">'+cards+'</div><h3>Completed evaluations</h3>'+(latest||'<p class="muted">No camps attended yet.</p>')+
   '<p class="muted">One attendance per camp type per school year; hours and payments are deducted when attended. Elite invitations require 18 exposure or a previous evaluation of at least 75. The free school-sponsored day requires no family money. Transportation passes reduce eligible paid camp fees by $10.</p>');
}
function summerHistoryPanel(){
 const s=summerState(),past=s.circuits.slice().reverse().map(c=>'<div class="log"><strong>Year '+c.year+' · '+e(PHASES[c.phase].name)+' · '+e(c.status)+'</strong><br><small>'+c.wins+'–'+c.losses+' · '+c.games.length+' games · '+(c.title?'Regional title':'No regional title')+'</small></div>').join('');
 return panel('Summer football history',
  '<p>Long-term exposure: <strong>'+Math.round(s.exposure)+'/100</strong></p>'+past+
  (s.camps.length?'<p><strong>Camp and combine results</strong></p>'+s.camps.slice(0,18).map(x=>'<div class="log">Year '+x.year+' · '+e(x.name)+' · evaluation '+x.evaluation+'/99'+(x.measurements?' · 40 yd '+x.measurements.forty+'s':'')+'</div>').join(''):'')+
  (!past&&!s.camps.length?'<p>No seven-on-seven or camp participation yet.</p>':'')
 );
}
