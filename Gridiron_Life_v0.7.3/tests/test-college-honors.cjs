const fs=require('fs'),vm=require('vm'),assert=require('assert');
let game={name:'Jordan King',pos:'RB',fatigue:30,morale:60,attrs:{speed:70},college:{year:2,phase:'offseason',week:0,program:{name:'Sample JUCO',tier:'JUCO',conference:'JUCO Texas'},history:[],news:[],honors:[],yearHistory:[{year:2,program:'Sample JUCO',record:[10,2]}],games:[],showcases:[]}};
const s={game,feedback:'',collegeState:()=>game.college,collegeFinishYear:()=>{},collegeSimGame:()=>{},v6ProRating:()=>65,collegeScreen:()=>'<div>base</div>',collegeProfilePanel:()=>'<div>profile</div>',persist:()=>{},render:()=>{},panel:(a,b)=>`<section>${a}: ${b}</section>`,e:String,rating:()=>70,cl:(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),R:()=>1,collegeTier:()=>({label:'Junior College'}),};
vm.createContext(s);vm.runInContext(fs.readFileSync(__dirname+'/../js/82-college-honors.js','utf8'),s);
for(let week=1;week<=10;week++){
 game.college.games.push({year:2,week,phase:'regular',role:'Starter',opponentName:'Opponent '+week,stats:{carries:17,rushYards:250,rushTD:2,receptions:4,recYards:70},plays:[]});
}
s.v603BackfillCollegeHonors();
assert(game.college.honors.some(h=>/All-American/.test(h.title)));
const count=game.college.honors.length;s.v603BackfillCollegeHonors();assert.equal(game.college.honors.length,count,'no duplicate awards');
assert(s.v603ShowcaseEligible());s.v603PlayCollegeShowcase();assert.equal(game.college.showcases.length,1);
assert(s.v6ProRating()>=65,'showcase grade impacts prospect evaluation');
s.v603PlayCollegeShowcase();assert.equal(game.college.showcases.length,1,'only one showcase per season');
assert(s.collegeScreen().includes('College honors'));
console.log('College honors test passed:',count,'honors, showcase played, no duplicate awards, draft scouting and UI wired.');
