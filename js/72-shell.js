/* Part 8.3: fixed mobile-game shell. Game simulation is unchanged. */
(function(){
 const previous=render;
 let lastTab=null,lastStage=null,scrolls={};
 function shell(){
  const host=document.getElementById('app');
  if(!host||!game){document.body?.classList?.remove('game-shell-active');return;}
  if(typeof host.querySelector!=='function'||!document.body?.classList)return;
  const stage=game.stage||'highschool';
  const bar=host.querySelector(':scope > .bar');
  const primary=host.querySelector(':scope > .tabs');
  const second=host.querySelector(':scope > .subtabs');
  if(!bar || !primary){document.body.classList.remove('game-shell-active');return;}
  document.body.classList.add('game-shell-active');
  const prior=host.querySelector('.shell-scroll');
  if(prior)scrolls[lastStage+'|'+lastTab]=prior.scrollTop;
  // Keep only selected gameplay section in the middle; remove duplicated
  // oversized summary from the header without modifying the underlying data.
  const name=host.querySelector(':scope > h1');
  const stats=host.querySelector(':scope > .stats');
  const fixedHeader=document.createElement('header');fixedHeader.className='shell-header';
  const top=bar.cloneNode(true);top.classList.add('shell-topline');fixedHeader.appendChild(top);
  if(name){const who=document.createElement('div');who.className='shell-player-name';who.textContent=name.textContent.trim();fixedHeader.appendChild(who);name.remove();}
  if(stats){const summary=document.createElement('div');summary.className='shell-quickstats';
    Array.from(stats.children).slice(0,5).forEach(tile=>{let value=tile.querySelector('.num')?.textContent||'';let label=tile.querySelector('small')?.textContent||'';const span=document.createElement('span');span.innerHTML='<strong></strong><small></small>';span.querySelector('strong').textContent=value;span.querySelector('small').textContent=label;summary.appendChild(span);});fixedHeader.appendChild(summary);stats.remove();}
  bar.remove();
  const bottom=document.createElement('nav');bottom.className='shell-bottom';bottom.setAttribute('aria-label','Main navigation');
  Array.from(primary.querySelectorAll('button')).forEach(button=>{
    const b=button.cloneNode(true);b.classList.toggle('selected',button.classList.contains('active'));
    const label=b.textContent.trim();b.innerHTML='';
    const ico=document.createElement('span');ico.className='shell-icon';ico.textContent=({Home:'⌂',Career:'🏈','Player Profile':'♙',Team:'♜',Development:'↗',Life:'♥',Offseason:'☀',Recruiting:'★',History:'▤','College Football':'🏈','History / Save':'▤','Recruiting & Signing':'★','High School Profile':'♙'}[label]||'•');
    const txt=document.createElement('span');txt.textContent=label;b.append(ico,txt);
    b.addEventListener('click',()=>{if(button.onclick)button.onclick();else button.click();});
    bottom.appendChild(b);
  });primary.remove();
  const middle=document.createElement('div');middle.className='shell-middle';
  if(second){second.remove();second.classList.add('shell-section-tabs');middle.appendChild(second);}
  const scroller=document.createElement('div');scroller.className='shell-scroll';
  while(host.firstChild){scroller.appendChild(host.firstChild);}
  middle.appendChild(scroller);
  host.append(fixedHeader,middle,bottom);
  // The report area alone scrolls; changing section resets position.
  const changed=lastTab!==tab || lastStage!==stage;
  scroller.scrollTop=changed?0:(scrolls[stage+'|'+tab]||0);
  lastTab=tab;lastStage=stage;
  if(second){second.addEventListener('click',e=>{if(e.target.closest('.subtab'))scrolls[stage+'|'+tab]=0;});}
 }
 render=function(){previous();shell();};
})();
