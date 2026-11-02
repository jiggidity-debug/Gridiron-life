/* Gridiron Life v0.5 Part 8.2 — nested section tabs, no game-state changes. */
(function(){
let chosen=0,previousTab=null,previousStage=null;
const baseRender=render;
globalThis.chooseSubtab=function(index){chosen=index;render();};
function enhance(){
 const host=document.getElementById('app');if(!game||!host||!host.children)return;
 const stage=game.stage||'highschool';
 if(previousTab!==tab||previousStage!==stage){chosen=0;previousTab=tab;previousStage=stage;}
 const sections=Array.from(host.children).filter(x=>x.matches('section.panel'));
 if(sections.length<2)return;
 if(chosen>=sections.length)chosen=0;
 const tabs=document.createElement('nav');tabs.className='subtabs';tabs.setAttribute('aria-label','Sections in '+tab);
 sections.forEach((section,i)=>{
  let name=section.querySelector(':scope > h2')?.textContent?.trim()||('Section '+(i+1));
  if(tab==='profile'){name=({'Living player biography':'Biography','Current scouting report':'Scouting','Career football statistics':'Stats','Career milestones':'Milestones','Biography archive':'History','Background & school record':'Background'})[name]||name;}
  const btn=document.createElement('button');btn.type='button';btn.className='subtab'+(chosen===i?' selected':'');
  btn.setAttribute('aria-current',chosen===i?'page':'false');btn.textContent=name;
  btn.addEventListener('click',()=>globalThis.chooseSubtab(i));tabs.appendChild(btn);
  if(chosen!==i)section.classList.add('subtab-hidden');
 });
 const mainNav=host.querySelector(':scope > .tabs');
 if(mainNav){mainNav.after(tabs);}else{sections[0].before(tabs);}
}
render=function(){baseRender();enhance();};
})();
