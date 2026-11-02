/* Gridiron Life v0.5 Part 8 — offline college career foundation.
   College world lives alongside the high-school record; HS stats are never overwritten.
   Fictional league and simplified eligibility/transfer/NIL rules, not NCAA legislation. */
const COLLEGE_NAMES=[
 ['Gulf Coast University','Gulf','Bay City','Air Raid'],['Lone Prairie State','Gulf','Prairie View','Spread'],['South Bay Tech','Gulf','Bayport','Pro Style'],['Rio Verde University','Gulf','Rio Verde','West Coast'],['Pine Harbor State','Gulf','Pine Harbor','Power Run'],['Red River A&M','Gulf','Red River','Wishbone'],
 ['Lakefront University','Great Lakes','Lakefront','Pro Style'],['Northwood State','Great Lakes','Northwood','Spread'],['Granite Tech','Great Lakes','Granite City','Power Run'],['Cedar State','Great Lakes','Cedar City','West Coast'],['Iron Valley','Great Lakes','Iron Valley','Wishbone'],['Midland University','Great Lakes','Midland','Air Raid'],
 ['Coastal Pacific','Pacific','Harbor Beach','Spread'],['Sierra State','Pacific','Sierra Vista','West Coast'],['Desert Ridge','Pacific','Desert Ridge','Air Raid'],['Summit Pacific','Pacific','Summit Bay','Pro Style'],['Canyon Tech','Pacific','Canyon City','Power Run'],['Evergreen College','Pacific','Evergreen','Wishbone'],
 ['Capital University','Atlantic','Capital City','Pro Style'],['Atlantic State','Atlantic','Atlantic Point','Air Raid'],['Blue Ridge Tech','Atlantic','Blue Ridge','Power Run'],['Liberty Harbor','Atlantic','Liberty Harbor','Spread'],['Piedmont University','Atlantic','Piedmont','West Coast'],['East Tide State','Atlantic','East Tide','Wishbone']
];
const COLLEGE_TIERS=[
 {code:'FBS',label:'Division I FBS',count:136,base:76,scholarships:true,years:4},
 {code:'FCS',label:'Division I FCS',count:129,base:65,scholarships:true,years:4},
 {code:'D2',label:'Division II',count:160,base:55,scholarships:true,years:4},
 {code:'D3',label:'Division III',count:100,base:46,scholarships:false,years:4},
 {code:'NAIA',label:'NAIA',count:100,base:50,scholarships:true,years:4},
 {code:'JUCO',label:'Junior College (JUCO)',count:60,base:43,scholarships:true,years:2}
];
function collegeTier(code){return COLLEGE_TIERS.find(t=>t.code===code)||COLLEGE_TIERS[0]}
function collegePrograms(){
 // The 24 original fictional colleges remain addressable by their saved numeric IDs.
 const original=COLLEGE_NAMES.map(([name,conference,city,scheme],id)=>{
  const strength=cl(75+((id*19+id*id*7)%22),65,97);
  return {id,name,conference,city,scheme,tier:'FBS',prestige:strength,coaching:cl(strength+((id*11)%19)-9,35,97),facilities:cl(strength+((id*7)%15)-7,35,97),academic:cl(52+((id*13)%43),50,96),resources:cl(strength+((id*17)%15)-7,30,97),record:[0,0],points:0,ranking:0};
 });
 const names1=['Pine','Oak','Silver','Red','Blue','Cedar','Stone','River','Highland','Prairie','Canyon','South','North','East','West','Lake','Summit','Valley','Iron','Granite','Maple','Desert','Coastal','Timber','Twin','Clear','Rolling','Golden','Evergreen','Copper','Hollow','Black','White','Green','Long','Spring','Sunset','Cypress','Birch','Sage'];
 const names2=['Haven','Ridge','Bend','Falls','Creek','Point','Grove','Field','Harbor','Mountain','Fork','Bridge','Mesa','Hill','Bay','Plain','Crossing','Rock','Springs','Forest'];
 const suffixes=['University','State','College','Tech','A&M','Institute'];
 const schemes=['Spread','Pro Style','Power Run','Air Raid','West Coast','Option'];
 let out=original, id=original.length;
 for(const tier of COLLEGE_TIERS){
  const prior=out.filter(p=>p.tier===tier.code).length;
  for(let j=prior;j<tier.count;j++){
   let n=id, region=['Texas','Midwest','Atlantic','Pacific','Southern','Mountain'][Math.floor(j/24)%6],
   name=names1[n%names1.length]+' '+names2[Math.floor(n/names1.length)%names2.length]+' '+suffixes[Math.floor(n/137)%suffixes.length];
   // Enforce unique identities even after adjective combinations wrap.
   if(out.some(p=>p.name===name))name+=' '+(Math.floor(n/200)+1);
   const prestige=cl(tier.base+((n*17+n*n*3)%25)-12,25,98);
   out.push({id,name,conference:tier.code+' '+region+' '+(Math.floor((j%24)/12)+1),city:names2[n%names2.length],scheme:schemes[n%schemes.length],tier:tier.code,prestige,coaching:cl(prestige+((n*11)%17)-8,25,98),facilities:cl(prestige+((n*7)%19)-9,25,98),academic:cl(48+((n*13)%49),45,96),resources:cl(prestige+((n*9)%19)-9,20,99),record:[0,0],points:0,ranking:0});
   id++;
  }
 }
 return out;
}
function collegeOfferMinimum(program){
 const t=collegeTier(program.tier),offset={FBS:17,FCS:9,D2:1,D3:-6,NAIA:-3,JUCO:-9}[t.code];
 return cl(Math.round(29+program.prestige*.50+offset),25,92);
}
function collegeTransferInterest(program,score,starts=0){
 return cl(Math.round(52+score-collegeOfferMinimum(program)+Math.min(10,starts*.6)),0,100);
}
function recruitingState(){
 if(!game)return null;
 if(!game.recruiting){game.recruiting={board:[],createdYear:0,stars:0,rank:null,offers:[],scouting:0};}
 const r=game.recruiting;
 if(!Array.isArray(r.board)||r.board.length!==1600 || !r.boardVersion || r.boardVersion<2){
  // A large national pool exists, but only 250 athletes receive published ranks.
  // Top 250: 2 generational prospects at 77; 248 prospects between 58 and 76.
  // Other 1,350 prospects are unranked, with ratings no higher than 57.
  r.board=Array.from({length:1600},(_,i)=>({id:i+1,name:pick(FN)+' '+pick(LN),pos:pick(['QB','RB','WR','TE']),state:pick(['Texas','Florida','Ohio','Georgia','California','Louisiana']),score:i<2?77:i<250?58+Math.floor(Math.pow(Math.random(),.8)*19):28+Math.floor(Math.random()*30)}));
  r.boardVersion=2;
 }

 const recent=(game.games||[]).filter(x=>x.level==='Varsity');
 const varsity=recent.length;
 const impact=recent.length?Math.round(recent.slice(0,14).reduce((n,g)=>n+gameImpact(g),0)/Math.min(14,recent.length)):0;
 const awards=(game.awards?.earned||[]).filter(x=>x.kind!=='weekly').length;
 const exposure=game.summer?.exposure||game.summer?.totalExposure||game.exposure||0;
 const score=cl(Math.round(rating(game.attrs,game.pos)*.82+4+cl(impact/16,-3,5)+Math.min(3,varsity*.12)+Math.min(3,awards*.5)+Math.min(2,Math.sqrt(Math.max(0,exposure))*.15)+(game.school.classif-1)*.25),10,80);
 r.scouting=score;
 r.stars=score>=70?5:score>=65?4:score>=60?3:score>=55?2:score>=50?1:0;
 const above=r.board.filter(p=>p.score>score).length;
 r.rank=score>=58 && above<250 ? above+1 : null;
 if(!r.colleges||r.colleges.length<685)r.colleges=collegePrograms();
 // Offers are deterministic for a given score and program. Walk-on paths stay open.
 r.offers=r.colleges.map(p=>{
   const minimum=collegeOfferMinimum(p);
   const ability=rating(game.attrs,game.pos);
   const minimumAbility=({FBS:70,FCS:65,D2:59,D3:55,NAIA:56,JUCO:55})[p.tier];
   const minimumGPA=({FBS:2.5,FCS:2.3,D2:2.2,D3:2.6,NAIA:2.2,JUCO:1.9})[p.tier];
   // JUCO primarily serves capable athletes needing an academic or recruiting reset;
   // it is not a guaranteed destination for every weak high-school prospect.
   const qualified=game.grade>=11 && varsity>=4 && ability>=minimumAbility && game.gpa>=minimumGPA;
   const offer=qualified&&score>=minimum&&p.tier!=='D3';
   return {id:p.id,offer,scholarship:offer?cl(Math.round(35+(score-minimum)*2.5+(p.resources-50)*.15),35,100):0,interest:cl(Math.round(score-minimum+53),0,100),minimum};
 });
 // Recruiters offer to a limited subset of fitting programs, not hundreds at once.
 const maxOffers=game.grade<11?0:game.grade===11?Math.min(6,Math.max(0,Math.floor((score-49)/4))):Math.min(18,Math.max(0,Math.floor((score-43)/2)));
 const eligible=r.offers.filter(o=>o.offer).sort((a,b)=>{const pa=r.colleges[a.id],pb=r.colleges[b.id];return Math.abs(pa.prestige-score)-Math.abs(pb.prestige-score)||b.interest-a.interest||a.id-b.id;});
 const selected=new Set(eligible.slice(0,maxOffers).map(o=>o.id));
 r.offers.forEach(o=>{if(o.offer&&!selected.has(o.id)){o.offer=false;o.scholarship=0;}});
 return r;
}
function recruitingNews(){
 const r=recruitingState(),out=[];
 const sorted=[...r.board].sort((a,b)=>b.score-a.score);
 out.push({title:'Recruiting board: '+sorted[0].name+' leads the class',body:sorted[0].pos+' prospect from '+sorted[0].state+' enters the week with the strongest current scouting evaluation.'});
 const offers=r.offers.filter(o=>o.offer);
 if(offers.length)out.push({title:game.name+' earns college offers',body:game.name+' has received '+offers.length+' formal scholarship offer'+(offers.length===1?'':'s')+' after meeting recruiting requirements. Scouting interest is not a scholarship.'});
 else if(game.grade<11)out.push({title:'Regional scouts monitor developing athletes',body:game.name+' continues to develop at '+game.school.name+'. No formal college offers have been issued at this stage.'});
 else out.push({title:game.name+' seeks first college offer',body:'Scouting interest continues, but no formal scholarship offers have been issued. Walk-on paths may be available after graduation.'});
 return out;
}
function collegeReadyFromGraduation(){
 if(!game)return;
 game.stage='recruiting';game.finished=false;game.gamePending=false;game.scheduledEvent=null;
 recruitingState();
 tab='recruiting';note('High school graduation complete. Recruiting and college signing are now available; your high school record remains intact.');persist();
}
function migrateCollegeStage(){
 if(!game)return;
 if(game.finished&&game.grade>=12&&!game.stage)collegeReadyFromGraduation();
 else if(game.stage==='recruiting')recruitingState();
 else if(game.stage==='college')collegeState();
}
function collegeState(){
 if(!game?.college)return null;
 let c=game.college;
 if(!Array.isArray(c.games))c.games=[];
 if(!Array.isArray(c.history))c.history=[];
 if(!Array.isArray(c.news))c.news=[];
 if(!Array.isArray(c.roster))c.roster=[];
 if(!Array.isArray(c.yearHistory))c.yearHistory=[];
 if(!c.program.tier)c.program.tier='FBS';
 if(!Array.isArray(c.programs)||c.programs.length<685){
  const existing=new Map((c.programs||[]).map(p=>[p.id,p]));
  c.programs=collegePrograms().map(p=>existing.has(p.id)?{...p,...existing.get(p.id),tier:existing.get(p.id).tier||p.tier}:p);
  // Keep this career's specific school object connected to the expanded program list.
  c.program=c.programs.find(p=>p.id===c.program.id)||c.program;
 }
 if(!c.pathHistory)c.pathHistory=[];
 if(!c.seasonsAtSchool)c.seasonsAtSchool=0;
 c.weeklyPlan=c.weeklyPlan||{training:11,study:8,recovery:9};
 return c;
}
function collegeGenerateRoster(program,season){
 // Position-room athletes persist, mature and graduate, independent of the user's progress.
 return Array.from({length:6},(_,i)=>({id:'cp-'+season+'-'+program.id+'-'+i,name:pick(FN)+' '+pick(LN),classYear:1+(i%4),ovr:cl(Math.round(program.prestige*.73+12+R(-11,15)+(i%4)*2),31,96),starts:0}));
}
function collegeStartSeason(){
 const c=collegeState();
 c.phase='regular';c.week=1;c.seasonGames=[];c.record=[0,0];c.conferenceRecord=[0,0];c.playoff=null;c.bowl=null;c.redshirtChoice=false;c.gamesPlayedThisYear=0;
 c.roster=c.roster.length?c.roster:collegeGenerateRoster(c.program,c.year);
 c.programs.forEach(p=>{p.record=[0,0];p.points=0;});
 let opponents=c.programs.filter(x=>x.id!==c.program.id&&x.tier===c.program.tier);
 let conf=opponents.filter(x=>x.conference===c.program.conference);
 let non=opponents.filter(x=>x.conference!==c.program.conference);
 const randomSort=a=>a.slice().sort(()=>Math.random()-.5);
 const sameTier=c.programs.filter(x=>x.id!==c.program.id&&x.tier===c.program.tier);
 if(conf.length<5)conf=randomSort(sameTier.filter(x=>x.conference!==c.program.conference));
 non=sameTier.filter(x=>x.conference!==c.program.conference);
 c.schedule=[...randomSort(conf).slice(0,5),...randomSort(non).slice(0,7)].sort(()=>Math.random()-.5).map((p,i)=>({week:i+1,id:p.id,name:p.name,conference:p.conference===c.program.conference,home:i%2===0}));
 c.history.unshift('College season '+c.year+' begins: '+c.program.name+' ('+collegeTier(c.program.tier).label+').');
}
function collegeSign(programId,walkOn=false){
 if(!game||game.stage!=='recruiting')return;
 let r=recruitingState(),pr=r.colleges.find(p=>p.id===Number(programId)),offer=r.offers.find(o=>o.id===Number(programId));
 if(!pr)return;
 if(!walkOn&&!offer?.offer){feedback='This program has not offered a scholarship. Choose the walk-on option if you want to enroll there.';render();return}
 let award=walkOn?0:offer.scholarship;
 if(pr.tier==='D3')award=0;
 let c=game.college={year:1,eligibilityUsed:0,redshirtUsed:false,program:pr,programs:r.colleges.map(p=>({...p,record:[0,0]})),scholarship:award,position:game.pos,roster:[],games:[],history:[],news:[],yearHistory:[],transferHistory:[],nilDeals:[],nilEarned:0,seasonsAtSchool:0,pathHistory:[],gpa:game.gpa,academics:game.iq,weeklyPlan:{training:11,study:8,recovery:9},phase:'regular',week:1,record:[0,0],conferenceRecord:[0,0]};
 game.stage='college';game.finished=false;game.phase=0;game.week=1;game.scheduledEvent=null;game.gamePending=false;
 collegeStartSeason();
 c.news.unshift({year:1,week:1,title:game.name+' signs with '+pr.name,body:(walkOn?'Walk-on enrollment':'Scholarship offer at '+award+'% tuition coverage')+'; joins the '+pr.conference+' conference at '+game.pos+'.'});
 profileMilestone('college-sign','College football commitment',game.name+' enrolled at '+pr.name+'. '+(walkOn?'Walk-on':'Scholarship '+award+'%')+'.',{snapshot:true});
 note('College career begins at '+pr.name+'. '+(walkOn?'Walk-on opportunity.':'Scholarship covers '+award+'% of tuition.')+' High school statistics are preserved.');tab='college';persist();render();
}
function collegeDepth(){
 const c=collegeState();if(!c)return null;
 const room=[{id:'you',name:game.name,ovr:rating(game.attrs,game.pos),classYear:c.year}].concat(c.roster);
 room.sort((a,b)=>b.ovr-a.ovr||b.classYear-a.classYear);
 const rank=room.findIndex(x=>x.id==='you')+1;
 return {room,rank,role:rank===1?'Starter':rank<=3?'Rotation':'Backup'};
}
function collegeEligibility(){
 const c=collegeState();if(!c)return '';
 return c.redshirtUsed?'Redshirt already used':c.redshirtChoice?'Redshirt this year (no games)':'Eligible to play';
}
function collegeSetRedshirt(yes){
 let c=collegeState();if(!c||c.phase!=='regular'||c.week!==1||c.gamesPlayedThisYear>0){feedback='Redshirt decisions must be made before the first college game.';render();return}
 if(yes&&c.redshirtUsed){feedback='The single simplified redshirt season was already used.';render();return}
 c.redshirtChoice=Boolean(yes);c.history.unshift('Year '+c.year+': '+(yes?'Selected redshirt season (no games).':'Chose to compete this year.'));
 persist();render();
}
function collegeMatch(){const c=collegeState();if(!c)return null;
 if(c.phase==='regular')return c.schedule[c.week-1];
 if(c.phase==='postseason')return c.playoff?.nextMatch||c.bowl||null;
 return null;
}
function collegeGenerateStats(role,opp,forceOut=false){
 const c=collegeState(),stats={carries:0,rushYards:0,rushTD:0,receptions:0,recYards:0,recTD:0,passAtt:0,passComp:0,passYards:0,passTD:0,interceptions:0},plays=[];
 const active=!forceOut&&!game.injury;
 const share=!active?0:role==='Starter'?0.86:role==='Rotation'?.34:.09;
 const offense=cl(Math.round(59+(c.program.prestige-opp.prestige)/5),40,82);
 const attempts=game.pos==='QB'?Math.round(offense*.55*share):['RB','FB'].includes(game.pos)?Math.round(offense*(SCHEMES.find(x=>x[0]===c.program.scheme)?.[1]??.50)*.57*share):Math.round(offense*(1-(SCHEMES.find(x=>x[0]===c.program.scheme)?.[1]??.50))*.32*share);
 if(active&&DEFENSIVE_POSITIONS.includes(game.pos)){
   const snaps=Math.round(offense*share),tackles=Math.round(snaps*cl(.07+(game.attrs.vision-45)/650,.03,.16));
   Object.assign(stats,{defSnaps:snaps,tackles,tfl:Math.round(tackles*.17),sacks:['DE','DT','NT','OLB'].includes(game.pos)?Math.round(snaps*.027):0,passDef:['CB','FS','SS'].includes(game.pos)?Math.round(snaps*.035):0,defInt:0});
   plays.push('Defense: '+tackles+' tackles over '+snaps+' snaps.');return {stats,plays};
 }
 if(active&&LINEMEN.includes(game.pos)){
   const snaps=Math.round(offense*share);Object.assign(stats,{offSnaps:snaps,blocks:Math.round(snaps*.56),pressures:Math.round(snaps*.07)});
   plays.push('Offensive line: '+snaps+' snaps.');return {stats,plays};
 }
 if(active&&SPECIAL_POSITIONS.includes(game.pos)){
   if(game.pos==='K')Object.assign(stats,{fgAtt:2,fgMade:1,xpAtt:3,xpMade:3});
   if(game.pos==='P')Object.assign(stats,{punts:4,puntYards:152});
   if(game.pos==='LS')Object.assign(stats,{longSnaps:7});
   plays.push('Special teams appearance.');return {stats,plays};
 }
 const competition=Math.max(-.18,Math.min(.18,(rating(game.attrs,game.pos)-opp.prestige)/180));
 for(let i=0;i<attempts;i++){
  if(game.pos==='QB'){
   stats.passAtt++;const chance=cl(.49+((game.attrs.accuracy||38)+(game.attrs.awareness||38)-100)/520+competition-game.fatigue/1200,.22,.83);
   if(Math.random()<chance){let yards=R(3,26);stats.passComp++;stats.passYards+=yards;if(Math.random()<.067)stats.passTD++;plays.push('Completed pass for '+yards+' yd.');}
   else if(Math.random()<.085){stats.interceptions++;plays.push('Interception.');}else plays.push('Incomplete pass.');
  }else if(game.pos==='RB'){
   let y=R(-3,11)+Math.round((game.attrs.vision-50)/17)+Math.round(competition*11);stats.carries++;stats.rushYards+=y;if(y>0&&Math.random()<.053)stats.rushTD++;plays.push('Carry '+(y>=0?'+':'')+y+' yd.');
  }else{
   if(Math.random()<cl(.56+competition,.22,.84)){let y=R(3,24);stats.receptions++;stats.recYards+=y;if(Math.random()<.07)stats.recTD++;plays.push('Reception for '+y+' yd.');}else plays.push('Target incomplete.');
  }
 }
 return {stats,plays};
}
function collegeStandings(){const c=collegeState();return c?c.programs.filter(p=>p.tier===c.program.tier).sort((a,b)=>(b.record[0]-a.record[0])||((b.prestige)-a.prestige)):[]}
function collegeSimGame(){
 let c=collegeState();if(!c||!['regular','postseason'].includes(c.phase))return;
 const match=collegeMatch();if(!match){collegeFinishYear();render();return}
 const opponent=c.programs.find(p=>p.id===match.id)||{id:-1,name:match.name,prestige:75,conference:'Other'};
 const d=collegeDepth(),active=!c.redshirtChoice&&!game.injury;
 const role=active?d.role:'DNP ('+(c.redshirtChoice?'Redshirt':'Injury')+')';
 const strength=cl(c.program.prestige+(d.role==='Starter'?(rating(game.attrs,game.pos)-65)*.3:0)-game.fatigue*.035,20,100);
 let ourScore=cl(Math.round(R(6,41)+(strength-opponent.prestige)*.32),0,59),theirScore=cl(Math.round(R(6,41)+(opponent.prestige-strength)*.32),0,59);
 if(ourScore===theirScore){if(Math.random()<.5)ourScore+=3;else theirScore+=3;}
 const win=ourScore>theirScore,production=collegeGenerateStats(role,opponent,!active);
 const result={year:c.year,week:c.week,phase:c.phase,opponentName:opponent.name,level:'College',role,score:ourScore,opp:theirScore,win,stats:production.stats,plays:production.plays,conference:match.conference,playoff:c.phase==='postseason'&&c.playoff?.nextMatch===match};
 c.games.unshift(result);c.seasonGames.push(result);if(active)c.gamesPlayedThisYear++;
 if(c.phase==='regular'){
  c.record[win?0:1]++;if(match.conference)c.conferenceRecord[win?0:1]++;
  c.programs.find(p=>p.id===c.program.id).record[win?0:1]++;
  opponent.record[win?1:0]++;
  // Rival programs generate independent results, including season-long records.
  let rivals=c.programs.filter(p=>p.tier===c.program.tier&&p.id!==c.program.id&&p.id!==opponent.id).sort(()=>Math.random()-.5);
  for(let i=0;i+1<rivals.length;i+=2){let a=rivals[i],b=rivals[i+1];let first=Math.random()<cl(.5+(a.prestige-b.prestige)/150,.19,.81);a.record[first?0:1]++;b.record[first?1:0]++;}
  c.week++;
  if(c.week>12)collegePostseasonSelection();
 }else{
  if(c.playoff?.nextMatch===match){
   c.playoff.results.push({round:c.playoff.round,opponent:opponent.name,win,score:ourScore,opp:theirScore});
   if(!win){c.playoff.status='Eliminated';c.playoff.nextMatch=null;collegeFinishYear();}
   else if(c.playoff.round==='Semifinal'){
    c.playoff.round='Championship';let second=collegeStandings().filter(p=>p.id!==c.program.id&&p.id!==opponent.id)[0];c.playoff.nextMatch={id:second.id,name:second.name,conference:false};c.week++;
   }else{c.playoff.status='National champion';c.playoff.nextMatch=null;collegeFinishYear();}
  }else{c.bowl={...c.bowl,result:win?'Won':'Lost'};collegeFinishYear();}
 }
 const headline=(win?'Victory: ':'Defeat: ')+c.program.name+' '+ourScore+'–'+theirScore+' vs '+opponent.name;
 c.news.unshift({year:c.year,week:result.week,title:headline,body:game.name+' ('+role+'): '+gameStatsDescription(result,game.pos)+' College record: '+c.record.join('–')+'.'});
 c.news=c.news.slice(0,150);
 c.history.unshift('Year '+c.year+', '+c.phase+' Week '+result.week+': '+(win?'W':'L')+' '+ourScore+'–'+theirScore+' vs '+opponent.name+'. '+gameStatsDescription(result,game.pos));
 collegeAdvancePlayerWeek(result,role);
 persist();render();
}
function collegePostseasonSelection(){
 let c=collegeState();const ranked=collegeStandings();
 const eligible=ranked.slice(0,4).some(p=>p.id===c.program.id);
 c.phase='postseason';c.week=13;
 if(eligible){let opponents=ranked.slice(0,4).filter(p=>p.id!==c.program.id);let pickOpp=opponents[opponents.length-1];c.playoff={status:'Qualified',round:'Semifinal',results:[],nextMatch:{id:pickOpp.id,name:pickOpp.name,conference:false}};c.news.unshift({year:c.year,week:12,title:c.program.name+' qualifies for the national semifinal',body:'Top-four fictional college playoff selection based on current college records and program strength.'});}
 else if(c.record[0]>=6){let opponent=ranked.filter(p=>p.id!==c.program.id)[cl(10,0,ranked.length-2)];c.bowl={id:opponent.id,name:opponent.name,conference:false,title:'Winter Bowl'};c.news.unshift({year:c.year,week:12,title:c.program.name+' earns a bowl invitation',body:'With '+c.record.join('–')+' record, the program qualifies for a fictional bowl game.'});}
 else{c.phase='offseason';collegeFinishYear();}
}
function collegeFinishYear(){
 let c=collegeState();if(!c||c.phase==='offseason'&&c.yearHistory.some(x=>x.year===c.year))return;
 const redshirt=c.program.tier==='JUCO'?false:(c.redshirtChoice||c.gamesPlayedThisYear===0);
 if(redshirt&&!c.redshirtUsed)c.redshirtUsed=true;else c.eligibilityUsed++;
 c.seasonsAtSchool++;
 c.yearHistory.push({year:c.year,program:c.program.name,record:c.record.slice(),conferenceRecord:c.conferenceRecord.slice(),gamesPlayed:c.gamesPlayedThisYear,redshirt,scholarship:c.scholarship,postseason:c.playoff?.status||c.bowl?.result||'None'});
 c.phase='offseason';c.week=0;c.history.unshift('College year '+c.year+' complete: '+c.record.join('–')+'; '+(redshirt?'redshirt year':'eligibility season #'+c.eligibilityUsed)+'.');
 c.news.unshift({year:c.year,week:14,title:'Season review: '+c.program.name,body:'Final regular-season record '+c.record.join('–')+'. '+(redshirt?'Redshirt season preserved eligibility.':'Athlete used one season of eligibility.')});
 if(c.program.tier==='JUCO'&&c.seasonsAtSchool>=2){c.phase='jucoGraduation';collegeTransferTier='FCS';c.history.unshift('JUCO graduation: choose a four-year transfer destination to continue your college career.');c.news.unshift({year:c.year,week:0,title:game.name+' enters four-year recruiting after JUCO',body:'Two seasons at '+c.program.name+' complete. Transfer interest reflects college performance and development.'});}
 else if(c.eligibilityUsed>=4||c.year>=5){c.phase='complete';game.stage='collegeComplete';profileMilestone('college-completed','College football career completed','Finished at '+c.program.name+' after '+c.year+' academic year(s).',{snapshot:true});}
 persist();
}
function collegeNextYear(){
 const c=collegeState();if(!c||c.phase!=='offseason')return;
 if(c.program.tier==='JUCO'&&c.seasonsAtSchool>=2){c.phase='jucoGraduation';render();return}
 if(c.eligibilityUsed>=4||c.year>=5){collegeFinishYear();render();return}
 c.year++;
 c.roster=c.roster.filter(x=>x.classYear<4).map(x=>({...x,classYear:x.classYear+1,ovr:cl(x.ovr+R(0,4),20,99)}));
 while(c.roster.length<6)c.roster.push({id:'cp-'+c.year+'-'+R(1000,9999),name:pick(FN)+' '+pick(LN),classYear:1,ovr:cl(c.program.prestige+R(-15,12),30,94),starts:0});
 // Campus football support and tuition sponsorship matter financially, not as OVR purchases.
 game.money+=Math.round((c.scholarship/100)*80);
 collegeStartSeason();game.stage='college';persist();render();
}
function collegeTransferOptions(){
 const c=collegeState();if(!c)return [];
 const score=rating(game.attrs,game.pos),seen=game.college.games.filter(g=>g.role==='Starter').length;
 return c.programs.filter(x=>x.id!==c.program.id&&(c.phase!=='jucoGraduation'||x.tier!=='JUCO')).map(p=>({program:p,interest:collegeTransferInterest(p,score,seen),scholarship:p.tier==='D3'?0:cl(Math.round(score-collegeOfferMinimum(p)+55),0,100)})).sort((a,b)=>b.interest-a.interest);
}
function collegeTransfer(id){
 const c=collegeState();if(!c||!['offseason','jucoGraduation'].includes(c.phase))return;
 if(c.transferHistory.some(x=>x.year===c.year)){feedback='One transfer per offseason is permitted.';render();return}
 const choice=collegeTransferOptions().find(x=>x.program.id===Number(id));
 if(!choice||choice.interest<25){feedback='That school has not expressed sufficient transfer interest.';render();return}
 const from=c.program.name,fromTier=c.program.tier,wasJucoGraduation=c.phase==='jucoGraduation';c.program=choice.program;c.scholarship=choice.interest>=50?choice.scholarship:0;c.roster=collegeGenerateRoster(c.program,c.year+1);c.seasonsAtSchool=0;
 c.pathHistory.push({year:c.year,from,fromTier,to:c.program.name,toTier:c.program.tier});
 if(wasJucoGraduation){c.phase='offseason';c.history.unshift('JUCO pathway completed: eligible to continue at '+c.program.name+'.');}
 c.transferHistory.push({year:c.year,from,to:c.program.name,scholarship:c.scholarship});
 c.news.unshift({year:c.year,week:0,title:game.name+' transfers to '+c.program.name,body:'Leaves '+from+' after college season '+c.year+'. New scholarship coverage '+c.scholarship+'%.'});
 profileMilestone('transfer-'+c.year,'College transfer',from+' → '+c.program.name+'.',{snapshot:true});
 c.history.unshift('Transfer portal: '+from+' → '+c.program.name+'.');persist();render();
}
function collegeNilOffer(){
 const c=collegeState();if(!c)return null;
 const games=c.games.filter(g=>g.year===c.year),starts=games.filter(g=>g.role==='Starter').length;
 const multiplier={FBS:1,FCS:.65,D2:.45,D3:.25,NAIA:.35,JUCO:.2}[c.program.tier]||1;
 const value=cl(Math.round((30+c.program.prestige*.55+starts*8+(rating(game.attrs,game.pos)-60)*.9)*multiplier),10,380);
 return {value,hours:3,title:'Local athlete appearance'};
}
function collegeAcceptNil(){
 const c=collegeState();if(!c||c.phase==='complete'||c.phase==='postseason')return;
 if(c.nilDeals.some(x=>x.year===c.year)){feedback='Only one NIL appearance offer is available per college season in this prototype.';render();return}
 const offer=collegeNilOffer();c.nilDeals.push({year:c.year,...offer});c.nilEarned+=offer.value;game.money+=offer.value;
 game.stress=cl(game.stress+2,0,100);
 c.history.unshift('NIL: earned $'+offer.value+' for a local appearance; +2 stress.');c.news.unshift({year:c.year,week:c.week,title:game.name+' signs local NIL appearance',body:'A $'+offer.value+' local appearance contract; no direct attribute increases.'});persist();render();
}
function collegeSetPlan(key,value){
 const c=collegeState();if(!c||!['training','study','recovery'].includes(key))return;
 const plan=c.weeklyPlan,old=plan[key],desired=cl(Math.round(Number(value)||0),0,20);
 const other=Object.keys(plan).filter(x=>x!==key).reduce((n,k)=>n+plan[k],0);
 plan[key]=Math.min(desired,40-other);
 if(plan[key]!==desired)feedback='College schedule allows a maximum of 40 discretionary hours. Reduce another commitment first.';
 else feedback='College schedule updated. The next college game applies your plan.';
 persist();render();
}
function collegeAdvancePlayerWeek(result,role){
 const c=collegeState(),plan=c.weeklyPlan;
 const prev=game.fatigue,h=healthState(),isRedshirt=c.redshirtChoice;
 const contacts=game.pos==='QB'?(result.stats.passAtt||0)*.19:(result.stats.carries||0)*1.05+(result.stats.receptions||0)*.72;
 const gameLoad=contacts*.23+(role==='Starter'?1.3:role==='Rotation'?.7:role==='Backup'?.25:0);
 const trainLoad=plan.training*(.13+.13*game.extraIntensity);
 const practiceLoad=isRedshirt?2.7:4.8;
 const rest=4.3+plan.recovery*.72;
 const peak=cl(prev+gameLoad+trainLoad+practiceLoad,0,100);
 game.fatigue=cl(Math.round((peak-rest)*10)/10,0,100);
 const beforeWear=h.wear;
 h.wear=cl(Math.round((h.wear+contacts*.025*(1+peak/160)+Math.max(0,game.fatigue-70)*.012-.035)*100)/100,0,100);
 h.weekReports.unshift({year:'College '+c.year,phase:'College season',week:result.week,before:prev,peak,after:game.fatigue,team:+practiceLoad.toFixed(1),extra:+trainLoad.toFixed(1),game:+gameLoad.toFixed(1),field:0,work:0,natural:4.3,dedicated:+(plan.recovery*.72).toFixed(1),wearBefore:beforeWear,wearAfter:h.wear,contacts,injuryStatus:game.injury?.name||'None',contactWear:+(contacts*.025*(1+peak/160)).toFixed(3),overloadWear:+(Math.max(0,game.fatigue-70)*.012).toFixed(3),injuryWear:0,wearRecovery:.035});
 h.weekReports=h.weekReports.slice(0,100);
 if(game.injury){game.injury.weeks--;if(game.injury.weeks<=0){game.injury=null;c.history.unshift('College medical staff cleared the previous injury.')}}
 else{
  const risk=cl((.001+peak*.00019+contacts*.00027+h.wear*.00013)*(game.gearProtection?.75:1),0,.06);
  if(Math.random()<risk){const name=pick(['Ankle sprain','Shoulder sprain','Hamstring strain','Wrist sprain']);game.injury={name,weeks:R(1,3),severity:1};h.injuryHistory.unshift({name,year:'College '+c.year,phase:'College',week:result.week,weeks:game.injury.weeks});c.news.unshift({year:c.year,week:result.week,title:game.name+' sidelined by injury',body:'Injury: '+name+'. Current medical absence '+game.injury.weeks+' week(s).'});}
 }
 // Same development threshold as high school (12 progress per attribute point).
 // College coaching/facilities matter; no arbitrary ability cap below 99.
 const efficiency=cl(.65+game.iq/180+game.morale/250-game.stress/380-game.fatigue/370,.4,1.5)*(game.injury?.38:1);
 const base=5.2*(c.program.coaching/65)*(c.program.facilities/70);
 const extra=plan.training*(.30+game.extraIntensity*.16);
 const logs=[];
 for(const group of GROUPS[game.pos]){
   const hrs=game.focus[group[0]]||0;
   const inc=(base/GROUPS[game.pos].length+extra*hrs/Math.max(1,game.plan.training||7))*efficiency;
   for(let i=0;i<group[2].length;i++){
     const key=group[2][i];game.progress[key]=(game.progress[key]||0)+inc*(i===0?1:.6)*cl((105-game.attrs[key])/65,.35,1.35);
     let gained=0;while(game.progress[key]>=12&&game.attrs[key]<99){game.attrs[key]++;game.progress[key]-=12;gained++;}
     if(gained)logs.push(key+' +'+gained);
   }
 }
 if(logs.length)c.history.unshift('College development: '+logs.join(', ')+'.');
 c.gpa=cl(Math.round((c.gpa+(game.iq-50)/3200+(plan.study-6)*.008-game.stress/8000)*1000)/1000,0,4);
 game.stress=cl(game.stress+Math.max(0,plan.training-14)*.3-plan.recovery*.11+1,0,100);
}
function collegePlayerRecord(){let c=collegeState();return c?profileStats(c.games):null}
function collegeNewsHtml(){
 const c=collegeState(),arr=c?c.news:recruitingNews();
 return panel('THE GRIDIRON GAZETTE · College edition',arr.slice(0,18).map(item=>'<div class="log"><strong>'+e(item.title)+'</strong><br>'+e(item.body)+'</div>').join('')||'<p>No college news yet.</p>');
}
function collegeTierSelect(){
 const r=recruitingState();return panel('Explore college divisions',
  '<div class="grid">'+COLLEGE_TIERS.map(t=>{const list=r.colleges.filter(p=>p.tier===t.code);let offers=r.offers.filter(o=>o.offer&&list.some(p=>p.id===o.id)).length;return '<div class="tile"><strong>'+e(t.label)+'</strong><br><small>'+list.length+' programs · '+offers+' scholarship offers'+(t.code==='D3'?' · no athletic scholarships':'')+'</small><br><button class="alt" onclick="collegeViewTier=\''+t.code+'\';collegeRecruitPage=0;render()">Browse '+e(t.code)+'</button></div>'}).join('')+'</div>');
}
let collegeViewTier='FBS';
let collegeRecruitPage=0;
let collegeTransferTier='FBS';
let collegeTransferPage=0;
function recruitingScreen(){
 const r=recruitingState(),stand=[...r.board,{id:'you',name:game.name,pos:game.pos,state:game.hometown||'Home state',score:r.scouting}].sort((a,b)=>b.score-a.score).slice(0,250),rank=stand.findIndex(x=>x.id==='you')+1;
 const tier=collegeTier(collegeViewTier),programs=r.colleges.filter(p=>p.tier===tier.code),available=programs.map(p=>({program:p,offer:r.offers[p.id]}));
 const scholarship=available.filter(x=>x.offer.offer),walkons=available.filter(x=>!x.offer.offer);
 const makeRows=(choices,walk)=>choices.slice(collegeRecruitPage*12,(collegeRecruitPage+1)*12).map(x=>'<div class="tile college-choice"><div><strong>'+e(x.program.name)+'</strong><br><small>'+e(x.program.conference)+' · '+e(tier.label)+' · Prestige '+x.program.prestige+' · Coaching '+x.program.coaching+' · Facilities '+x.program.facilities+'</small><br><small>'+(walk?'Walk-on / no athletic scholarship · Interest '+x.offer.interest+'/100': 'Scholarship '+x.offer.scholarship+'%')+'</small></div><button onclick="collegeSign('+x.program.id+','+walk+')">'+(walk?'Walk on':'Sign')+'</button></div>').join('');
 return panel('Recruiting profile · '+game.name,'<div class="grid">'+[['Recruiting stars',r.stars?'★'.repeat(r.stars)+'☆'.repeat(5-r.stars):'Unrated'],['Scouting score',r.scouting+'/99'],['Prospect board rank',rank>0?'#'+rank+' / Top 250':'Unranked'],['Total scholarship offers',r.offers.filter(o=>o.offer).length]].map(x=>'<div class="tile"><small>'+e(x[0])+'</small><div class="num">'+e(x[1])+'</div></div>').join('')+'</div><p class="muted">685 fictional colleges across six levels. Division III does not offer athletic scholarships. JUCO is a two-season pathway into four-year programs.</p>')+
 collegeTierSelect()+panel('Programs · '+e(tier.label),'<p>Showing page '+(collegeRecruitPage+1)+'; use the navigation below to browse all programs in this division.</p><div class="buttons"><button class="alt" '+(collegeRecruitPage<=0?'disabled':'')+' onclick="collegeRecruitPage=Math.max(0,collegeRecruitPage-1);render()">Previous programs</button><button class="alt" '+((collegeRecruitPage+1)*12>=Math.max(scholarship.length,walkons.length)?'disabled':'')+' onclick="collegeRecruitPage++;render()">Next programs</button></div><h3>Scholarship offers ('+scholarship.length+')</h3>'+(makeRows(scholarship,false)||'<p>No scholarship offers at this level.</p>')+'<h3>Walk-on / open enrollment ('+walkons.length+')</h3>'+(makeRows(walkons,true)||'<p>No additional programs.</p>'))+
 panel('National Top 250 · leading prospects',stand.slice(0,12).map((p,i)=>'<div class="line"><span>#'+(i+1)+' · '+e(p.name)+' ('+e(p.pos)+')'+(p.id==='you'?' · YOU':'')+'</span><strong>'+p.score+'</strong></div>').join(''))+
 panel('THE GRIDIRON GAZETTE · Recruiting',recruitingNews().map(x=>'<div class="log"><strong>'+e(x.title)+'</strong><br>'+e(x.body)+'</div>').join(''));
}
function collegeScreen(){
 let c=collegeState();if(!c)return '<p>No college has been chosen.</p>';
 let d=collegeDepth(),m=collegeMatch(),rankings=collegeStandings(),top=rankings.slice(0,10);
 const stats=collegePlayerRecord(),season=c.games.filter(x=>x.year===c.year),last=c.games[0];
 let action=c.phase==='regular'||c.phase==='postseason'?'<div class="story"><h3>'+e(c.phase==='regular'?'Week '+c.week+' · '+m?.name:(c.playoff?.nextMatch?'National '+c.playoff.round:'Winter Bowl'))+'</h3><p>'+e(m?.name||'Opponent pending')+' · '+(m?.conference?'Conference game':'Nonconference/postseason')+'</p><p>Coach evaluates you as '+e(d.role)+' (#'+d.rank+' at '+e(game.pos)+'). '+(c.redshirtChoice?'You are redshirting; no personal snaps this year.':'Your attributes and practice compete against existing players.')+'</p><button onclick="collegeSimGame()">Simulate College Game</button></div>':
 c.phase==='jucoGraduation'?'<div class="story"><h3>JUCO graduation · Four-year recruiting</h3><p>Two junior-college seasons are complete. Choose an eligible four-year transfer destination below to continue your career.</p></div>':c.phase==='offseason'?'<div class="story"><h3>College offseason</h3><p>Year '+c.year+' finished. You can review the transfer portal, NIL and your roster before advancing to the next college year.</p><button onclick="collegeNextYear()">Begin Next College Season</button></div>':
 '<p><strong>College football career complete.</strong> Your college and high school records remain in History.</p>';
 let teamRows=d.room.map((x,i)=>'<tr'+(x.id==='you'?' class="selected-school"':'')+'><td>'+(i+1)+'</td><td>'+e(x.name)+(x.id==='you'?' (YOU)':'')+'</td><td>'+x.classYear+'</td><td>'+x.ovr+'</td></tr>').join('');
 return panel('College football · '+e(c.program.name),'<p>'+e(collegeTier(c.program.tier).label)+' · '+e(c.program.conference)+' conference · '+e(c.program.scheme)+' offense · School year '+c.year+' · '+e(c.phase)+' · Scholarship '+c.scholarship+'%</p><div class="grid">'+[['Record',c.record.join('–')],['Conference',c.conferenceRecord.join('–')],['Depth chart','#'+d.rank+' '+d.role],['Eligibility',c.eligibilityUsed+'/4 seasons used'],['College GPA',c.gpa.toFixed(2)],['NIL earnings','$'+c.nilEarned]].map(x=>'<div class="tile"><small>'+e(x[0])+'</small><div class="num">'+e(x[1])+'</div></div>').join('')+'</div><p>'+e(game.name)+' · '+e(game.pos)+' · '+rating(game.attrs,game.pos)+' OVR. Your high school abilities were preserved; college opponents are stronger.</p>'+action)+
 panel('Redshirt & eligibility','<p>'+e(collegeEligibility())+'. This simplified fictional system permits one redshirt season with no games and four playing seasons over a maximum of five college years.</p>'+(c.phase==='regular'&&c.week===1&&!c.gamesPlayedThisYear&&!c.redshirtUsed?'<div class="buttons"><button class="alt" onclick="collegeSetRedshirt(true)">Redshirt this year</button><button class="alt" onclick="collegeSetRedshirt(false)">Play this year</button></div>':''))+
 panel('College position room','<table><thead><tr><th>#</th><th>Player</th><th>Year</th><th>OVR</th></tr></thead><tbody>'+teamRows+'</tbody></table><p class="muted">Starting roles are performance-based on current rating and position-room competition. No automatic player starting priority.</p>')+
 panel('College team schedule',c.schedule.map(x=>{let played=season.find(g=>g.week===x.week&&g.phase==='regular');return '<div class="line"><span>W'+x.week+' · '+e(x.name)+(x.conference?' · Conf.':'')+'</span><strong>'+(played?(played.win?'W ':'L ')+played.score+'–'+played.opp:'Upcoming')+'</strong></div>'}).join('')+(c.playoff?'<p><strong>Playoff:</strong> '+e(c.playoff.status)+' · '+e(c.playoff.round)+'</p>':'')+(c.bowl?'<p><strong>Winter Bowl:</strong> '+e(c.bowl.name)+' · '+e(c.bowl.result||'Upcoming')+'</p>':''))+
 panel('Conference & divisional standings','<p class="muted">'+c.programs.filter(p=>p.tier===c.program.tier).length+' programs in '+e(collegeTier(c.program.tier).label)+'. Divisional top four compete for a two-round fictional championship; other eligible teams may receive an exhibition bowl.</p>'+top.map((p,i)=>'<div class="line"><span>#'+(i+1)+' '+e(p.name)+(p.id===c.program.id?' · YOU':'')+'</span><strong>'+p.record.join('–')+'</strong></div>').join('')+'<details><summary>Full conference standings</summary>'+c.programs.filter(p=>p.conference===c.program.conference).sort((a,b)=>b.record[0]-a.record[0]).map(p=>'<div class="line"><span>'+e(p.name)+'</span><strong>'+p.record.join('–')+'</strong></div>').join('')+'</details>')+
 panel('College development & money','<p>Your original attributes and development progress carry over. College coaching, your existing training focus, academics, fatigue and recovery influence subsequent college weeks. No forced OVR reduction or artificial new cap.</p>'+['training','study','recovery'].map(k=>'<div class="line"><span>'+e(k[0].toUpperCase()+k.slice(1))+' hours/week</span><strong>'+c.weeklyPlan[k]+'h</strong></div><input aria-label="College '+e(k)+' hours" type="range" min="0" max="20" value="'+c.weeklyPlan[k]+'" oninput="collegeSetPlan(\''+k+'\',this.value)">').join('')+'<p class="muted">'+Object.values(c.weeklyPlan).reduce((n,x)=>n+x,0)+' / 40 hours allocated. Game weeks advance through the College Football button. College study hours are a real commitment; the optional study *planner* is deferred.</p><div class="line"><span>Current fatigue</span><strong>'+Math.round(game.fatigue)+'/100</strong></div><div class="line"><span>Bank balance</span><strong>$'+Math.round(game.money)+'</strong></div><div class="line"><span>Local NIL appearance</span><strong>+$'+collegeNilOffer().value+' · +2 stress</strong></div><button class="alt" '+(c.nilDeals.some(x=>x.year===c.year)||c.phase==='complete'||c.phase==='postseason'?'disabled':'')+' onclick="collegeAcceptNil()">Accept NIL Appearance</button>')+
 (['offseason','jucoGraduation'].includes(c.phase)?panel('Transfer portal','<p>Enter the transfer portal between college seasons. Compare interest, scholarship and the new position room. Transfer decisions are final for the current offseason.</p>'+'<div class="buttons">'+COLLEGE_TIERS.filter(t=>c.phase!=="jucoGraduation"||t.code!=="JUCO").map(t=>'<button class="'+(collegeTransferTier===t.code?'':'alt')+'" onclick="collegeTransferTier=\''+t.code+'\';collegeTransferPage=0;render()">'+e(t.code)+'</button>').join('')+'</div><div class="buttons"><button class="alt" '+(collegeTransferPage===0?'disabled':'')+' onclick="collegeTransferPage=Math.max(0,collegeTransferPage-1);render()">Previous programs</button><button class="alt" onclick="collegeTransferPage++;render()">Next programs</button></div>'+collegeTransferOptions().filter(x=>x.program.tier===collegeTransferTier).slice(collegeTransferPage*12,(collegeTransferPage+1)*12).map(x=>'<div class="line"><span>'+e(x.program.name)+' · '+e(collegeTier(x.program.tier).label)+' · '+x.program.prestige+' prestige · '+x.interest+' interest · '+x.scholarship+'% aid</span><button class="alt" '+(x.interest<25||c.transferHistory.some(t=>t.year===c.year)?'disabled':'')+' onclick="collegeTransfer('+x.program.id+')">Transfer</button></div>').join('')):'')+
 panel('College game log',last?'<p><strong>Most recent:</strong> '+e(last.opponentName)+' '+(last.win?'W':'L')+' '+last.score+'–'+last.opp+' · '+e(last.role)+' · '+gameStatsDescription(last,game.pos)+'</p><details><summary>View actual player plays ('+last.plays.length+')</summary>'+last.plays.map(x=>'<div class="log">'+e(x)+'</div>').join('')+'</details>':'<p>No college games played yet.</p>')+
 collegeNewsHtml()+panel('College history & transfer record',c.yearHistory.map(y=>'<div class="log">Year '+y.year+' · '+e(y.program)+' · '+y.record.join('–')+' · '+(y.redshirt?'Redshirt':'Used eligibility')+' · '+e(y.postseason)+'</div>').join('')+c.transferHistory.map(x=>'<div class="log">Transfer after Year '+x.year+': '+e(x.from)+' → '+e(x.to)+'</div>').join('')+'<div class="buttons"><button class="alt" onclick="tab=\'history\';render()">View high school history</button><button onclick="exportSave()">Export full career save</button></div>');
}

function collegeProfilePanel(){
 const c=collegeState();if(!c)return '';
 const stats=collegePlayerRecord();
 const ratings=[...ATTRS].sort((a,b)=>game.attrs[b]-game.attrs[a]).slice(0,4);
 const finished=c.yearHistory.length,starts=c.games.filter(x=>x.role==='Starter').length;
 const bio=game.name+' enrolled at '+c.program.name+' as a '+game.pos+' after completing high school at '+game.school.name+'. In '+(finished?'college season '+c.year:'the first college season')+', '+(starts?'has made '+starts+' college start(s)':'is still competing for a first college start')+' while pursuing eligibility and athletic development.';
 return panel('College athlete profile · '+e(c.program.name),
  '<p>'+e(bio)+'</p><div class="grid">'+[['Current OVR',rating(game.attrs,game.pos)],['College games',stats.games],['College starts',stats.starts],['College GPA',c.gpa.toFixed(2)],['Scholarship',c.scholarship+'%'],['Eligibility used',c.eligibilityUsed+'/4']].map(([k,v])=>'<div class="tile"><small>'+e(k)+'</small><div class="num">'+e(v)+'</div></div>').join('')+'</div>'+
  '<p><strong>College totals:</strong> '+e(profileStatLine(stats,game.pos))+'</p><p><strong>Current strengths:</strong> '+ratings.map(k=>e(k)+' '+game.attrs[k]).join(' · ')+'</p>'+
  '<p class="muted">College and high school records are preserved separately. The historical high school profile appears below.</p>');
}
