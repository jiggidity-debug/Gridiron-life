// Run from any directory: node tests/smoke-test.js
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
function sandbox(prefill = {}){
  const elements=new Map(),store=new Map(Object.entries(prefill));
  function getElementById(id){
    if(!elements.has(id)){
      let value='38';
      if(id==='name')value='Jordan Carter';
      if(id==='position')value='RB';
      if(id==='bg')value='working';
      if(id==='school')value='0';
      if(id==='heightFeet')value='5';
      if(id==='heightInches')value='9';
      if(id==='weight')value='155';
      if(id==='a_iq'||id==='a_behavior')value='50';
      elements.set(id,{value,innerHTML:'',textContent:'',style:{}});
    }
    return elements.get(id);
  }
  const ctx=vm.createContext({
    console,Math,
    document:{getElementById},
    localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},
    alert:s=>{throw new Error('Unexpected alert: '+s)},
    confirm:()=>true,
  });
  for(const name of fs.readdirSync(path.join(root,'js')).filter(n=>n.endsWith('.js')).sort()){
    vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),ctx,{filename:name});
  }
  function evalJs(s){return vm.runInContext(s,ctx)}
  function snap(){return JSON.parse(JSON.stringify(evalJs('game')))}
  return {ctx,store,getElementById,evalJs,snap};
}


let t=sandbox();
t.evalJs('schools[0].classif=6;start()');
let g=t.snap();
assert.match(t.evalJs('lifeScreen()'),/Money & choices/);
assert.match(t.evalJs('lifeScreen()'),/Academics & tutoring/);
const gpaAtStart=g.gpa;
t.evalJs('game.plan.study=0;applyAcademicsWeek()');
assert.equal(t.snap().gpa,gpaAtStart,'GPA stays unchanged during active term');
t.evalJs('finalizeSemester("Fall")');
assert.equal(t.snap().academics.termReports.length,1);
assert.equal(t.snap().academics.completedTerms,1);
let gpaAfterTerm=t.snap().gpa;
t.evalJs('game.phase=3;applyAcademicsWeek()');
assert.equal(t.snap().gpa,gpaAfterTerm,'GPA frozen in summer');
t.evalJs('game.phase=0;game.plan.study=6;scheduleTutoring()');
assert(t.snap().academics.tutoring.active);
const beforeSessions=t.snap().academics.tutoring.sessions;
t.evalJs('applyAcademicsWeek()');
assert.equal(t.snap().academics.tutoring.sessions,beforeSessions+1);
assert.equal(t.snap().gpa,gpaAfterTerm,'Tutoring does not instantly change GPA');
const startBalance=t.snap().money;
t.evalJs('buyItem("books")');
assert.equal(t.snap().money,startBalance-45);
assert.equal(t.snap().academics.studySuppliesTerm,'1-Fall');
const budgetBeforeGig=t.evalJs('allHours()');
t.evalJs('gig()');
assert.equal(t.evalJs('allHours()'),budgetBeforeGig+3,'Gig reserves three hours in the current week');
let balance=t.snap().money;
t.evalJs('buyItem("books")');
assert.equal(t.snap().money,balance,'Can only buy supplies once per term');
t.evalJs('game.money=500;game.plan.training=1;game.plan.study=6;game.plan.recovery=6;game.plan.social=0;game.plan.work=0;game.activityHoursThisWeek=0;game.gigHoursThisWeek=0');
t.evalJs('buyItem("gear")');
assert.equal(t.snap().gearProtection,1);
assert.equal(t.snap().money,375);
t.evalJs('buyItem("gear")');
assert.equal(t.snap().money,375,'Cannot buy durable equipment twice');
t.evalJs('game.plan.training=1;game.plan.study=6;game.plan.recovery=6;game.plan.social=0;game.plan.work=0;offerJob(0)');
assert.equal(t.snap().job.hours,12);
assert.equal(t.evalJs('allHours()'),25);
t.evalJs('game.phase=0;game.week=5;game.gamePending=false;game.scheduledEvent=null;let was=game.money;applyWeek()');
assert.equal(t.snap().money,495,'Recurring job pays once per week');
assert.equal(t.snap().gigHoursThisWeek,0,'Gig allocation clears after the week');
t.evalJs('game.scheduledEvent=null;game.eventCount=2;game.yearWeeks=19;game.academics.courses.Mathematics=60;game.eventLast={};maybeEvent()');
assert.equal(t.snap().scheduledEvent.kind,'academic','Academic warning requires an actual low course grade');
t.evalJs('chooseEvent(0)');
assert(t.snap().academics.tutoring.active);
assert.equal(t.snap().scheduledEvent,null);
// Behavior and pressure should respond to workload without changing the available time cap.
t.evalJs('game.stress=10;game.teamIntensity=4;game.extraIntensity=4;game.job=null;game.plan.training=20;game.plan.recovery=0;game.plan.social=0;game.plan.study=0;let previous=game.stress;applyWeek()');
assert(t.snap().stress>10,'Intense schedule raises stress');
console.log('PASS: Semester GPA, summer freeze, tutoring, spending limits, gig hours, weekly wages, context-aware events, workload stress.');
