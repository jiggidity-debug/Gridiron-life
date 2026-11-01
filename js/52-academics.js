/* v0.5 Part 2: grades are earned during terms, while cumulative GPA is posted at term end. */
const COURSES=['English','Mathematics','Science','History'];
function academicState(){
  if(!game.academics){
    let startingGpa=cl(Number(game.gpa)||3,0,4),startGrade=cl(Math.round(58+startingGpa*9),62,95);
    const existingTerms=Math.max(0, (game.year-1)*2+(game.phase>=1?1:0));
    game.academics={courses:Object.fromEntries(COURSES.map((c,i)=>[c,cl(startGrade+(i%2? -2:2),50,98)])),preparedness:65,completedTerms:existingTerms,termReports:[],weekReports:[],tutoring:null,studySuppliesTerm:'',lastTerm:'',supportSessions:0};
  }
  const a=game.academics;
  a.courses=a.courses||Object.fromEntries(COURSES.map(c=>[c,84]));
  a.termReports=a.termReports||[];a.weekReports=a.weekReports||[];
  if(!Number.isFinite(a.completedTerms))a.completedTerms=0;
  if(!Number.isFinite(a.preparedness))a.preparedness=65;
  return a;
}
function activeTerm(){return game.phase===0?'Fall':(game.phase===1||game.phase===2)?'Spring':null}
function termKey(){return game.year+'-'+(activeTerm()||'Break')}
function gradePoints(percent){return percent>=90?4:percent>=80?3:percent>=70?2:percent>=60?1:0}
function lowestCourse(){let a=academicState();return COURSES.reduce((low,c)=>a.courses[c]<a.courses[low]?c:low,COURSES[0])}
function strugglingCourses(){let a=academicState();return COURSES.filter(c=>a.courses[c]<70)}
function scheduleTutoring(){
  const a=academicState(),course=lowestCourse();
  if(a.tutoring?.active){feedback='Tutoring is already arranged for '+a.tutoring.course+'. Set at least 2 studying hours weekly to attend.';render();return false}
  a.tutoring={active:true,course,teacher:'Ms. Rivera',hours:2,sessions:0};
  note('Ms. Rivera agreed to tutor you in '+course+'. Set at least 2 hours of studying weekly; tutoring uses 2 of those study hours, not extra time.');persist();render();return true;
}
function endTutoring(){let a=academicState();if(a.tutoring){a.tutoring.active=false;note('You ended regular '+a.tutoring.course+' tutoring.');persist();render()}}
function applyAcademicsWeek(){
  const a=academicState();if(!PHASES[game.phase].school)return; // School's out: no regular grades or GPA changes.
  let study=game.plan.study,attendance=Boolean(a.tutoring?.active&&study>=a.tutoring.hours);
  let efficiency=cl(.65+game.iq/160-game.stress/320-game.fatigue/450,.40,1.45);
  let preparednessChange=(study-5.5)*1.5*efficiency-0.65;
  if(attendance){preparednessChange+=2+(game.transportWeeks>0?.7:0);a.tutoring.sessions++;a.supportSessions++}
  a.preparedness=cl(a.preparedness+preparednessChange,0,100);
  const term=termKey(),supplies=a.studySuppliesTerm===term?1.35:0;
  for(const course of COURSES){
    let academicDelta=cl((a.preparedness-60)/55+(study-6)*.13+(game.iq-50)/130-game.stress/170,-1.35,1.05);
    if(attendance&&a.tutoring.course===course)academicDelta+=.9;
    academicDelta+=supplies/COURSES.length;
    a.courses[course]=cl(Math.round((a.courses[course]+academicDelta)*10)/10,0,100);
  }
  a.weekReports.unshift({year:game.year,phase:PHASES[game.phase].name,week:game.week,study,preparedness:Math.round(a.preparedness),courses:{...a.courses},tutoring:attendance});
  a.weekReports=a.weekReports.slice(0,30);
}
function finalizeSemester(semester){
  const a=academicState(),key=game.year+'-'+semester;
  if(a.lastTerm===key||a.termReports.some(r=>r.key===key))return;
  const termGpa=COURSES.reduce((n,c)=>n+gradePoints(a.courses[c]),0)/COURSES.length;
  game.gpa=cl((game.gpa*a.completedTerms+termGpa)/(a.completedTerms+1),0,4);
  a.completedTerms++;
  a.lastTerm=key;
  a.termReports.push({key,year:game.year,semester,gpa:termGpa,cumulative:game.gpa,courses:{...a.courses}});
  note(semester+' semester grades posted: term GPA '+termGpa.toFixed(2)+', cumulative GPA '+game.gpa.toFixed(2)+'.');
  a.preparedness=cl(a.preparedness+4,0,100);
}
