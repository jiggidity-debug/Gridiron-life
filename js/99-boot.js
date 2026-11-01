/* v0.5 boot: load its own slot; v0.4 is left intact as rollback backup. */
try{let d=JSON.parse(localStorage.getItem(KEY));if(d?.version===5){game=d;schools=d.schools||schools;if(!d.squadRecords||!d.schedule)repairSeasonData()}}catch(err){console.warn(err)}
migrate();render();
