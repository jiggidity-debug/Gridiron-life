/* Gridiron Life v0.61 — height maturation and college body development.
   Growth is progressive; family height informs potential rather than being a hard cap.
   No auto-modification of preexisting saves' attributes. */
'use strict';
function growthState(){
 if(!game)return null;
 const g=game.growth||(game.growth={});
 if(!Number.isFinite(g.midParentalHeight))g.midParentalHeight=game.family?.male?.height&&game.family?.female?.height?Math.round((game.family.male.height+game.family.female.height+5)/2):game.height;
 if(!Number.isFinite(g.estimatedAdultHeight))g.estimatedAdultHeight=Math.max(game.height,Math.round(g.midParentalHeight+R(-4,4)));
 g.estimatedAdultHeight=Math.max(game.height,g.estimatedAdultHeight);
 g.highSchoolYears=g.highSchoolYears||{};
 g.collegeYears=g.collegeYears||{};
 g.history=Array.isArray(g.history)?g.history:[];
 g.collegePlan=['Balanced','Bulking','Athletic'].includes(g.collegePlan)?g.collegePlan:'Balanced';
 return g;
}
function growthRecord(title,detail){const g=growthState();g.history.unshift({title,detail,year:game.year,grade:game.grade,stage:game.stage||'highschool'});g.history=g.history.slice(0,25);if(game.history)game.history.unshift({title,text:detail})}
function growthHSWeek(){
 if(!game||game.grade<9||game.grade>12||game.stage&&game.stage!=='highschool')return;
 const g=growthState(),year=String(game.grade);
 if(!g.highSchoolYears[year]){
  const type=game.physicalType||'average',remaining=Math.max(0,g.estimatedAdultHeight-game.height);
  const yearlyHeightWeight={early:[.64,.28,.08,0],average:[.22,.40,.28,.10],late:[.10,.24,.45,.21]}[type]||[.22,.40,.28,.10];
  const i=game.grade-9,remainingShares=yearlyHeightWeight.slice(i).reduce((a,b)=>a+b,0);
  const annualHeight=game.grade===12?remaining:cl(Math.round(remaining*(yearlyHeightWeight[i]/Math.max(.01,remainingShares))),0,3);
  const weightTarget=type==='late'?(game.grade>=11?R(8,16):R(3,8)):type==='early'?(game.grade<=10?R(6,13):R(2,7)):R(5,12);
  g.highSchoolYears[year]={weeks:0,annualHeight,annualWeight:weightTarget,appliedHeight:0,appliedWeight:0,weightFraction:0};
 }
 const y=g.highSchoolYears[year];if(y.weeks>=48)return;
 y.weeks++;const now=y.weeks,remainingHeight=y.annualHeight-y.appliedHeight,remainingWeight=y.annualWeight-y.appliedWeight;
 const h=Math.min(remainingHeight,Math.floor(y.annualHeight*now/45)-y.appliedHeight);
 if(h>0){game.height+=h;y.appliedHeight+=h;growthRecord('Physical growth','Grew '+h+' inch'+(h===1?'':'es')+' during grade '+game.grade+'. Current height '+Math.floor(game.height/12)+' ft '+game.height%12+' in.')}
 const w=Math.min(remainingWeight,Math.max(0,Math.floor(y.annualWeight*now/45)-y.appliedWeight));
 if(w>0){game.weight+=w;y.appliedWeight+=w; setSkillValue('strength',skillValue('strength')+Math.floor(y.appliedWeight/5)-Math.floor((y.appliedWeight-w)/5));syncLegacyAttrs()}
}
function growthCollegeTarget(){const f=POSITION_FAMILIES[game.pos]||'RB';const defaults={OL:295,DL:275,LB:235,RB:210,WR:195,TE:255,QB:220,DB:195,ST:205};return Math.max(game.weight,defaults[f]||220)}
function growthCollegeYear(){const g=growthState(),college=game.college;if(!college)return null;const y=String(college.year);
 if(!Number.isFinite(g.targetWeight))g.targetWeight=growthCollegeTarget();
 if(!g.collegeYears[y])g.collegeYears[y]={weeks:0,weightAtStart:game.weight,applied:0,annualGain:0,offseasonDone:false};return g.collegeYears[y]}
function growthCollegeWeek(){
 if(game?.stage!=='college')return;
 const g=growthState(),y=growthCollegeYear();if(y.weeks>=28)return;y.weeks++;
 // In-season weight maintenance is common: gain can be small or negative.
 const weekly=g.collegePlan==='Bulking'?.52:g.collegePlan==='Athletic'?.12:.30;
 const fatigue=cl(Number(game.fatigue||0),0,100);
 const projected=Math.max(0,weekly*(1-fatigue/200));
 y.weightRemainder=(y.weightRemainder||0)+projected;
 let pounds=Math.floor(y.weightRemainder);y.weightRemainder-=pounds;
 if(game.weight+pounds>(g.targetWeight||growthCollegeTarget()))pounds=Math.max(0,g.targetWeight-game.weight);
 if(pounds){game.weight+=pounds;y.applied+=pounds;growthBodyStats(pounds,g.collegePlan)}
}
function growthBodyStats(pounds,plan){
 const g=growthState();g.strengthRemainder=(g.strengthRemainder||0)+pounds/(plan==='Athletic'?9:7);
 const gain=Math.floor(g.strengthRemainder);g.strengthRemainder-=gain;
 if(gain){setSkillValue('strength',skillValue('strength')+gain);syncLegacyAttrs()}
}
function growthCollegeOffseason(){
 const g=growthState(),y=growthCollegeYear();if(y.offseasonDone)return;y.offseasonDone=true;
 let desired=g.collegePlan==='Bulking'?R(12,25):g.collegePlan==='Athletic'?R(3,9):R(7,17);
 const needs=Math.max(0,(g.targetWeight||growthCollegeTarget())-game.weight);
 desired=Math.min(desired,needs);
 if(!desired)return;
 game.weight+=desired;y.applied+=desired;growthBodyStats(desired,g.collegePlan);
 if(g.collegePlan==='Bulking'&&y.applied>=25){setSkillValue('agility',skillValue('agility')-1);syncLegacyAttrs()}
 growthRecord('College body development','Nutrition and strength program ('+g.collegePlan+'): +'+desired+' lb in the offseason; current playing weight '+game.weight+' lb.');
}
function growthChoosePlan(plan){if(!['Balanced','Bulking','Athletic'].includes(plan))return;growthState().collegePlan=plan;feedback='Body development plan: '+plan+'.';persist();render()}
function growthAdjustTarget(delta){const g=growthState(),min=Math.max(100,game.weight),max=450;g.targetWeight=cl((g.targetWeight??growthCollegeTarget())+delta,min,max);persist();render()}
function growthDevelopmentPanel(){const g=growthState(),isCollege=game.stage==='college',age=game.grade;const goal=g.estimatedAdultHeight,foot=Math.floor(goal/12)+'′'+goal%12+'″';
 if(isCollege){const y=growthCollegeYear();return '<div class="v6-surface v61-body"><strong>Body Development · College</strong><p>Current weight <strong>'+game.weight+' lb</strong> · Target <strong>'+g.targetWeight+' lb</strong> · Year gain <strong>+'+y.applied+' lb</strong></p><div class="v6-threebuttons">'+['Athletic','Balanced','Bulking'].map(p=>'<button class="v6-btn v6-stroked '+(p===g.collegePlan?'v61-active':'')+'" onclick="growthChoosePlan(\''+p+'\')">'+p+'</button>').join('')+'</div><div class="v6-inline-actions"><button class="v6-btn v6-mini" onclick="growthAdjustTarget(-5)">Target −5 lb</button><button class="v6-btn v6-mini" onclick="growthAdjustTarget(5)">Target +5 lb</button></div><p class="v6-note">Weight develops across the season and offseason. Strength response, training, fatigue and position needs affect results. No instant weight gain on position changes.</p></div>'}
 return '<div class="v6-surface v61-body"><strong>Physical Maturity</strong><p>Height <strong>'+Math.floor(game.height/12)+'′'+game.height%12+'″</strong> · Weight <strong>'+game.weight+' lb</strong> · Development <strong>'+e(game.physicalType||'average')+'</strong></p><p class="v6-note">Mid-parental reference: '+Math.floor(g.midParentalHeight/12)+'′'+g.midParentalHeight%12+'″. Individual potential estimate: '+foot+'. Height and weight change over school weeks, not instantly on grade advancement.</p></div>';
}
// Engine hooks run after the original weekly simulator; once-per-week safeguards prevent duplicate changes.
const v61OldCollegeAdvance=collegeAdvancePlayerWeek;
collegeAdvancePlayerWeek=function(result,role){v61OldCollegeAdvance(result,role);growthCollegeWeek()};
const v61OldCollegeNextYear=collegeNextYear;
collegeNextYear=function(){if(game?.stage==='college'&&game.college?.phase==='offseason')growthCollegeOffseason();return v61OldCollegeNextYear()};
const v61OldDevelop=v6Develop;
v6Develop=function(){
 if(v6UI.view==='Body Development')return '<div class="v6-detail"><div class="v6-detailhead"><button class="v6-btn v6-text" onclick="v6Detail(\'Overview\')">‹ Back</button><strong>Body Development</strong><span></span></div>'+growthDevelopmentPanel()+'</div>';
 let html=v61OldDevelop();if(!game||v6UI.view!=='Overview')return html;
 return html.replace(/(<div class="v6-inline-actions">)([\s\S]*?)(<\/div>)/,(_all,opening,buttons,closing)=>opening+buttons+'<button class="v6-btn v6-mini" onclick="v6Detail(\'Body Development\')">Body Plan</button>'+closing);
};
