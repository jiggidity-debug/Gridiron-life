/* v0.5 Part 2: jobs consume calendar hours; a gig cannot be repeated for unlimited free cash. */
function offerJob(id){
  const jobs=[{title:'Grocery clerk',hours:12,rate:10,physical:false},{title:'Restaurant worker',hours:10,rate:11,physical:true},{title:'Neighborhood yardwork',hours:8,rate:14,physical:true}];
  const j=jobs[id];if(!j)return;
  if(game.job){feedback='Quit your current recurring job before accepting another.';render();return}
  if(allHours()+j.hours>hoursCap()){feedback='Not enough free hours for this recurring job. Reduce your weekly commitments first.';render();return}
  game.job=j;note('Accepted '+j.title+': '+j.hours+' hours each week at $'+j.rate+'/hour. Work hours now count toward your weekly time budget.');persist();render();
}
function leaveJob(){if(!game.job)return;let title=game.job.title;game.job=null;note('Resigned from '+title+'.');persist();render()}
function gig(){
  const time=3;
  if(allHours()+time>hoursCap()){feedback='You need three uncommitted hours for a gig this week.';render();return}
  const cash=R(24,50);game.gigHoursThisWeek=(game.gigHoursThisWeek||0)+time;game.money+=cash;
  game.stress=cl(game.stress+1.5,0,100);
  ledgerEntry('income',cash,'Neighborhood gig (3h)');
  note('Completed a neighborhood gig for $'+cash+'. Three hours are now reserved this week.');persist();render();
}
