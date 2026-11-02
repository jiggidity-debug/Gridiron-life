/* Part 8.6: optional help, concise panels, no gameplay state changes. */
(function(){
 const prior=render;
 const helpHints={
  'Career wear':'Long-term physical strain that heals more slowly than fatigue.',
  'Physical health':'Fatigue is temporary. Wear builds through workload, while recovery reduces it gradually.',
  'Weekly availability':'Allocate available hours across training, study, work, social life and recovery. Team practice uses its own mandatory hours.',
  'Team practice':'Your effort affects development, stress and fatigue.',
  'Individual training':'Allocate extra-training hours to specific skills. Progress applies when you advance the week.',
  'Squad placement':'Select your preferred squad, subject to grade eligibility and coach decisions. Coaches rank players on ability and fit; a higher-rated player can win a starting job. Dual duty does not guarantee snaps.',
  'Current scouting report':'Scouting combines your current ability, position and competition level; demonstrated results are reported separately.',
  'Living player biography':'The biography changes from your recorded development, statistics and achievements. No accomplishments are fabricated.',
  'Career football statistics':'Statistics are based on simulated games and are not projections.',
  'Biography archive':'Snapshots preserve past biography versions and cannot reconstruct events that were never saved.',
  'Player attributes':'Your ratings range from 0 to 99. There is no artificial potential ceiling.',
  'District standings':'Standings use district results; top four teams qualify for the fictional state bracket.',
  'Seven-on-seven':'Optional offseason passing competition consumes hours and may build exposure.',
  'Recruiting':'College interest depends on performance, academics, tools and exposure.',
  'Opponent scouting':'Opponent ratings represent program strengths and affect simulated matchups.',
  'Equipment':'Protective gear reduces injury risk; it does not directly raise OVR.'
 };
 function apply(){
  const host=document.getElementById('app');if(!game||!host||typeof host.querySelectorAll!=='function')return;
  const panels=host.querySelectorAll('.panel');
  panels.forEach(panel=>{
   const h=panel.querySelector(':scope > h2');if(!h||h.querySelector('.help-trigger'))return;
   const key=Object.keys(helpHints).find(k=>h.textContent.toLowerCase().includes(k.toLowerCase()));
   const explanatory=[...panel.children].filter(child=>child.tagName==='P'&&(child.classList.contains('muted')||child.textContent.length>125)&&!child.querySelector('button,input,select'));
   // Only move plain instructional paragraphs, never narrative, results, alerts or career history.
   const instructional=explanatory.filter(x=>/(hours|allocate|schedule|affect|tracked|simulat|does not|may |progress|recovery|coach|position|current|eligible|points)/i.test(x.textContent)&&
      !/(injur(?:ed|y) history|played|rushed|passing yards|recruited by|year [0-9]|scored|transferred to)/i.test(x.textContent));
   if(h.textContent.includes('Living player biography'))instructional.length=0;
   if(!key&&!instructional.length)return;
   const help=document.createElement('details');help.className='section-help';
   const summary=document.createElement('summary');summary.setAttribute('aria-label','Help: '+h.textContent.trim());summary.title='More information';summary.textContent='?';help.appendChild(summary);
   const inside=document.createElement('div');inside.className='section-help-body';
   if(key){const p=document.createElement('p');p.textContent=helpHints[key];inside.appendChild(p);}
   instructional.forEach(x=>inside.appendChild(x));
   help.appendChild(inside);h.appendChild(help);
  });
  // Long game journals remain accessible but collapsed until a dedicated section is opened.
 }
 render=function(){prior();apply();};
})();
