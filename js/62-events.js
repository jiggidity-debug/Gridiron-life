/* v0.5 Part 2: contextual events, named relationships and tutoring follow-through. */
function socialState(){
  game.relationships=game.relationships||{teacher:game.relationship??50,family:game.relationship??50,teammate:game.relationship??50,coach:game.coachTrust??45};
  game.eventLast=game.eventLast||{};
  game.eventFlags=game.eventFlags||{};
  return game.relationships;
}
function adjustRelationship(who,amount){let rel=socialState();rel[who]=cl((rel[who]||50)+amount,0,100);game.relationship=Math.round((rel.teacher+rel.family+rel.teammate)/3)}
function maybeEvent(){
  if(game.scheduledEvent||game.finished)return;
  game.eventCount=(game.eventCount||0)+1;
  if(game.eventCount%3!==0)return;
  const now=game.yearWeeks||0,rel=socialState(),stories=[];
  const ok=(id,cooldown)=>!Number.isFinite(game.eventLast[id])||now-game.eventLast[id]>=cooldown;
  if(PHASES[game.phase].school && strugglingCourses().length && ok('academic',9)){
    const course=lowestCourse();
    stories.push({kind:'academic',title:'Academic concern — '+course,body:'Ms. Rivera says your '+course+' grade is '+Math.round(academicState().courses[course])+'%. She offers to help before the next grading check.',choices:[['Arrange tutoring','Tutoring is arranged for '+course+'.',3],['Discuss a study plan','Ms. Rivera offers an assignment checklist.',1],['Ignore the warning','Ms. Rivera is disappointed that you are avoiding the problem.',-3]]});
  }
  if(!game.eventFlags.familyPlan && (game.stress>=18||game.familyExpect>=12) && ok('family',12)){
    stories.push({kind:'family',title:'Pressure at home',body:'Your family asks how you plan to balance football, school, and everything else.',choices:[['Share your schedule','Your family appreciates being included in your plans.',5],['Ask for practical help','They discuss practical help and your weekly obligations.',3],['Keep it to yourself','Your family remains worried about how you are managing.',-2]]});
  }
  if(game.plan.social>=2 && ok('teammate',10)){
    stories.push({kind:'teammate',title:'Teammate asks for help',body:'Marcus, a teammate, struggles with the playbook and asks you to review it together.',choices:[['Help Marcus after practice','Marcus thanks you for spending time together.',5],['Give him advice','Marcus appreciates your encouragement.',2],['Decline to help','Marcus is disappointed.',-3]]});
  }
  if(game.teamIntensity<=1 && ok('practice',8) && game.phase!==3){
    stories.push({kind:'practice',title:'Coach notices your effort',body:game.school.coach+' notices you have been taking practices lightly. He wants to know if you are physically struggling or simply coasting.',choices:[['Explain recovery concerns','Coach agrees to discuss a more sustainable approach.',1],['Commit to more effort','Coach expects to see the change in the coming weeks.',2],['Dismiss the criticism','Coach is frustrated by your response.',-5]]});
  }
  if(!stories.length)return;
  const ev=pick(stories);game.scheduledEvent=ev;game.eventLast[ev.kind]=now;
  note('Story event: '+ev.title);
}
function chooseEvent(i){
  let ev=game.scheduledEvent;if(!ev)return;
  const c=ev.choices[i];if(!c)return;
  const kind=ev.kind||(/Academic warning/i.test(ev.title)?'academic':/Pressure at home/i.test(ev.title)?'family':/Teammate/i.test(ev.title)?'teammate':'reflection');
  let relName={academic:'teacher',family:'family',teammate:'teammate',practice:'coach'}[kind];
  const points=c[2]||0;
  if(relName){adjustRelationship(relName,points);if(relName==='coach')game.coachTrust=cl(game.coachTrust+points,0,100)}
  if(kind==='academic'){
    if(i===0){let a=academicState();if(!a.tutoring?.active){a.tutoring={active:true,course:lowestCourse(),teacher:'Ms. Rivera',hours:2,sessions:0};note('Tutoring arranged for '+a.tutoring.course+'. It will use 2 of your existing study hours per week, if scheduled.')}else note('You are already enrolled in '+a.tutoring.course+' tutoring.');}
    else if(i===1)academicState().preparedness=cl(academicState().preparedness+3,0,100);
    else game.behavior=cl(game.behavior-1,0,99);
  }
  if(kind==='family'){
    game.eventFlags=game.eventFlags||{};game.eventFlags.familyPlan=true;
    if(i===1)game.stress=cl(game.stress-3,0,100);
  }
  if(kind==='teammate'&&i===0)game.morale=cl(game.morale+2,0,100);
  if(kind==='practice'){
    if(i===0)game.stress=cl(game.stress-2,0,100);
    if(i===1)game.behavior=cl(game.behavior+1,0,99);
    if(i===2)game.behavior=cl(game.behavior-3,0,99);
  }
  if(kind==='reflection')game.stress=cl(game.stress-1,0,100);
  game.morale=cl(game.morale+points/3,0,100);
  const relationshipText=relName?' '+({teacher:'Ms. Rivera',family:'Family',teammate:'Marcus',coach:game.school.coach}[relName])+' relationship '+(points>=0?'+':'')+points+'.':'';
  note(c[1]+relationshipText);
  game.scheduledEvent=null;persist();render();
}
