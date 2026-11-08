/* v0.603 college recognition. Fictional awards evaluated from actual player game logs.
   Separate division awards; do not fabricate national comparisons to unsimulated NPC stats. */
'use strict';
function v603HonorState(){
 const c=collegeState();if(!c)return null;
 if(!Array.isArray(c.honors))c.honors=[];
 if(!Array.isArray(c.showcases))c.showcases=[];
 return c;
}
function v603CollegeProduction(g){
 const s=g.stats||{},n=k=>Number(s[k])||0;
 const offense=n('rushYards')+n('recYards')+n('passYards')*.55;
 const tds=n('rushTD')+n('recTD')+n('passTD');
 const defense=n('tackles')*5+n('tfl')*10+n('sacks')*20+n('passDef')*9;
 const line=n('blocks')*3-n('pressures')*2;
 const kicks=n('fgMade')*18+n('xpMade')*2+n('puntYards')*.12+n('longSnaps')*2;
 return Math.max(0,offense+tds*75+defense+line+kicks-n('interceptions')*30);
}
function v603HonorProgram(c,year){
 const y=c.yearHistory.find(x=>x.year===year),name=y?.program||c.program.name;
 const program=(c.programs||[]).find(p=>p.name===name)||c.program;
 return {name,tier:program.tier||c.program.tier,conference:program.conference||c.program.conference};
}
function v603HonorAdd(c,year,title,kind,detail,score){
 if(c.honors.some(x=>x.year===year&&x.title===title))return false;
 const program=v603HonorProgram(c,year);
 const item={year,title,kind,detail,score,program:program.name,tier:program.tier};
 c.honors.push(item);
 c.news.unshift({year,week:c.week,title:game.name+' earns '+title,body:detail});
 c.history.unshift('COLLEGE HONOR · Year '+year+': '+title+'. '+detail);
 return true;
}
function v603EvaluateWeeklyHonor(result){
 const c=v603HonorState();if(!c||!result||result.role.startsWith('DNP')||result.role==='Practice squad')return;
 const score=v603CollegeProduction(result);
 const tier=v603HonorProgram(c,result.year).tier,scale=tier==='JUCO'?'JUCO ':'';
 if(score>=180)v603HonorAdd(c,result.year,scale+'Conference Player of the Week · W'+result.week,'weekly','Performance recognition: '+Math.round(score)+' impact points against '+result.opponentName+'.',score);
 if(score>=370)v603HonorAdd(c,result.year,scale+'National Player of the Week · W'+result.week,'weekly','National weekly recognition within the '+collegeTier(tier).label+' level.',score);
}
function v603EvaluateSeasonHonors(year){
 const c=v603HonorState();if(!c)return;
 const games=c.games.filter(g=>g.year===year&&!String(g.role).startsWith('DNP'));
 if(!games.length)return;
 const regular=games.filter(g=>g.phase==='regular'),sample=regular.length?regular:games;
 const impact=sample.reduce((sum,g)=>sum+v603CollegeProduction(g),0);
 const avg=impact/sample.length;
 const starts=sample.filter(g=>g.role==='Starter').length;
 const participation=Math.min(1,sample.length/8);
 const eligible=sample.length>=5;
 const program=v603HonorProgram(c,year);
 const prefix=program.tier==='JUCO'?'JUCO ':'';
 const conference=program.conference;
 const details=sample.length+' games; '+Math.round(avg)+' impact points per game; '+starts+' starts. Awards are based on player production, not a full NPC ballot.';
 if(!eligible)return;
 const adj=avg*participation;
 if(adj>=115)v603HonorAdd(c,year,'Second Team '+conference+' All-Conference','season',details,adj);
 if(adj>=190)v603HonorAdd(c,year,'First Team '+conference+' All-Conference','season',details,adj);
 if(adj>=265)v603HonorAdd(c,year,prefix+'Conference Player of the Year','season',details,adj);
 if(adj>=235)v603HonorAdd(c,year,prefix+'Second Team All-American ('+program.tier+')','season',details,adj);
 if(adj>=325)v603HonorAdd(c,year,prefix+'First Team All-American ('+program.tier+')','season',details,adj);
 if(adj>=400)v603HonorAdd(c,year,prefix+'National Player of the Year ('+program.tier+')','season',details,adj);
 if(adj>=250)v603HonorAdd(c,year,prefix+game.pos+' of the Year ('+program.tier+')','season',details,adj);
 if(year===1&&adj>=170)v603HonorAdd(c,year,prefix+'Freshman of the Year ('+program.tier+')','season',details,adj);
 const entry=c.yearHistory.find(x=>x.year===year);
 if(entry){entry.honors=c.honors.filter(x=>x.year===year&&x.kind==='season').map(x=>x.title);}
}
const v603HonorsFinishOriginal=collegeFinishYear;
collegeFinishYear=function(){
 const c=collegeState(),year=c?.year;
 v603HonorsFinishOriginal();
 if(c&&c.yearHistory.some(y=>y.year===year)){
  v603EvaluateSeasonHonors(year);
  persist();
 }
};
const v603HonorsGameOriginal=collegeSimGame;
collegeSimGame=function(){
 const c=collegeState(),before=c?.games?.length||0;
 v603HonorsGameOriginal();
 if(!c||c.games.length===before)return;
 v603EvaluateWeeklyHonor(c.games[0]);
 // End-of-year awards should include the final postseason game even when season completion happened inside simulation.
 if(c.yearHistory.some(y=>y.year===c.games[0].year))v603EvaluateSeasonHonors(c.games[0].year);
 persist();render();
};
function v603ShowcaseEligible(){
 const c=v603HonorState();if(!c)return false;
 const season=c.yearHistory[c.yearHistory.length-1];if(!season)return false;
 const recent=c.games.filter(g=>g.year===season.year&&!String(g.role).startsWith('DNP'));
 const count=recent.length,score=recent.reduce((sum,g)=>sum+v603CollegeProduction(g),0)/Math.max(1,count);
 return count>=5&&(score>=135||recent.filter(g=>g.role==='Starter').length>=6||c.honors.some(h=>h.year===season.year&&h.kind==='season'));
}
function v603PlayCollegeShowcase(){
 const c=v603HonorState();if(!c||!['offseason','jucoGraduation','complete'].includes(c.phase))return;
 const year=c.year;
 if(c.showcases.some(s=>s.year===year)){feedback='Showcase already completed this college year.';render();return;}
 if(!v603ShowcaseEligible()){feedback='Not eligible for a postseason college showcase this year.';render();return;}
 const tier=c.program.tier,juco=tier==='JUCO';
 const name=juco?'JUCO National Prospect Showcase':tier==='FBS'?'Senior All-Star Showcase':'College Division All-Star Showcase';
 const fatigue=Number(game.fatigue||0);
 const performance=cl(Math.round(rating(game.attrs,game.pos)*.73+Number(game.morale||50)*.09-fatigue*.11+R(-7,7)),20,95);
 const grade=performance>=70?'Standout':performance>=55?'Solid':'Developing';
 const boost=performance>=75?3:performance>=62?2:performance>=50?1:0;
 c.showcases.push({year,tier,name,performance,grade,scoutingBoost:boost});
 v603HonorAdd(c,year,name+' invitation','showcase','Played in the '+name+'; evaluation '+performance+'/95 ('+grade+').',performance);
 c.news.unshift({year,week:c.week,title:game.name+' completes '+name,body:'Showcase grade: '+grade+'. Future scouting adjustment: +'+boost+' points. Does not directly raise attributes.'});
 game.fatigue=cl(fatigue+4,0,100);
 feedback=name+' completed: '+grade+' showing; +'+boost+' draft scouting points, +4 fatigue.';
 persist();render();
}
const v603HonorsDraftRatingOriginal=v6ProRating;
v6ProRating=function(){
 const ratingValue=v603HonorsDraftRatingOriginal();
 const c=game?.college;
 const best=Array.isArray(c?.showcases)?Math.max(0,...c.showcases.map(x=>Number(x.scoutingBoost||0))):0;
 const seasonHonors=Array.isArray(c?.honors)?c.honors.filter(h=>h.kind==='season'&&(/All-American|Player of the Year| of the Year/.test(h.title))).length:0;
 return cl(ratingValue+best+Math.min(3,seasonHonors),30,99);
};
function v603CollegeHonorsPanel(){
 const c=v603HonorState();if(!c)return '';
 const awards=[...c.honors].sort((a,b)=>b.year-a.year||({'season':0,'showcase':1,'weekly':2}[a.kind]-{'season':0,'showcase':1,'weekly':2}[b.kind]));
 const archived=c.yearHistory.map(y=>y.year).filter(y=>!c.honors.some(a=>a.year===y&&a.kind==='season'));
 const eligible=v603ShowcaseEligible()&&['offseason','jucoGraduation','complete'].includes(c.phase)&&!c.showcases.some(x=>x.year===c.year);
 const showcase=eligible?'<div class="story"><strong>All-star showcase invitation available</strong><p>Complete a postseason prospect showcase to earn a scouting evaluation. The event causes fatigue and does not guarantee a draft selection.</p><button onclick="v603PlayCollegeShowcase()">Play Prospect Showcase</button></div>':'';
 return panel('College honors & all-star showcases','<p class="muted">Weekly honors, all-conference, divisional All-American, position and national awards are based on your actual college game production. JUCO honors are separate from four-year awards. Unsimulated rival players do not form a complete national ballot.</p>'+showcase+(awards.length?awards.map(a=>'<div class="line"><span><strong>'+e(a.title)+'</strong><br><small>Year '+a.year+' · '+e(a.program)+' · '+e(a.kind)+'</small><br><small>'+e(a.detail)+'</small></span></div>').join(''):'<p>No college honors earned yet.</p>')+(archived.length?'<p class="muted">Season awards for older saves are evaluated from saved game logs when the honors archive is first opened.</p>':''));
}
function v603BackfillCollegeHonors(){
 const c=v603HonorState();if(!c)return;
 if(c.honorsBackfilled)return;
 // Evaluate past completed seasons using original stored game logs, never invented wins or awards.
 for(const entry of c.yearHistory){
  for(const g of c.games.filter(x=>x.year===entry.year))v603EvaluateWeeklyHonor(g);
  v603EvaluateSeasonHonors(entry.year);
 }
 c.honorsBackfilled=true;persist();
}
const v603HonorsCollegeScreenOriginal=collegeScreen;
collegeScreen=function(){v603BackfillCollegeHonors();return v603HonorsCollegeScreenOriginal()+v603CollegeHonorsPanel();};
const v603HonorsProfileOriginal=collegeProfilePanel;
collegeProfilePanel=function(){v603BackfillCollegeHonors();const c=v603HonorState();return v603HonorsProfileOriginal()+panel('College recognition','<p>'+c.honors.filter(h=>h.kind==='season').length+' seasonal awards · '+c.honors.filter(h=>h.kind==='weekly').length+' weekly awards · '+c.showcases.length+' all-star showcases.</p>');};
