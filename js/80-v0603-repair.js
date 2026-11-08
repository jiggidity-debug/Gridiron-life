/* Gridiron Life v0.603: career-aware calendar, professional schedule and feedback. */
'use strict';
function v603WeekKey(){
 if(!game)return '';
 if(game.stage==='nfl'||game.stage==='nflEntry'){
  const n=game.v6?.nfl||{};return 'NFL:'+n.year+':'+n.phase+':'+n.week;
 }
 if(game.stage==='college'||game.stage==='collegeComplete'){
  const c=game.college||{};return 'COLLEGE:'+c.year+':'+c.phase+':'+c.week;
 }
 return 'HS:'+game.year+':'+game.phase+':'+game.week;
}
function v603IsPro(){return game&&['nfl','nflEntry'].includes(game.stage)}
function v603CareerSync(){
 if(!game)return;
 const key=v603WeekKey();
 if(!key)return;
 if(game.v603WeekKey!==key){
  // For old saves, the old counter was never cleared in the NFL.
  game.activityHoursThisWeek=0;
  game.gigHoursThisWeek=0;
  game.v603WeekKey=key;
  if(typeof persist==='function')persist();
 }
}
// Make the stage key authoritative whenever the week advances, not merely the old HS counter.
const v603OldAllHours=allHours;
allHours=function(){v603CareerSync();return v603OldAllHours()};
const v603OldHoursCap=hoursCap;
hoursCap=function(){return v603IsPro()?30:v603OldHoursCap()};
// Academic stress does not follow an athlete into professional football.
const v603OldStress=stressBreakdown;
stressBreakdown=function(){
 const p=v603OldStress();
 if(v603IsPro()){p.academic=0;p.job=0;p.total=p.baseline+p.intensity+p.extraTraining+p.family-p.social-p.recovery;}
 return p;
};
// Pro life should not display school coursework as a meaningful weekly commitment.
const v603OldDevelopScreen=developScreen;
developScreen=function(){
 if(!v603IsPro())return v603OldDevelopScreen();
 v603CareerSync();const free=Math.max(0,hoursCap()-allHours());
 const fields=[['training','Individual training'],['social','Personal & social time'],['recovery','Recovery and rehabilitation']];
 const allocated=used()+(game.activityHoursThisWeek||0)+(game.gigHoursThisWeek||0)+(game.job?.hours||0);
 return panel('Professional weekly schedule',
  '<p>NFL · 30 discretionary hours each week. Team practices are mandatory and separate from these hours. Purchased activities reset with each new NFL week.</p>'+
  '<div class="line"><strong>'+allocated+' / '+hoursCap()+' hours allocated</strong><span class="accent">'+free+'h free</span></div>'+
  '<p class="muted">Recurring schedule: '+used()+'h · Activities purchased this week: '+(game.activityHoursThisWeek||0)+'h'+(game.job?' · Existing job: '+game.job.hours+'h':'')+'.</p>'+
  fields.map(([k,label])=>rang(label,Number(game.plan[k]||0),0,hoursCap(),"alloc('"+k+"',+this.value)",'h')).join('')+
  (Number(game.plan.study||0)+Number(game.plan.work||0)>0?'<p class="muted">Legacy school/work allocations are being released for professional scheduling.</p>':'')
 )+panel('Team preparation',
  rang('Practice intensity',game.teamIntensity,0,4,"setIntensity('teamIntensity',+this.value)")+
  '<p class="muted">Team sessions and the game plan affect fatigue and roster evaluations.</p>'
 )+panel('Individual training · '+game.plan.training+' hours',
  '<p>Training hours count toward weekly attribute progress. Focus the hours on the skills you want to improve.</p>'+
  '<div class="line"><strong>'+focusTotal()+' / '+game.plan.training+' assigned</strong></div>'+
  GROUPS[game.pos].map(g=>rang(g[1],game.focus[g[0]],0,game.plan.training,"setFocus('"+g[0]+"',+this.value)",'h')).join('')+
  rang('Training intensity',game.extraIntensity,0,4,"setIntensity('extraIntensity',+this.value)")
 )+panel('Player attributes','<div class="grid">'+ATTRS.map(k=>'<div class="tile"><small>'+e(k)+'</small><div class="line"><strong>'+game.attrs[k]+'</strong><small>'+Math.round((game.progress[k]||0)/12*100)+'% to next</small></div></div>').join('')+'</div>')+healthPanel();
};
// Legacy school commitments are removed once for existing NFL players.
function v603NormalizeProPlan(){
 if(!v603IsPro()||game.v603ProPlanMigrated)return;
 game.plan=game.plan||{};
 for(const k of ['training','study','work','social','recovery'])game.plan[k]=Number(game.plan[k]||0);
 game.plan.study=0;game.plan.work=0;
 game.gigHoursThisWeek=0;
 game.v603ProPlanMigrated=true;
 persist();
}
// NFL development remains a mix of club practices and extra focused training.
// Preserve baseline growth; make intentional weekly training count more, with fatigue penalties.
const v603OldNFLDevelopment=v6NFLDevelopment;
v6NFLDevelopment=function(){
 v603CareerSync();
 v603OldNFLDevelopment();
 if(!v603IsPro())return;
 const groups=GROUPS[game.pos]||[], focus=game.focus||{};
 const fatigueFactor=cl(1-Number(game.fatigue||0)/145,.25,1);
 const recovery=Number(game.plan?.recovery||0);
 const intensity=Number(game.extraIntensity||2);
 for(const g of groups){
  const hours=Math.max(0,Number(focus[g[0]]||0));if(!hours)continue;
  const gain=hours*.31*fatigueFactor*(.85+intensity*.12)*(game.gymWeeks>0?1.12:1);
  for(const a of g[2]){
   if(!Number.isFinite(game.attrs[a])||game.attrs[a]>=99)continue;
   game.progress[a]=(Number(game.progress[a])||0)+gain;
   while(game.progress[a]>=12&&game.attrs[a]<99){game.attrs[a]++;game.progress[a]-=12;}
  }
 }
 if(recovery>=5){game.fatigue=cl(game.fatigue-Math.min(7,recovery*.3),0,100);}
 for(const [modern,old] of Object.entries({speed:'speed',accel:'accel',agility:'agility',strength:'power',stamina:'endurance'}))if(game.athleticAttributes&&Number.isFinite(game.attrs[old]))game.athleticAttributes[modern]=game.attrs[old];
 for(const [modern,old] of Object.entries({vision:'vision',carrying:'carrying',catching:'catching',elusiveness:'elusiveness',routes:'routes',release:'release',runBlocking:'blocking'}))if(game.technicalAttributes&&Number.isFinite(game.attrs[old]))game.technicalAttributes[modern]=game.attrs[old];
};
// Success and failure feedback for all purchase buttons, and for changes to weekly plans.
const v603OldBuyItem=buyItem;
buyItem=function(id){
 v603CareerSync();
 const before={money:game.money,morale:game.morale,stress:game.stress,hours:game.activityHoursThisWeek||0};
 feedback='';v603OldBuyItem(id);
 if(game.money<before.money){
  const item=MARKET.find(x=>x.id===id);
  feedback='Purchased '+(item?.name||id)+': $'+(before.money-game.money).toFixed(0)+' spent'+
   (game.morale!==before.morale?', morale '+(game.morale-before.morale>0?'+':'')+Math.round(game.morale-before.morale):'')+
   (game.stress!==before.stress?', stress '+Math.round(game.stress-before.stress):'')+
   ((game.activityHoursThisWeek||0)>before.hours?', '+((game.activityHoursThisWeek||0)-before.hours)+' hours used':'')+'.';
  persist();render();
 }else if(!feedback){feedback='Purchase did not complete; check ownership, available hours and money.';render();}
};
// Capped free-time purchases use the live career week rather than Year 4 HS forever.
// Base market implementation reads game.year/yearWeeks; the adapter maps its comparison
// to a stage-aware stamp without changing the archived HS timeline.
const v603MarketBuy=buyItem;
buyItem=function(id){
 if(['social','family'].includes(id)){
  const current=v603WeekKey();
  game.lastPurchaseWeek=game.lastPurchaseWeek||{};
  const prior=game.lastPurchaseWeek[id];
  if(prior===current){feedback='Already completed '+(id==='social'?'Weekend outing':'Household contribution')+' this '+(v603IsPro()?'NFL ':'')+'week.';render();return;}
  const before=game.money;
  // The legacy function tests a HS stamp: clear only the obsolete cooldown.
  if(game.lastPurchaseWeek[id]===game.year+':'+game.yearWeeks)delete game.lastPurchaseWeek[id];
  v603MarketBuy(id);
  if(game.money<before){game.lastPurchaseWeek[id]=current;persist();}
  return;
 }
 return v603MarketBuy(id);
};
// Keep the store relevant to NFL athletes; historical ownership and purchases persist.
const v603OldMoneyScreen=moneyScreen;
moneyScreen=function(){
 if(!v603IsPro())return v603OldMoneyScreen();
 const available=['gear','social','family','trainer','gym','equipment','event','discretion'];
 const store=MARKET.filter(x=>available.includes(x.id)).map(x=>{
  const owned=x.once&&game.purchases?.[x.id];
  const usedThisWeek=['social','family'].includes(x.id)&&game.lastPurchaseWeek?.[x.id]===v603WeekKey();
  return '<div class="tile store"><div><strong>'+e(x.name)+'</strong><p class="muted">'+e(x.description.replace('school','community').replace('tutoring','mentorship'))+'</p><small>'+x.hours+'h · $'+x.price+'</small></div><button class="alt" '+(owned||usedThisWeek?'disabled':'')+' onclick="buyItem(\''+x.id+'\')">'+(owned?'Owned':usedThisWeek?'Used this week':'Buy · $'+x.price)+'</button></div>';
 }).join('');
 return panel('Professional life & finances','<p>Balance: <strong>$'+Number(game.money||0).toLocaleString(undefined,{maximumFractionDigits:2})+'</strong>. Purchases use the same weekly discretionary-hour budget as personal training. Your NFL salary does not buy OVR directly.</p><p class="muted">Activity hours remaining this week: '+Math.max(0,hoursCap()-allHours())+'.</p><div class="store-grid">'+store+'</div>')+
 panel('Transactions',(game.ledger||[]).slice(0,10).map(x=>'<div class="line"><span>'+e(x.reason)+'</span><strong>$'+x.amount+'</strong></div>').join('')||'<p>No transactions yet.</p>');
};
// Attach unobtrusive, global action status so failures never look like successful clicks.
let v603ToastSerial=0;
function v603Toast(message){
 let el=document.getElementById('v603-action-status');if(!el){el=document.createElement('div');el.id='v603-action-status';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el);}
 el.textContent=message;el.classList.add('visible');
 const serial=++v603ToastSerial;setTimeout(()=>{if(serial===v603ToastSerial)el.classList.remove('visible')},4800);
}
const v603OldRender=render;
render=function(){
 if(game){v603CareerSync();v603NormalizeProPlan();}
 v603OldRender();
 const root=document.getElementById('app');
 if(root&&game&&v603IsPro()){
  // Hide misleading high-school-only labels in the old stress and life panels.
  root.querySelectorAll('.v6-legacy .panel').forEach(p=>{
   if(p.textContent.includes('Stress · how to manage it')){
    const rows=p.querySelectorAll('.line');rows.forEach(row=>{if(row.textContent.includes('Struggling courses'))row.remove();});
   }
  });
 }
};
document.addEventListener('click',function(ev){
 const button=ev.target.closest('button[onclick]');if(!button||!game)return;
 const action=button.getAttribute('onclick')||'';
 if(/^(v6Change|v6Detail|v6GoOld|v6Back|v6OldPage|tab=|render\(\)|openSection|v6Skill)/.test(action))return;
 const before=feedback;
 setTimeout(()=>{
  if(!game)return;
  if(feedback&&feedback!==before)v603Toast(feedback);
  else if(/buyItem\(/.test(action))v603Toast(feedback||'No purchase completed. Check free hours and weekly limits.');
  else if(/alloc\(|setFocus\(|v6TrainFocus\(/.test(action))v603Toast('Weekly training schedule updated.');
 },0);
},true);
