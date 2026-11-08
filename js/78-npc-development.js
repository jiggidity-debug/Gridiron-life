/* v0.601 NPC weekly development. Does not reroll existing save characters. */
'use strict';
const npcPrevApplyWeek=applyWeek;
applyWeek=function(){
 const active=Boolean(game&&game.stage!=='college'&&game.stage!=='nfl'&&game.stage!=='recruiting');
 if(active)npcDevelopWeek(game.school);
 return npcPrevApplyWeek();
};
