/* v0.5 Part 2: optional purchases and earned-money decisions, no direct OVR boosts. */
const MARKET=[
 {id:'gear',name:'Properly fitted cleats & protective gear',price:125,hours:0,description:'One-time equipment purchase. Small reduction in avoidable practice discomfort and contact risk.',once:true},
 {id:'books',name:'Study materials and practice tests',price:45,hours:1,description:'Academic preparation help for the current school term; does not instantly raise GPA.'},
 {id:'transport',name:'Transportation pass (8 weeks)',price:60,hours:0,description:'Makes getting to tutoring and community opportunities easier.'},
 {id:'social',name:'Weekend outing with friends',price:30,hours:2,description:'Build relationships and reduce stress; takes two hours of free time.'},
 {id:'family',name:'Contribute to household expenses',price:50,hours:0,description:'Support your family and improve the relationship at home.'},
 {id:'clinic',name:'Local football skill clinic',price:95,hours:6,description:'Offseason-only introductory clinic; adds a little position-skill progress, not free OVR.'}
];
function ledgerEntry(type,amount,reason){
  game.ledger=game.ledger||[];
  game.ledger.unshift({year:game.year,phase:PHASES[game.phase].name,week:game.week,type,amount,reason,balance:game.money});
  game.ledger=game.ledger.slice(0,80);
}
function buyItem(id){
  const item=MARKET.find(x=>x.id===id);if(!item)return;
  game.purchases=game.purchases||{};
  if(game.finished){feedback='This high-school career is complete.';render();return}
  if(item.once&&game.purchases[id]){feedback='You already own this equipment.';render();return}
  if(item.id==='books'&&(!PHASES[game.phase].school||academicState().studySuppliesTerm===termKey())){feedback='Study materials can be purchased once per active school term.';render();return}
  if(item.id==='transport'&&(game.transportWeeks||0)>0){feedback='You already have an active transportation pass.';render();return}
  if(item.id==='clinic'&&!([1,2,3,4].includes(game.phase))){feedback='Local skill clinics run in the offseason, spring, summer, or camp—not during fall games.';render();return}
  if((item.id==='social'||item.id==='family')&&game.lastPurchaseWeek?.[id]===game.year+':'+game.yearWeeks){feedback='You already chose this activity this week.';render();return}
  if(game.money<item.price){feedback='Not enough money: '+item.name+' costs $'+item.price+'.';render();return}
  if(allHours()+item.hours>hoursCap()){feedback=item.name+' needs '+item.hours+' uncommitted hours this week.';render();return}
  game.money-=item.price;
  game.activityHoursThisWeek=(game.activityHoursThisWeek||0)+item.hours;
  game.lastPurchaseWeek=game.lastPurchaseWeek||{};game.lastPurchaseWeek[id]=game.year+':'+game.yearWeeks;
  if(item.once)game.purchases[id]=true;
  switch(id){
    case 'gear':game.gearProtection=1;game.morale=cl(game.morale+2,0,100);break;
    case 'books':academicState().studySuppliesTerm=termKey();academicState().preparedness=cl(academicState().preparedness+5,0,100);break;
    case 'transport':game.transportWeeks=8;break;
    case 'social':game.morale=cl(game.morale+4,0,100);game.stress=cl(game.stress-3,0,100);adjustRelationship('teammate',3);break;
    case 'family':adjustRelationship('family',4);game.familyExpect=cl(game.familyExpect-2,0,100);break;
    case 'clinic':{
      const choice=GROUPS[game.pos].slice().sort((a,b)=>((game.focus[b[0]]||0)-(game.focus[a[0]]||0)))[0];
      for(const k of choice[2])game.progress[k]=(game.progress[k]||0)+3;
      game.morale=cl(game.morale+1,0,100);break;
    }
  }
  ledgerEntry('expense',item.price,item.name);
  note('Spent $'+item.price+' on '+item.name+'. '+item.description);
  persist();render();
}
