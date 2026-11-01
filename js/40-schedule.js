/* Gridiron Life modular base — 40-schedule.js. Current game mechanics match v0.4. */

function hoursCap(){return PHASES[game.phase].capacity}

function used(){return Object.values(game.plan).reduce((a,b)=>a+b,0)}

function focusTotal(){return Object.values(game.focus).reduce((a,b)=>a+b,0)}

function sumHours(){return game.plan.work+(game.job?.hours||0)}

function alloc(k,n){if(!game)return;let old=game.plan[k],max=hoursCap()-(used()-old)-(game.job?.hours||0)-(game.gigHoursThisWeek||0)-(game.activityHoursThisWeek||0)-sevensWeeklyHours();game.plan[k]=cl(n,k==='work'?0:0,Math.max(0,max));if(k==='training'&&focusTotal()>game.plan.training){let surplus=focusTotal()-game.plan.training;for(let key of Object.keys(game.focus).reverse()){let d=Math.min(game.focus[key],surplus);game.focus[key]-=d;surplus-=d;if(!surplus)break}}persist();render()}

function setFocus(k,n){let other=focusTotal()-game.focus[k];game.focus[k]=cl(n,0,Math.max(0,game.plan.training-other));persist();render()}

function setIntensity(k,n){game[k]=n;persist();render()}

function allHours(){return used()+(game.job?.hours||0)+(game.gigHoursThisWeek||0)+(game.activityHoursThisWeek||0)+sevensWeeklyHours()}
