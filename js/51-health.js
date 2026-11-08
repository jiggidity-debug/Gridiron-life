/* v0.5 Part 3: health is not an OVR cap. Separate fresh fatigue from cumulative
   contact wear, durable physical traits and actual injuries.
   Values are game-balance rules, not real-world medical predictions. */
function healthState(){
  if(!game.health){
    game.health={wear:0,durability:cl(Math.round(54+(Number(game.attrs?.endurance)||40)*.24),40,89),
      weekReports:[],injuryHistory:[],pendingGameLoad:null,lastGame:null};
  }
  const h=game.health;
  h.wear=Number.isFinite(Number(h.wear))?cl(Number(h.wear),0,100):0;
  h.durability=Number.isFinite(Number(h.durability))?cl(Number(h.durability),1,99):64;
  h.weekReports=h.weekReports||[];h.injuryHistory=h.injuryHistory||[];
  if(!Number.isFinite(Number(game.fatigue)))game.fatigue=0;
  return h;
}
/* The contact burden comes from actual completed plays. Backups and starters with
   the same number of touches get the same offensive-contact exposure. */
function registerGameWorkload(stats,role){
  const h=healthState(),pos=game.pos;
  const touches=(stats.carries||0)+(stats.receptions||0);
  let contacts=(stats.carries||0)*1.05+(stats.receptions||0)*.72;
  if(pos==='QB')contacts=(stats.passAtt||0)*.19+(stats.carries||0)*.9;
  contacts+=(stats.defSnaps||0)*.16+(stats.tackles||0)*.55+(stats.sacks||0)*.7;
  if(pos==='WR'||pos==='TE')contacts+=(stats.targets||0)*.13;
  let raw=(stats.offSnaps||0)*.022+(stats.defSnaps||0)*.034+(stats.stSnaps||0)*.015+contacts*.36;
  h.pendingGameLoad={contacts:Math.round(contacts*10)/10,touches,load:raw,year:game.year,week:game.week};
  h.lastGame={year:game.year,week:game.week,touches,contacts:Math.round(contacts*10)/10};
  return h.pendingGameLoad;
}
/* Weekly sources shown in the UI. Dedicated recovery has diminishing returns;
   normal sleep and ordinary rest are included in natural recovery. */
function impact(){
  const phase=PHASES[game.phase],h=healthState();
  const endurance=cl((Number(game.attrs.endurance)||40)/65,.55,1.55);
  const practiceAllowance=game.injury ? .20 : 1;
  const team=phase.teamHours*(.18+.12*game.teamIntensity)/endurance*practiceAllowance;
  const extra=game.plan.training*(.11+.13*game.extraIntensity)/endurance*practiceAllowance;
  const work=game.job?.physical?game.job.hours*.16:0;
  const contacts=(h.pendingGameLoad?.load||0)/endurance;
  const field=(game.summer?.fieldWorkloadThisWeek||0)/endurance;
  const rehab=game.injury?1.1:0;
  const natural=5.3*cl(.82+game.morale/340-game.stress/400,.55,1.1);
  const reserved=cl(Number(game.plan.recovery)||0,0,65);
  const dedicated=(Math.min(reserved,10)*.74+Math.max(0,reserved-10)*.34)*cl(1-game.stress/400,.70,1.05);
  return {team,extra,work,gameLoad:contacts,field,rehab,natural,dedicated,
    change:team+extra+work+contacts+field+rehab-natural-dedicated};
}
function healthWeek(){
  const h=healthState(),before=game.fatigue,wearBefore=h.wear;
  const parts=impact();
  const totalLoad=parts.team+parts.extra+parts.work+parts.gameLoad+parts.field+parts.rehab;
  const peak=cl(Math.round((before+totalLoad)*10)/10,0,100);
  game.fatigue=cl(Math.round((before+parts.change)*10)/10,0,100);
  const contacts=h.pendingGameLoad?.contacts||0;
  const physicallyStrained=cl((before+peak)/130,0,1.4);
  // Contact, injury and prolonged high fatigue accumulate lasting wear. Training
  // by itself produces little wear; breaks permit partial healing, not a reset.
  const contactWear=contacts*.015*(1+physicallyStrained*.55)*(1+(100-h.durability)/240);
  const overloadWear=Math.max(0,game.fatigue-65)*.011;
  const injuryWear=game.injury?.severity?game.injury.severity*.025:0;
  const restHours=cl(Number(game.plan?.recovery||0),0,30);
  const baseRecovery=game.phase===3?.65:game.phase===1?.42:game.phase===2?.13:game.phase===4?.32:.18;
  const wearRecovery=baseRecovery+Math.min(restHours,12)*(game.phase===3||game.phase===1?.075:.025);
  h.wear=cl(Math.round((h.wear+contactWear+overloadWear+injuryWear-wearRecovery)*100)/100,0,100);
  let injuryStatus='None',newInjuryWear=0;
  if(game.injury){
    game.injury.weeks--;
    injuryStatus=game.injury.name+' (rehab)';
    if(game.injury.weeks<=0){
      note('Medical staff cleared you after '+game.injury.name+'. Your long-term wear remains part of your health history.');
      game.injury=null;injuryStatus='Cleared';
    }
  }else{
    const exposure=totalLoad;
    // Injury risk uses peak stress BEFORE weekly rest, so recovery can prevent
    // prolonged fatigue without erasing the risk from this week's contact.
    const fatiguePenalty=peak*.00026;
    const wearPenalty=h.wear*.00032;
    const durabilityFactor=cl(1.42-h.durability/160,.75,1.20);
    const risk=cl((.0015+exposure*.00032+fatiguePenalty+wearPenalty)*durabilityFactor*(game.gearProtection?.75:1),0,.20);
    if(Math.random()<risk){
      const names=['Ankle sprain','Hamstring strain','Shoulder sprain','Knee strain','Wrist sprain'];
      const severity=R(1,3);
      const baseWeeks=severity===1?R(1,2):severity===2?R(2,4):R(4,6);
      const weeks=baseWeeks+(h.wear>65?2:h.wear>35?1:0);
      game.injury={name:pick(names),weeks,severity};
      newInjuryWear=severity*(.8+h.wear/100);
      h.wear=cl(Math.round((h.wear+newInjuryWear)*100)/100,0,100);
      const incident={name:game.injury.name,severity,weeks,year:game.year,phase:PHASES[game.phase].name,week:game.week};
      h.injuryHistory.unshift(incident);
      note('Injury: '+game.injury.name+'. Projected absence '+weeks+' week(s). Training and play are restricted while recovering.');
      profileMilestone('injury-'+game.year+'-'+game.week+'-'+game.injury.name,'Injury: '+game.injury.name,'Medical record: '+weeks+' estimated recovery week(s) in Year '+game.year+'.',{snapshot:true});
      injuryStatus=game.injury.name+' ('+weeks+' weeks)';
    }
  }
  h.weekReports.unshift({year:game.year,phase:PHASES[game.phase].name,week:game.week,
    before:Math.round(before*10)/10,peak,after:game.fatigue,team:+parts.team.toFixed(1),extra:+parts.extra.toFixed(1),work:+parts.work.toFixed(1),
    game:+parts.gameLoad.toFixed(1),field:+parts.field.toFixed(1),natural:+parts.natural.toFixed(1),dedicated:+parts.dedicated.toFixed(1),
    wearBefore,wearAfter:h.wear,contacts,injuryStatus,
    contactWear:+contactWear.toFixed(3),overloadWear:+overloadWear.toFixed(3),
    injuryWear:+(injuryWear+newInjuryWear).toFixed(3),wearRecovery:+wearRecovery.toFixed(3)});
  h.weekReports=h.weekReports.slice(0,100);
  h.pendingGameLoad=null;
  return h.weekReports[0];
}
