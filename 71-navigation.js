/* Part 8.9.3: hybrid category buttons -> expandable section buttons.
   Navigation-only state: never changes career data or the simulator. */
(function () {
  let selected = 0, groupOpen = '', lastKey = '';
  const oldRender = render;
  const aliases = {
    'Living player biography':'Biography','Current scouting report':'Scouting',
    'Career football statistics':'Stats','Career milestones':'Milestones',
    'Biography archive':'History','Background & school record':'Background'
  };
  function titleFor(section) {
    const title=section.querySelector(':scope > h2')?.textContent?.trim() || 'Section';
    return aliases[title] || title;
  }
  function category(page, name) {
    const h=name.toLowerCase();
    if(page==='team'||page==='college') {
      if(/coach|philosophy|usage|trust|development & money/.test(h))return /development & money/.test(h)?'Management':'Coach';
      if(/depth|room|squad|position|two-way|ironman|redshirt/.test(h))return 'Depth Chart';
      if(/standing|records|competition|schedule|playoff|district|conference|opponent|bowl/.test(h))return 'Competition';
      if(/stat|game log|history|news|gazette|alumni/.test(h))return 'Team Stats';
      if(/transfer|eligib/.test(h))return 'Management';
      return 'Overview';
    }
    if(page==='profile'){
      if(/biograph|profile|background|scout|athlete/.test(h))return 'Biography & Scouting';
      if(/stat|milestone|archive|history|game/.test(h))return 'Stats & History';
      return 'Attributes';
    }
    if(page==='develop'){
      if(/train|practice|focus|skill|attribute|availability|weekly/.test(h))return 'Training';
      if(/injur|health|condition|recovery|fatigue|wear/.test(h))return 'Health';
      return 'Development';
    }
    if(page==='life'){
      if(/academ|school|gpa|eligib/.test(h))return 'Academics';
      if(/money|nil|job|career|work|finance|econom/.test(h))return 'Finances';
      if(/health|stress|recovery|equip|gear/.test(h))return 'Health & Gear';
      return 'Life';
    }
    if(page==='career'){
      if(/game|match|opponent/.test(h))return 'Game Day';
      if(/award|milestone|history|activity/.test(h))return 'Career Record';
      return 'Career';
    }
    if(page==='recruiting'){
      if(/ranking|top 250|prospect/.test(h))return 'Rankings';
      if(/offer|program|scholarship|recruit/.test(h))return 'Offers & Schools';
      return 'News';
    }
    if(page==='home')return 'Dashboard';
    if(page==='history')return 'Records & Saves';
    if(page==='summer')return /seven|camp|combine|event/.test(h)?'Activities':'Offseason';
    return 'Overview';
  }
  function makeCoachSections(host) {
    if(tab!=='team')return;
    const college=game.stage==='college'||game.stage==='collegeComplete';
    const c=college&&typeof collegeState==='function'?collegeState():null;
    const school=college?(c?.program||{}):(game.school||{});
    function add(name, body){const p=document.createElement('section');p.className='panel';const h=document.createElement('h2');h.textContent=name;p.appendChild(h);const b=document.createElement('div');b.innerHTML=body;p.appendChild(b);host.appendChild(p);}
    const clean=(v)=>String(v??'Not specified').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
    const offense=school.scheme||'Not specified',defense=school.defense||'Not specified';
    add('Coach · Philosophy','<p><strong>Offensive scheme:</strong> '+clean(offense)+'</p><p><strong>Defensive scheme:</strong> '+clean(defense)+'</p>'+(!college&&Number.isFinite(school.runRate)?'<p><strong>Run preference:</strong> '+Math.round(school.runRate*100)+'%</p>':'')+'<p class="muted">These are the actual program scheme settings, not a promise of specific plays or position-specific trust.</p>');
    let usage='';
    if(college&&typeof collegeDepth==='function'){const d=collegeDepth();usage='<p><strong>Your current role:</strong> '+clean(d.role)+' · #'+clean(d.rank)+' at '+clean(game.pos)+'</p>';}
    else if(typeof depth==='function'){const d=depth();usage='<p><strong>Your current role:</strong> '+clean(d.role)+' · '+clean(d.level)+' · #'+clean(d.rank)+' at '+clean(game.pos)+'</p>';}
    add('Coach · Player Usage',usage+'<p class="muted">Current role and position room. Specialist-package usage and position-specific coach trust are planned for a future simulation update.</p>');
    add('Coach · Trust',!college&&Number.isFinite(game.coachTrust)?'<p><strong>General coach trust:</strong> '+Math.round(game.coachTrust)+'/100</p>':'<p>Position-specific trust has not been implemented for this stage.</p>');
  }
  function build() {
    const host=document.getElementById('app');
    if(!game||!host||typeof host.querySelectorAll!=='function')return;
    const key=(game.stage||'highschool')+'|'+tab;
    if(key!==lastKey){selected=0;groupOpen='';lastKey=key;}
    makeCoachSections(host);
    const sections=[...host.children].filter(x=>x.matches('section.panel'));
    if(sections.length<2)return;
    selected=Math.min(selected,sections.length-1);
    const groups=new Map();
    sections.forEach((s,i)=>{const cat=category(tab,titleFor(s));if(!groups.has(cat))groups.set(cat,[]);groups.get(cat).push({section:s,index:i,title:titleFor(s)});});
    const names=[...groups.keys()];
    const activeName=names.find(k=>groups.get(k).some(x=>x.index===selected))||names[0];
    if(!groupOpen||!groups.has(groupOpen))groupOpen=activeName;
    const nav=document.createElement('nav');nav.className='hybrid-nav';nav.setAttribute('aria-label','Sections in '+tab);
    const categoryGrid=document.createElement('div');categoryGrid.className='hybrid-categories';nav.appendChild(categoryGrid);
    const sub=document.createElement('div');sub.className='hybrid-subsections';nav.appendChild(sub);
    function display(index){selected=index;const cat=names.find(n=>groups.get(n).some(x=>x.index===index));groupOpen=cat||groupOpen;sections.forEach((s,i)=>{s.classList.toggle('subtab-hidden',i!==selected);});draw();}
    function draw(){
      categoryGrid.replaceChildren();sub.replaceChildren();
      names.forEach(name=>{const b=document.createElement('button');b.type='button';b.className='hybrid-category'+(groupOpen===name?' selected':'');b.textContent=name;b.setAttribute('aria-expanded',groupOpen===name?'true':'false');b.addEventListener('click',()=>{if(groupOpen===name){groupOpen='';}else{groupOpen=name;const first=groups.get(name)[0];selected=first.index;sections.forEach((s,i)=>s.classList.toggle('subtab-hidden',i!==selected));}draw();});categoryGrid.appendChild(b);});
      if(!groupOpen){sub.hidden=true;return;}
      sub.hidden=false;
      const wrap=document.createElement('div');wrap.className='hybrid-detail-buttons';
      groups.get(groupOpen).forEach(({index,title})=>{const b=document.createElement('button');b.type='button';b.className='subtab'+(selected===index?' selected':'');b.textContent=title;b.setAttribute('aria-current',selected===index?'page':'false');b.addEventListener('click',()=>display(index));wrap.appendChild(b);});
      sub.appendChild(wrap);
    }
    sections.forEach((s,i)=>s.classList.toggle('subtab-hidden',i!==selected));
    draw();
    const primary=host.querySelector(':scope > .tabs');
    if(primary)primary.after(nav);else sections[0].before(nav);
    globalThis.chooseSubtab=display;
  }
  render=function(){oldRender();build();};
})();
