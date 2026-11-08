/* Gridiron Life v0.5 Part 1 — shared configuration. */

'use strict';
const KEY='gridiron-life-v6',PREVIOUS='gridiron-life-v4',OLD='gridiron-life-v01-save';const R=(a,b)=>Math.floor(a+Math.random()*(b-a+1)),cl=(x,a,b)=>Math.max(a,Math.min(b,x)),pick=a=>a[R(0,a.length-1)],e=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PHASES=[{id:'fall',name:'Fall Season',weeks:16,capacity:30,teamHours:15,school:true},{id:'winter',name:'Winter Offseason',weeks:11,capacity:40,teamHours:5,school:true},{id:'spring',name:'Spring Ball',weeks:9,capacity:30,teamHours:12,school:true},{id:'summer',name:'Summer Break',weeks:13,capacity:65,teamHours:0,school:false},{id:'camp',name:'Preseason Camp',weeks:3,capacity:20,teamHours:25,school:false}];
const GROUPS={RB:[['speed','Speed & Acceleration',['speed','accel']],['agility','Agility & Elusiveness',['agility','elusiveness']],['vision','Vision & Ball Security',['vision','carrying']],['power','Power & Stamina',['power','endurance']],['receiving','Catching & Blocking',['catching','blocking']]],WR:[['speed','Speed & Acceleration',['speed','accel']],['routes','Routes & Release',['routes','release']],['hands','Catching & Security',['catching','carrying']],['agility','Agility & Separation',['agility','elusiveness']],['strength','Strength & Stamina',['power','endurance']]],QB:[['passing','Accuracy & Arm',['accuracy','arm']],['reads','Reads & Awareness',['vision','awareness']],['mobility','Mobility',['speed','agility']],['pocket','Pocket & Security',['carrying','power']],['fitness','Stamina Conditioning',['accel','endurance']]],TE:[['hands','Catching & Routes',['catching','routes']],['blocking','Blocking & Power',['blocking','power']],['speed','Speed & Acceleration',['speed','accel']],['agility','Agility & Release',['agility','release']],['fitness','Stamina & Vision',['endurance','vision']]]};
// Playable football positions; all share the existing permanent 0–99 scale.
const POSITION_FAMILIES={QB:'QB',RB:'RB',FB:'RB',WR:'WR',TE:'TE',LT:'OL',LG:'OL',C:'OL',RG:'OL',RT:'OL',DE:'DL',DT:'DL',NT:'DL',OLB:'LB',ILB:'LB',MLB:'LB',CB:'DB',FS:'DB',SS:'DB',K:'ST',P:'ST',LS:'ST'};
const DEFENSIVE_POSITIONS=['DE','DT','NT','OLB','ILB','MLB','CB','FS','SS'];
const LINEMEN=['LT','LG','C','RG','RT'];
const SPECIAL_POSITIONS=['K','P','LS'];
const baseGroups=GROUPS;
const newGroups={
 OL:[['anchor','Anchor & Strength',['power','blocking']],['feet','Footwork',['agility','accel']],['reads','Protection Reads',['awareness','vision']],['hands','Hand Placement',['release','carrying']],['finish','Stamina Conditioning',['endurance','speed']]],
 DL:[['rush','Pass Rush',['power','accel']],['edge','Disengage & Pursuit',['agility','speed']],['run','Run Defense',['blocking','vision']],['tech','Technique',['awareness','release']],['motor','Stamina Conditioning',['endurance','carrying']]],
 LB:[['tackle','Tackling & Force',['power','blocking']],['pursuit','Pursuit',['speed','accel']],['coverage','Coverage',['agility','awareness']],['reads','Recognition',['vision','catching']],['motor','Stamina Conditioning',['endurance','carrying']]],
 DB:[['coverage','Man Coverage',['agility','release']],['range','Recovery Speed',['speed','accel']],['ball','Ball Skills',['catching','vision']],['tackle','Tackling',['power','blocking']],['reads','Awareness',['awareness','endurance']]],
 ST:[['leg','Power & Accuracy',['power','accuracy']],['timing','Timing',['agility','release']],['focus','Composure',['awareness','vision']],['speed','Athleticism',['speed','accel']],['motor','Consistency',['endurance','carrying']]]
};
for(const [pos,family] of Object.entries(POSITION_FAMILIES))if(!GROUPS[pos])GROUPS[pos]=newGroups[family]||baseGroups.RB;
const ATTRS=[...new Set(Object.values(GROUPS).flatMap(g=>g.flatMap(x=>x[2])))];
const BG=[['working','Working-class household',75,8,'Limited resources; family may need your earnings'],['athletic','Football family',220,14,'Early exposure and higher expectations'],['comfortable','Comfortable household',380,10,'More financial support and academic expectations'],['community','Community-oriented family',125,4,'Supportive neighbors and social connections'],['independent','Independent upbringing',100,5,'More self-direction and responsibility']];
const SCHEMES=[['Wishbone',.80,.45],['Power Run',.72,.62],['Pro Style',.55,.55],['Spread',.41,.60],['Air Raid',.25,.64],['West Coast',.44,.57]];
const NAMES=['Westfield Wolves','Briar Creek Bears','Oak Ridge Eagles','Northgate Knights','Cedar Valley Lions','Red Rock Raiders','Hampton Hawks','Pine Lake Panthers','Summit Tigers','Eastbrook Mustangs'];
const FN=['Marcus','Devon','Andre','Jaylen','Evan','Malik','Cameron','Noah','Tyler','Elijah','Devin','Darius'],LN=['Davis','Walker','Jones','Harris','Thomas','Carter','Brooks','Young','Reed','Turner','Jackson','Williams'];
let game=null,tab='home',draft={name:'Jordan Carter',position:'RB',bg:'working',school:0,points:{},intelligence:50,behavior:50,height:69,weight:155},feedback='';
